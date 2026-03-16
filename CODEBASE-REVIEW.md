# Startup Financial Intelligence OS — Codebase Review

## Architecture Overview

The codebase implements a three-layer SaaS platform built on Next.js 14.2, React 18.3, TypeScript, Prisma 5.22 (PostgreSQL), Clerk 5.0 (auth), Stripe 17.0 (billing), and Recharts 2.13 (charts).

**Layer 1 — Public**: Free Survival Predictor tool with lead capture  
**Layer 2 — Founder Dashboard**: Multi-tenant SaaS with financials, health scores, readiness, alerts, reports  
**Layer 3 — Advisory Command Center**: Internal portfolio management for CFOIP advisors

File count: ~95+ source files across `src/`, `prisma/`, and config.

---

## CRITICAL ISSUES (Must fix before deployment)

### 1. Prisma Schema Field Name Mismatches in Clerk Webhook & Onboarding

**Files:** `src/app/api/webhooks/clerk/route.ts`, `src/app/api/onboarding/route.ts`, `src/app/api/settings/team/invite/route.ts`

The User model has `externalId` and `name` fields, but these routes use `clerkId`, `firstName`, and `lastName` which don't exist:

| Code Uses | Schema Has |
|-----------|-----------|
| `clerkId` | `externalId` |
| `firstName` | `name` (single field) |
| `lastName` | `name` (single field) |

The onboarding route also creates `FinancialPeriod` with `headcount` and `CashBalance` with `netChange` — neither field exists in the schema.

**Impact:** Clerk webhook handler and onboarding will crash at runtime. New users cannot be created.

### 2. Eight API Routes Call `resolveTenantContext()` Without Arguments

**Function signature:** `resolveTenantContext(externalUserId: string, requestedCompanyId?: string)`

**Broken routes (all missing `auth()` + userId):**
- `src/app/api/settings/route.ts`
- `src/app/api/settings/company/route.ts`
- `src/app/api/settings/team/invite/route.ts`
- `src/app/api/alerts/route.ts`
- `src/app/api/alerts/[id]/dismiss/route.ts`
- `src/app/api/alerts/dismiss-all/route.ts`
- `src/app/api/reports/route.ts` (both GET and POST)
- `src/app/api/billing/portal/route.ts`

**Impact:** These routes will throw a runtime error. Settings, alerts, reports, and billing portal are all broken.

### 3. Four Permission Strings Don't Exist

| Route | Uses | Should Be |
|-------|------|-----------|
| `settings/team/invite` | `"team:write"` | `"team:invite"` |
| `reports/route.ts` POST | `"reports:write"` | `"reports:create"` |
| `alerts/[id]/dismiss` | `"alerts:write"` | `"alerts:dismiss"` |
| `alerts/dismiss-all` | `"alerts:write"` | `"alerts:dismiss"` |

**Impact:** Permission checks always return `false` → these actions are blocked for all users.

### 4. AdvisoryCase `status` Field Case Mismatch

Schema default: `@default("active")` (lowercase string)  
Code comparison: `c.status === "ACTIVE"` (uppercase in advisory dashboard)

**Impact:** Active case count always shows 0 on the advisory dashboard.

### 5. Missing `nextReviewDate` Field on AdvisoryCase

The schema has `lastReviewedAt` but NOT `nextReviewDate`. However, the advisory dashboard, startups page, and startup-table all reference `nextReviewDate` and `c.nextReviewDate`.

**Impact:** Runtime error when accessing advisory pages. Need to add `nextReviewDate DateTime?` to the AdvisoryCase model.

### 6. Subscription Relation Name (Singular vs Plural)

Schema defines `subscription Subscription?` (singular, one-to-one) on Company.  
Advisory dashboard queries `company.subscriptions` (plural with `take: 1, orderBy`).

**Impact:** Prisma query error on advisory dashboard load.

### 7. Advisory Notes Route Missing Authorization

`src/app/api/advisory/cases/[id]/notes/route.ts` checks `auth()` but does NOT verify advisory role or case access. Any authenticated user can post notes to any advisory case.

**Impact:** Security vulnerability — non-advisory users can write notes to any case.

---

## MODERATE ISSUES (Should fix before production)

### 8. Settings Route Uses Non-Existent Fields

