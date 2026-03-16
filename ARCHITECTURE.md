# Startup Financial Intelligence OS — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL EDGE / CDN                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐ │
│  │  Public   │  │   Auth   │  │   Platform (App)      │ │
│  │  Pages    │  │  Pages   │  │   ┌─────────────────┐ │ │
│  │          │  │          │  │   │ Founder Dashboard│ │ │
│  │  - Home   │  │  - Login │  │   │ Financials      │ │ │
│  │  - Price  │  │  - Signup│  │   │ Health Score    │ │ │
│  │  - Pred.  │  │          │  │   │ Readiness       │ │ │
│  └──────────┘  └──────────┘  │   │ Reports         │ │ │
│                              │   │ Alerts          │ │ │
│                              │   └─────────────────┘ │ │
│                              │   ┌─────────────────┐ │ │
│                              │   │ Advisory Center  │ │ │
│                              │   │ Admin Panel     │ │ │
│                              │   └─────────────────┘ │ │
│                              └───────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                   NEXT.JS API ROUTES                    │
│  /api/survival-predictor  /api/financials               │
│  /api/health-score  /api/investor-readiness             │
│  /api/reports  /api/alerts  /api/advisory               │
│  /api/billing  /api/ai  /api/uploads                    │
├─────────────────────────────────────────────────────────┤
│                   SERVICE LAYER                         │
│  ┌──────────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Calculation  │ │   AI     │ │   Background Jobs  │  │
│  │  Engines      │ │  Copilot │ │   (Inngest/QStash) │  │
│  │  - Survival   │ │  Layer   │ │   - Report Gen     │  │
│  │  - Health     │ │          │ │   - Alert Eval     │  │
│  │  - Readiness  │ │          │ │   - AI Processing  │  │
│  └──────────────┘ └──────────┘ └────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  PostgreSQL   │ │  R2/S3   │ │   Stripe           │  │
│  │  (Neon/Supabase│ │ Storage │ │   Billing           │  │
│  │  via Prisma)  │ │          │ │                    │  │
│  └──────────────┘ └──────────┘ └────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

1. **Next.js App Router** — Server Components by default, Client Components only when needed for interactivity.
2. **Multi-tenant via companyId** — All data models carry a companyId foreign key. Middleware enforces scoping.
3. **Deterministic-first AI** — All financial calculations run as pure TypeScript functions. AI is only used for narrative generation on top of computed results.
4. **Feature gating via subscription tier** — A simple permission check layer wraps routes and API endpoints.
5. **Clerk for auth** — Fastest path to production-grade auth with org support that maps to our multi-tenant model.
6. **Background jobs via Inngest** — Serverless-friendly event-driven job runner for report generation, alert evaluation, and AI processing.

## Tenancy Model

```
User ──┐
       ├── Membership (role) ──► Company
User ──┘                           │
                                   ├── FinancialPeriod[]
                                   ├── Subscription
                                   ├── Alert[]
                                   ├── Report[]
                                   └── AdvisoryCase[]
```

Advisory users (ADVISOR, HEAD_OF_ADVISORY) have cross-company read access filtered through the AdvisoryCase model.

## Data Flow: Survival Predictor (Public)

```
User Input → Zod Validation → Calculation Engine → Score + Bands → Response
                                                          │
                                                     (optional)
                                                          │
                                                   Lead Capture → DB
```

## Data Flow: Platform Financial Analysis

```
Manual Input / Upload → Validation → DB Write → Trigger Recalculation
                                                        │
                                    ┌───────────────────┤
                                    ▼                   ▼
                              Metric Engine       Alert Engine
                                    │                   │
                                    ▼                   ▼
                              Dashboard Update    Notification
                                    │
                                    ▼
                              AI Commentary (async)
```
