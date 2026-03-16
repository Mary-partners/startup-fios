# Startup Financial Intelligence OS — Production Deployment Guide

**Version:** 1.0.0
**Date:** March 13, 2026
**Author:** CFO Innovation Partners
**Stack:** Next.js 14.2 · React 18.3 · TypeScript 5.6 · Prisma 5.22 · PostgreSQL · Clerk 5 · Stripe 17 · OpenAI 4.70

---

## 1. Production Architecture

```
                    ┌─────────────────────────────┐
                    │        Cloudflare CDN        │
                    │   (DNS, SSL, DDoS, Cache)    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Vercel Edge Network     │
                    │  ┌────────────────────────┐  │
                    │  │  Next.js App (SSR/RSC) │  │
                    │  │  ├─ Server Components  │  │
                    │  │  ├─ API Routes (23)    │  │
                    │  │  ├─ Server Actions     │  │
                    │  │  └─ Middleware (Clerk)  │  │
                    │  └────────────────────────┘  │
                    └───┬────────┬────────┬────────┘
                        │        │        │
           ┌────────────▼─┐  ┌──▼────┐  ┌▼──────────────┐
           │  PostgreSQL   │  │ Clerk │  │ Cloudflare R2  │
           │  (Neon / RDS) │  │ Auth  │  │ Object Storage │
           │  22 models    │  └───────┘  └────────────────┘
           └──────────────┘
                        │
           ┌────────────▼──────────────┐
           │      External Services     │
           │  ┌────────┐ ┌───────────┐ │
           │  │ Stripe │ │  OpenAI   │ │
           │  │Billing │ │ GPT-4o    │ │
           │  └────────┘ └───────────┘ │
           │  ┌────────────────────┐   │
           │  │ Inngest (optional) │   │
           │  │ Background Jobs    │   │
           │  └────────────────────┘   │
           └───────────────────────────┘
```

**Data Flow:**

1. User requests hit Cloudflare CDN → Vercel Edge → Next.js middleware (Clerk auth check)
2. Server Components query PostgreSQL via Prisma, run deterministic calculation engines
3. AI narrative generation calls OpenAI GPT-4o on demand (non-blocking)
4. File uploads go through Server Actions (10MB limit) → Cloudflare R2
5. Stripe webhooks and Clerk webhooks hit designated public API routes
6. Optional Inngest handles background jobs (report generation, alert evaluation)

---

## 2. Environment Variables — Production Template

Create `.env.production` in your deployment environment. **Never commit this file.**

```bash
# ============================================================
# PRODUCTION ENVIRONMENT — Startup Financial Intelligence OS
# ============================================================

# ── Database ──────────────────────────────────────────────────
# Use a connection pooler URL for serverless (Neon/Supabase)
DATABASE_URL="postgresql://user:password@your-db-host:5432/startup_fios?sslmode=require"
# If using Neon, also set the direct URL for migrations:
# DIRECT_URL="postgresql://user:password@your-db-host:5432/startup_fios?sslmode=require"

# ── Clerk Authentication ──────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/app/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/app/onboarding"
CLERK_WEBHOOK_SECRET="whsec_..."

# ── Stripe Billing ────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_STARTER_MONTHLY_PRICE_ID="price_..."
STRIPE_STARTER_YEARLY_PRICE_ID="price_..."
STRIPE_GROWTH_MONTHLY_PRICE_ID="price_..."
STRIPE_GROWTH_YEARLY_PRICE_ID="price_..."

# ── AI / OpenAI ───────────────────────────────────────────────
OPENAI_API_KEY="sk-..."
# Model defaults are set in code (GPT-4o); override if needed:
# OPENAI_MODEL="gpt-4o"

# ── Object Storage (Cloudflare R2 recommended) ────────────────
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="startup-fios-uploads"
S3_REGION="auto"

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://app.yourdomain.com"
NODE_ENV="production"

# ── Background Jobs (Inngest — optional) ──────────────────────
# INNGEST_SIGNING_KEY="signkey-..."
# INNGEST_EVENT_KEY="..."
```

### Required vs. Optional Services

| Service | Required? | Purpose |
|---------|-----------|---------|
| PostgreSQL | **Yes** | All application data — 22 models |
| Clerk | **Yes** | Authentication, user management, webhooks |
| Stripe | **Yes** (for billing) | Subscription management, payment processing |
| OpenAI | **Yes** (for AI features) | Narrative commentary generation |
| Cloudflare R2 / S3 | **Yes** (for uploads) | File storage for uploaded financial documents |
| Inngest | Optional | Background job processing (report generation) |