`src/app/api/settings/route.ts` selects `firstName`, `lastName` (don't exist — schema has `name`).  
`src/app/api/settings/company/route.ts` selects `country` which doesn't exist on Company model.

### 9. MISSING_DATA Alert Rule is Dead Code

`alerts-engine.ts` has a `MISSING_DATA` rule that checks `ctx.missingFields.length > 0`, but every caller passes `missingFields: []` (hardcoded empty). The rule can never fire.

### 10. Inconsistent Concentration Risk Scoring

Same input yields different scores between survival engine (linear: `100 - risk*100`) and health engine (step-function with bands). A concentration risk of 0.15 scores 85 in survival but 92.5 in health. This should be documented or unified.

### 11. HIGH_BURN Alert Uses Wrong Metric

The HIGH_BURN alert checks `ctx.grossMargin < -2` as a proxy for "burn rate exceeding revenue by 3x+". But gross margin only measures `(rev-cogs)/rev`, not total burn vs revenue. This could miss high-burn situations where COGS is low but OpEx is massive.

### 12. Missing `next.config` Prisma Output Setting

For deployment to serverless platforms (Vercel), the Prisma client needs `output` configured or the `postinstall` script must run. The `postinstall: "prisma generate"` in package.json handles this, but verify it runs in the target CI/CD.

### 13. No Error/Loading/Not-Found Pages

No `error.tsx`, `loading.tsx`, or `not-found.tsx` files exist anywhere in the app. This means:
- No graceful error boundaries for server component failures
- No loading skeletons during server-side data fetching
- No custom 404 page

---

## MINOR ISSUES / IMPROVEMENTS

### 14. Infinity Handling for Runway

`calcRunway()` returns `Infinity` for cash-flow-positive startups. Some callers clamp to 999, others don't. Standardize to always clamp at the engine level.

### 15. Confidence Flag Treats Zero as Missing

Survival engine flags `monthlyRevenue === 0` as "missing revenue data" rather than recognizing a legitimate pre-revenue startup with zero revenue.

### 16. Billing Portal Response Format Inconsistent

`/api/billing/portal` returns `{ url: portalUrl }` instead of the standard `{ success: true, data: { url } }` format used everywhere else.

### 17. Report Generation Field Names

`src/lib/jobs/report-generation.ts` references `current.headcount` which doesn't exist on `FinancialPeriod`.

### 18. No Rate Limiting on Public API

`/api/survival-predictor` is public and has no rate limiting. Could be abused for spam lead generation or DoS.

---

## WHAT'S WORKING WELL

- **Engine math is correct**: All weight sums verified (survival: 1.0, health: 1.0, readiness: 1.0). Core formulas (runway, burn, margin, growth) are mathematically sound with proper division-by-zero handling.
- **Pre-revenue weight redistribution**: Properly normalizes survival weights when revenue-dependent factors are zeroed.
- **Type system**: Domain types, enums, and API response types are well-structured and consistently used.
- **Shared components**: MetricCard, AlertsList, AdvisoryTaskList, StartupTable, ScoreGauge are properly abstracted and reused.
- **Advisory Command Center**: Complete flow from dashboard → startups → detail → tasks/notes with proper server/client split.
- **Founder Dashboard**: Full implementation with 4 chart types, metric cards, score cards, alerts integration.
- **Middleware**: Clerk middleware properly configured with correct public routes.
- **Prisma Decimal handling**: All Decimal fields properly converted with `Number()` before serialization.

---

## MISSING PIECES FOR MVP COMPLETION

1. **Fix the 7 critical issues above** — without these, the app crashes on most routes.

2. **Add `nextReviewDate` to AdvisoryCase schema** and run `prisma migrate dev`.

3. **Create `next.config.ts` Prisma output config** for serverless deployment.

4. **Add error boundaries**: Create `src/app/error.tsx` (global), `src/app/not-found.tsx`, and `src/app/(platform)/loading.tsx`.

5. **Add seed data**: The seed file exists (`prisma/seed.ts`) — verify it creates test companies, users, financial periods, and advisory cases.

6. **Stripe price IDs**: The `.env.example` has placeholder Stripe price IDs — these need real Stripe products configured.

7. **Background jobs**: `src/lib/jobs/report-generation.ts` exists but there's no job runner (Inngest, BullMQ, or cron). The `.env.example` has Inngest vars commented out.

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
1. Fix all 7 critical issues (schema mismatches, missing auth, permission strings)
2. Run `prisma migrate dev` after schema changes (add `nextReviewDate`)
3. Run `prisma generate` to regenerate client
4. Create `.env.local` with all required values from `.env.example`
5. Verify `npm run build` completes without errors

### Infrastructure Setup
1. **Database**: Provision PostgreSQL (Neon, Supabase, or PlanetScale Postgres)
2. **Clerk**: Create application, configure webhooks pointing to `/api/webhooks/clerk`
3. **Stripe**: Create products + prices, configure webhook pointing to `/api/billing/webhook`
4. **OpenAI**: Get API key for AI commentary feature
5. **Object Storage**: Configure R2/S3 for file uploads (if using upload feature)

### Deployment (Vercel)
1. Connect GitHub repo to Vercel
2. Set all environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set install command: `npm install` (triggers postinstall → prisma generate)
5. Add `DATABASE_URL` to Vercel env vars with connection pooling URL
6. Deploy and verify webhooks are reachable

### Post-Deployment
1. Run `prisma db push` or `prisma migrate deploy` against production DB
2. Optionally run `prisma db seed` for demo data
3. Test Clerk webhook by creating a test user
4. Test Stripe webhook by creating a test subscription
5. Verify all 3 layers work: public predictor, founder dashboard, advisory center
6. Configure Clerk webhook events: `user.created`, `user.updated`, `user.deleted`
7. Set up monitoring/alerting (Vercel Analytics, Sentry, etc.)
