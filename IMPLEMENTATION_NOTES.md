# Implementation Notes — Startup Financial Intelligence OS

## Assumptions Made

1. **Clerk for Auth**: Clerk provides the fastest path to production-grade auth with organization support. The Clerk org model maps well to our Company/Membership model. On sign-up, we sync the Clerk user to our User table and create a Company + Membership.

2. **Vercel + Neon PostgreSQL**: The stack is optimized for Vercel deployment. Neon provides serverless PostgreSQL with branching. Alternative: Supabase.

3. **OpenAI for AI**: MVP uses OpenAI's GPT-4o for commentary generation. The `aiCompletion()` wrapper can be swapped to Anthropic's Claude SDK with minimal changes.

4. **Simple Background Jobs**: Instead of a full Inngest setup for MVP, the event system uses a simple in-process async dispatcher. For production, swap to Inngest or Vercel's built-in cron + QStash.

5. **Single-Company MVP**: While the data model supports multi-company membership, the MVP UI assumes most users belong to one company. Multi-company switching can be added to the header later.

## What's Fully Implemented (Code Complete)

- [x] Complete Prisma schema (21 models, all enums)
- [x] Survival Predictor engine with full scoring, banding, weighting, and edge-case handling
- [x] Financial Health Score engine with 6 sub-scores
- [x] Investor Readiness engine with 18 questions across 7 categories
- [x] Alerts engine with 7 rule types and severity handling
- [x] Individual metric calculators (burn, runway, growth, margin, concentration)
- [x] Role-based permission system (7 roles, 25+ permissions)
- [x] Feature gating system tied to subscription tiers
- [x] 4 plan definitions (Free, Starter, Growth, Enterprise)
- [x] Stripe webhook handler
- [x] Zod validation schemas for all input forms
- [x] Full TypeScript type system (domain types, API types, enums)
- [x] AI prompt templates (commentary, board pack, alert narrative)
- [x] AI orchestration pipeline (deterministic calc → AI narrative)
- [x] API routes: survival-predictor, financials, health-score, investor-readiness, ai/commentary, billing/webhook
- [x] Landing page
- [x] Survival Predictor form + results page
- [x] Pricing page
- [x] Founder dashboard (server component + client component)
- [x] Advisory Command Center startup list + detail view
- [x] Public + Platform layouts with navigation
- [x] Auth middleware with route protection
- [x] Seed data with 6 months of financial data
- [x] Background job scaffolding (report generation, alert evaluation)

## What Needs Implementation Next (Priority Order)

### Sprint 1: Core Flow (Days 1-5)
1. **Clerk webhook sync** — Create `/api/webhooks/clerk` to sync Clerk users to the User table on sign-up
2. **Onboarding flow** — `/app/onboarding` page that creates a Company + Membership + Subscription
3. **Financial data entry page** — `/app/financials` with the quick entry form and full period form
4. **Root layout + globals.css** — Create `src/app/layout.tsx` with Clerk provider and Tailwind styles
5. **Clerk sign-in/sign-up pages** — Configure Clerk's hosted pages or custom sign-in/sign-up components

### Sprint 2: Scores & Reports (Days 6-10)
6. **Health Score page** — `/app/health-score` displaying sub-scores with radar/bar chart
7. **Investor Readiness page** — `/app/investor-readiness` with the full question form and results
8. **Reports page** — `/app/reports` with report list and generation trigger
9. **Alerts page** — `/app/alerts` with dismissal functionality
10. **Settings page** — `/app/settings` with company profile, team management, billing portal link

### Sprint 3: AI & Advisory (Days 11-15)
11. **AI commentary integration** — Wire the commentary API to the dashboard and reports
12. **Board Pack Generator** — Multi-section report builder using calculated metrics + AI
13. **Advisory note creation** — Form for advisors to add notes to cases
14. **Advisory task management** — Create/assign/complete tasks
15. **Advisory dashboard** — Summary view with priority breakdown

### Sprint 4: Polish & Deploy (Days 16-20)
16. **Recharts integration** — Replace table-based trends with actual line/bar charts
17. **File upload flow** — S3/R2 upload for CSV financial data import
18. **PDF report generation** — Use a library like @react-pdf/renderer or puppeteer
19. **Email notifications** — For critical alerts and report completion
20. **Production deployment** — Vercel + Neon + Clerk + Stripe production config

## Key Technical Decisions

### Why Deterministic-First AI?
All financial metrics are calculated as pure TypeScript functions before any AI call. This means:
- Results are reproducible and testable
- AI costs are only incurred for narrative, not calculation
- The app works even when the AI service is unavailable
- Financial numbers are always correct — AI only adds prose

### Why Clerk Over NextAuth?
- Built-in organization support maps to our multi-tenant model
- Hosted UI components for sign-in/sign-up reduce MVP scope
- Webhook system for user sync is well-documented
- Enterprise SSO/SAML support for future Enterprise tier

### Why Prisma Over Drizzle?
- More mature ecosystem and documentation
- Built-in migration system
- Prisma Studio for quick data inspection during development
- The performance difference is negligible for this use case

## Database Indexes to Add for Production

```sql
-- High-frequency queries
CREATE INDEX idx_financial_period_company_date ON "FinancialPeriod"("companyId", "year" DESC, "month" DESC);
CREATE INDEX idx_alert_company_active ON "Alert"("companyId") WHERE "isDismissed" = false;
CREATE INDEX idx_advisory_case_priority ON "AdvisoryCase"("priority", "status");
CREATE INDEX idx_survival_assessment_company ON "SurvivalAssessment"("companyId", "createdAt" DESC);
```

## Getting Started

```bash
# 1. Clone and install
cd startup-fios
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Clerk, Stripe, DB, and OpenAI keys

# 3. Set up database
npx prisma db push
npx prisma db seed

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```