---

## 3. Database Setup and Migration

### 3.1 Database Provider Selection

**Recommended: Neon PostgreSQL** (serverless, scales to zero, built-in connection pooling)

Alternative options: Supabase PostgreSQL, AWS RDS, Railway, PlanetScale (with Prisma adapter).

### 3.2 Initial Setup

```bash
# 1. Install dependencies
npm ci --production=false

# 2. Generate Prisma client
npx prisma generate

# 3. Create initial migration (first deployment only)
npx prisma migrate dev --name init

# 4. For production, apply migrations
npx prisma migrate deploy

# 5. Seed demo data (optional — for staging/testing)
npm run db:seed
```

### 3.3 Migration Workflow for Updates

```bash
# Development: create migration
npx prisma migrate dev --name describe_change

# Production: apply pending migrations
npx prisma migrate deploy

# Emergency: push schema directly (skip migration history — use sparingly)
npx prisma db push
```

### 3.4 Schema Summary (22 Models)

**Auth & Tenancy:** User, Company, Membership
**Billing:** Subscription
**Financial Data:** FinancialPeriod, RevenueRecord, ExpenseRecord, CashBalance, CogsRecord, CustomerConcentration
**Assessments:** SurvivalAssessment, FinancialHealthScore, InvestorReadinessAssessment, InvestorReadinessAnswer
**Alerts & Reports:** Alert, Report
**Advisory:** AdvisoryCase, AdvisoryNote, AdvisoryTask
**Files & Audit:** UploadedFile, AuditLog
**Lead Capture:** Lead

### 3.5 Database Indexes

The schema includes indexes on all foreign keys and commonly queried columns. For production, also add:

```sql
-- High-traffic query optimization
CREATE INDEX CONCURRENTLY idx_financial_period_company_year_month
  ON "FinancialPeriod" ("companyId", "year" DESC, "month" DESC);

CREATE INDEX CONCURRENTLY idx_alert_company_active
  ON "Alert" ("companyId") WHERE "isDismissed" = false;

CREATE INDEX CONCURRENTLY idx_advisory_task_case_status
  ON "AdvisoryTask" ("advisoryCaseId", "status");
```

---

## 4. Seed Data

The seed script at `prisma/seed.ts` creates demo data. For production, you typically only need the seed for staging/demo environments. Run with:

```bash
npm run db:seed
```

For production, the first real user is created automatically via:
1. User signs up through Clerk → Clerk webhook creates User record
2. User completes onboarding → creates Company, Membership, Subscription, and optional initial FinancialPeriod
3. Advisory cases are created manually by ADMIN/HEAD_OF_ADVISORY users

---

## 5. Hosting Configuration (Vercel)

### 5.1 Vercel Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy to production
vercel --prod
```

### 5.2 vercel.json (if needed)

```json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && next build",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 5.3 Build Command

```bash
npx prisma generate && next build
```

The `postinstall` script in `package.json` already runs `prisma generate`, so on Vercel this happens automatically during `npm ci`.

### 5.4 Environment Variables on Vercel

Add all variables from Section 2 to Vercel Project Settings → Environment Variables. Set scope to "Production" and optionally "Preview" for staging.

---

## 6. Domain and SSL Setup

### 6.1 DNS Configuration

| Record | Name | Value | Proxy |
|--------|------|-------|-------|
| CNAME | `app` | `cname.vercel-dns.com` | Yes (Cloudflare) |
| CNAME | `www` | `cname.vercel-dns.com` | Yes (Cloudflare) |
| A | `@` | Vercel IP | If needed |

### 6.2 Vercel Domain Configuration

```bash
# Add custom domain
vercel domains add app.yourdomain.com

# Verify
vercel domains inspect app.yourdomain.com
```

### 6.3 SSL

Vercel provides automatic SSL via Let's Encrypt. If using Cloudflare as CDN, set SSL mode to **Full (Strict)** to ensure end-to-end encryption.

### 6.4 Clerk Domain Setup

In Clerk Dashboard → Domains, add your production domain and configure the sign-in/sign-up URLs to match your environment variables.

---

## 7. Stripe Configuration

### 7.1 Product and Price Setup

Create the following products and prices in Stripe Dashboard:

| Product | Monthly Price ID | Yearly Price ID | Amount |
|---------|-----------------|-----------------|--------|
| Starter | `price_starter_mo` | `price_starter_yr` | $49/mo or $470/yr |
| Growth | `price_growth_mo` | `price_growth_yr` | $149/mo or $1,430/yr |

Copy each Price ID into the corresponding environment variable.

### 7.2 Webhook Configuration

In Stripe Dashboard → Developers → Webhooks:

1. Add endpoint: `https://app.yourdomain.com/api/billing/webhook`
2. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 7.3 Checkout Metadata

When creating checkout sessions from the app, ensure `metadata.companyId` is set. The billing webhook handler uses this to link subscriptions to companies.

### 7.4 Customer Portal

Enable the Stripe Customer Portal in Dashboard → Settings → Billing → Customer Portal. Configure allowed actions (cancel, update payment method, view invoices).

---

## 8. Object Storage Configuration

### 8.1 Cloudflare R2 (Recommended)

```bash
# Create bucket via Wrangler CLI
wrangler r2 bucket create startup-fios-uploads

# Create API token with read/write access
# Dashboard → R2 → Manage R2 API Tokens
```

Set the following environment variables:
- `S3_ENDPOINT`: Your R2 endpoint (https://accountid.r2.cloudflarestorage.com)
- `S3_ACCESS_KEY_ID`: R2 API token access key
- `S3_SECRET_ACCESS_KEY`: R2 API token secret
- `S3_BUCKET_NAME`: `startup-fios-uploads`
- `S3_REGION`: `auto`

### 8.2 CORS Configuration

Apply CORS rules to allow uploads from your domain:

```json
[
  {
    "AllowedOrigins": ["https://app.yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 9. AI Integration Setup

### 9.1 OpenAI Configuration

The app uses OpenAI GPT-4o for narrative commentary generation. The AI layer is **non-critical** — all calculations are deterministic TypeScript engines. AI provides optional narrative context.

Set `OPENAI_API_KEY` in your environment. The AI client is configured in `src/lib/ai/client.ts`.

### 9.2 Rate Limiting and Cost Control

For production, implement these safeguards:

1. **Usage caps:** Set monthly spending limits in OpenAI Dashboard → Settings → Limits
2. **Request throttling:** The orchestrator in `src/lib/ai/orchestrator.ts` manages AI calls. Consider adding per-company rate limiting
3. **Fallback behavior:** If OpenAI is unavailable, the app functions normally — AI commentary fields are nullable

### 9.3 Estimated AI Costs

| Feature | Frequency | Est. Cost/Company/Month |
|---------|-----------|------------------------|
| Report narrative | 1-4x/month | $0.10–$0.40 |
| Health score commentary | 1x/month | $0.05 |
| Survival assessment narrative | On demand | $0.05/request |
| **Total estimate** | | **$0.20–$0.50/company/month** |

---

## 10. Monitoring, Logging, and Error Tracking

### 10.1 Recommended Monitoring Stack

| Tool | Purpose | Priority |
|------|---------|----------|
| **Vercel Analytics** | Performance, Web Vitals, page views | Included |
| **Sentry** | Error tracking, exception monitoring | High |
| **Axiom / Datadog** | Log aggregation, structured logging | Medium |
| **Uptime Robot / Better Stack** | Uptime monitoring, status page | High |
| **Stripe Dashboard** | Payment monitoring, failed charges | Included |

### 10.2 Sentry Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure in `sentry.client.config.ts` and `sentry.server.config.ts`.

### 10.3 Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
    });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 503 }
    );
  }
}
```

Add `/api/health` to the public routes in `src/middleware.ts`.

### 10.4 Key Metrics to Monitor

- **P95 response time** for `/api/` routes (target: <500ms)
- **Error rate** (target: <0.1%)
- **Database connection pool** utilization
- **Stripe webhook delivery** success rate
- **Clerk webhook** processing time
- **AI API** latency and error rate

---

## 11. Security Checklist

### 11.1 Authentication & Authorization

- [x] Clerk middleware protects all `/app/*` and `/advisory/*` routes
- [x] API routes verify `auth()` and `resolveTenantContext()` before data access
- [x] Role-based permission system with 28 granular permissions across 7 roles
- [x] Advisory routes require `isAdvisoryRole()` check
- [x] Multi-tenant data isolation via `companyId` scoping on all queries
- [ ] **Action required:** Enable Clerk Bot Protection in production
- [ ] **Action required:** Configure Clerk allowed redirect URLs for production domain

### 11.2 API Security

- [x] Stripe webhooks verified via `svix` signature
- [x] Clerk webhooks verified via `svix` signature
- [x] Server Actions have 10MB body size limit
- [ ] **Action required:** Add rate limiting to public API endpoints (`/api/survival-predictor`)
- [ ] **Action required:** Add CSRF protection headers

### 11.3 Data Protection

- [x] All database connections use SSL (`?sslmode=require`)
- [x] Sensitive keys stored in environment variables, never in code
- [x] User deletion (Clerk webhook) clears PII from database
- [ ] **Action required:** Enable database encryption at rest (provider-level)
- [ ] **Action required:** Implement audit log retention policy (90 days recommended)

### 11.4 Infrastructure

- [ ] **Action required:** Enable Vercel Firewall / WAF rules
- [ ] **Action required:** Set Cloudflare security level to "High"
- [ ] **Action required:** Configure Content Security Policy headers
- [ ] **Action required:** Enable HSTS with `includeSubDomains`

### 11.5 Secrets Rotation Schedule

| Secret | Rotation Frequency | Impact of Rotation |
|--------|-------------------|-------------------|
| `DATABASE_URL` | On compromise | Restart required |
| `CLERK_SECRET_KEY` | Annually | Restart required |
| `STRIPE_SECRET_KEY` | Annually | Restart required |
| `OPENAI_API_KEY` | Quarterly | Restart required |
| `CLERK_WEBHOOK_SECRET` | On re-creation | Update webhook in Clerk |
| `STRIPE_WEBHOOK_SECRET` | On re-creation | Update webhook in Stripe |

---

## 12. Performance Checklist

### 12.1 Build Optimization

- [x] Next.js static generation for marketing pages (`/`, `/pricing`)
- [x] Server Components for data-heavy pages (dashboard, advisory)
- [x] Client Components only for interactive elements
- [ ] **Action required:** Enable `next/image` optimization with Vercel
- [ ] **Action required:** Add `loading.tsx` skeleton screens to all page groups

### 12.2 Database Performance

- [x] Prisma connection pooling (automatic with Neon)
- [x] Composite indexes on frequently queried combinations
- [x] `take: 1` with `orderBy` for "latest" queries (avoids full table scans)
- [ ] **Action required:** Set `connection_limit` in DATABASE_URL for serverless (`?connection_limit=10`)
- [ ] **Action required:** Monitor slow queries via database provider dashboard

### 12.3 Caching Strategy

- [ ] **Action required:** Add `Cache-Control` headers to static API responses
- [ ] **Action required:** Implement `revalidatePath()` after mutations for ISR
- [ ] **Action required:** Consider Redis for session/rate-limit caching at scale

### 12.4 Bundle Size

```bash
# Analyze bundle
npm run build
# Check .next/analyze (if next-bundle-analyzer is configured)
```

Key optimization opportunities: lazy-load Recharts, code-split advisory module (admin-only).

---

## 13. Backup and Recovery Strategy

### 13.1 Database Backups

**Neon (recommended):** Automatic point-in-time recovery (PITR) with 7-day retention on Pro plan.

**If using AWS RDS:**
```bash
# Automated daily snapshots (enable in RDS console)
# Manual snapshot before major deployments:
aws rds create-db-snapshot \
  --db-instance-identifier startup-fios \
  --db-snapshot-identifier pre-deploy-$(date +%Y%m%d)
```

### 13.2 File Storage Backups

Cloudflare R2 provides 99.999999999% durability. For additional protection:
- Enable R2 versioning on the bucket
- Set up cross-region replication for disaster recovery

### 13.3 Configuration Backups

```bash
# Export Vercel environment variables
vercel env pull .env.production.backup

# Store securely (encrypted, not in version control)
```

### 13.4 Recovery Procedures

| Scenario | Recovery Time | Procedure |
|----------|--------------|-----------|
| Database corruption | <15 min | Restore from Neon PITR |
| Deployment rollback | <2 min | `vercel rollback` |
| Stripe webhook failure | Self-healing | Stripe retries for 72 hours |
| Clerk sync failure | <5 min | Re-trigger webhook from Clerk dashboard |
| Complete data loss | <1 hour | Restore DB backup + R2 versioned files |

---

## 14. Deployment Steps — Launch Checklist

### Phase 1: Infrastructure Setup (Day 1)

```bash
# 1. Create production database
#    - Sign up for Neon (neon.tech) → Create project → Copy connection string

# 2. Create Clerk production instance
#    - Clerk Dashboard → Create Application (Production mode)
#    - Configure OAuth providers, branding, redirect URLs

# 3. Create Stripe production account
#    - Complete Stripe identity verification
#    - Create products and prices (Starter, Growth)
#    - Configure customer portal

# 4. Create Cloudflare R2 bucket
#    - Cloudflare Dashboard → R2 → Create Bucket
#    - Generate API credentials
```

### Phase 2: Application Deployment (Day 1-2)

```bash
# 1. Clone and configure
git clone <repository-url>
cd startup-fios
npm ci

# 2. Set all environment variables on Vercel
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
# ... (all variables from Section 2)

# 3. Deploy
vercel --prod

# 4. Run database migrations
# Option A: Vercel build command includes migration
# Option B: Run manually via Vercel CLI or dashboard
npx prisma migrate deploy
```

### Phase 3: Webhook Configuration (Day 2)

```bash
# 1. Configure Clerk webhook
#    Endpoint: https://app.yourdomain.com/api/webhooks/clerk
#    Events: user.created, user.updated, user.deleted
#    Copy signing secret → CLERK_WEBHOOK_SECRET

# 2. Configure Stripe webhook
#    Endpoint: https://app.yourdomain.com/api/billing/webhook
#    Events: checkout.session.completed, customer.subscription.updated,
#            customer.subscription.deleted
#    Copy signing secret → STRIPE_WEBHOOK_SECRET

# 3. Test webhooks
#    Clerk: Create a test user → verify it appears in database
#    Stripe: Use Stripe CLI to send test events
stripe trigger checkout.session.completed
```

### Phase 4: Domain and Security (Day 2-3)

```bash
# 1. Add custom domain on Vercel
vercel domains add app.yourdomain.com

# 2. Configure DNS (Cloudflare recommended)
#    CNAME app → cname.vercel-dns.com (proxied)

# 3. Update environment variables
#    NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
#    Update Clerk redirect URLs

# 4. SSL verification
curl -I https://app.yourdomain.com
# Verify: HTTP/2 200, strict-transport-security header present
```

### Phase 5: Monitoring and Go-Live (Day 3)

```bash
# 1. Set up error tracking
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# 2. Create health check endpoint (see Section 10.3)

# 3. Set up uptime monitoring
#    - Configure Uptime Robot or Better Stack
#    - Monitor: https://app.yourdomain.com/api/health
#    - Alert channels: Email, Slack

# 4. Create status page (optional)
#    - Better Stack or Instatus

# 5. Smoke tests
#    - [ ] Landing page loads
#    - [ ] Sign up flow works
#    - [ ] Onboarding creates company + subscription
#    - [ ] Dashboard loads with empty state
#    - [ ] Financial data entry works
#    - [ ] Survival predictor (public) works
#    - [ ] Alerts generate correctly
#    - [ ] Stripe checkout completes
#    - [ ] Billing portal opens
#    - [ ] Advisory section loads (for advisory roles)
#    - [ ] File upload works
#    - [ ] Settings page loads and saves

# 6. Go live!
#    - Remove any "beta" flags
#    - Update Clerk to production mode
#    - Switch Stripe to live mode
#    - Announce to users
```

---

## 15. Post-Launch Operations

### Daily

- Check Sentry for new errors
- Review Stripe failed payment alerts
- Monitor database connection pool health

### Weekly

- Review Vercel Analytics for performance regression
- Check AI API costs in OpenAI dashboard
- Review audit logs for suspicious activity

### Monthly

- Rotate API keys if needed
- Review and apply dependency updates (`npm audit`)
- Database maintenance (vacuum, index optimization — handled by Neon automatically)
- Review and archive old audit logs

### Quarterly

- Full security audit
- Load testing with production-like data
- Disaster recovery drill (test backup restoration)
- Review and update this deployment guide

---

## Appendix A: Codebase Statistics

| Metric | Count |
|--------|-------|
| Source files (`.ts` / `.tsx`) | 117 |
| API routes | 23 |
| Page components | 19 |
| Prisma models | 22 |
| User roles | 7 |
| Permissions | 28 |
| Calculation engines | 3 (Survival, Health, Readiness) |

## Appendix B: Port and URL Reference

| Service | Development | Production |
|---------|------------|------------|
| Next.js App | `http://localhost:3000` | `https://app.yourdomain.com` |
| Prisma Studio | `http://localhost:5555` | N/A |
| PostgreSQL | `localhost:5432` | Provider-managed |
| Stripe Webhook | `stripe listen --forward-to localhost:3000/api/billing/webhook` | Configured in Stripe Dashboard |

## Appendix C: Useful Commands

```bash
# Development
npm run dev                          # Start dev server
npm run db:studio                    # Open Prisma Studio
npx prisma migrate dev --name xyz    # Create migration

# Production
npm run build                        # Build for production
npx prisma migrate deploy            # Apply migrations
npm run db:seed                      # Seed demo data

# Debugging
npx prisma db pull                   # Introspect existing DB
vercel logs --follow                 # Tail production logs
stripe logs tail                     # Tail Stripe events
```
