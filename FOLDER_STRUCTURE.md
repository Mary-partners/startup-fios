# Folder Structure

```
startup-fios/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Landing page
│   │   │   ├── layout.tsx                  # Public layout (nav + footer)
│   │   │   ├── pricing/page.tsx
│   │   │   └── survival-predictor/
│   │   │       ├── page.tsx                # Predictor form
│   │   │       └── results/page.tsx        # Results display
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   ├── (platform)/
│   │   │   ├── layout.tsx                  # Authenticated shell (sidebar + header)
│   │   │   ├── app/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── onboarding/page.tsx
│   │   │   │   ├── financials/page.tsx
│   │   │   │   ├── health-score/page.tsx
│   │   │   │   ├── investor-readiness/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   ├── alerts/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── advisory/
│   │   │   │   ├── page.tsx                # Advisory dashboard
│   │   │   │   ├── startups/
│   │   │   │   │   ├── page.tsx            # Startup list
│   │   │   │   │   └── [id]/page.tsx       # Startup detail
│   │   │   │   └── tasks/page.tsx
│   │   │   └── admin/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── survival-predictor/route.ts
│   │   │   ├── financials/route.ts
│   │   │   ├── health-score/route.ts
│   │   │   ├── investor-readiness/route.ts
│   │   │   ├── reports/route.ts
│   │   │   ├── alerts/route.ts
│   │   │   ├── advisory/route.ts
│   │   │   ├── billing/
│   │   │   │   ├── route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   ├── ai/
│   │   │   │   └── commentary/route.ts
│   │   │   └── uploads/route.ts
│   │   ├── layout.tsx                      # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── progress.tsx
│   │   │   └── alert.tsx
│   │   ├── layout/
│   │   │   ├── public-nav.tsx
│   │   │   ├── public-footer.tsx
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── app-header.tsx
│   │   │   └── advisory-sidebar.tsx
│   │   ├── dashboard/
│   │   │   ├── metric-card.tsx
│   │   │   ├── runway-gauge.tsx
│   │   │   ├── burn-chart.tsx
│   │   │   ├── health-ring.tsx
│   │   │   └── alerts-summary.tsx
│   │   ├── financials/
│   │   │   ├── period-form.tsx
│   │   │   ├── revenue-table.tsx
│   │   │   └── expense-table.tsx
│   │   ├── survival-predictor/
│   │   │   ├── predictor-form.tsx
│   │   │   ├── results-display.tsx
│   │   │   └── score-gauge.tsx
│   │   ├── advisory/
│   │   │   ├── startup-card.tsx
│   │   │   ├── advisory-notes.tsx
│   │   │   └── advisory-tasks.tsx
│   │   ├── reports/
│   │   │   ├── report-card.tsx
│   │   │   └── board-pack-builder.tsx
│   │   └── forms/
│   │       ├── lead-capture-form.tsx
│   │       └── onboarding-form.tsx
│   ├── lib/
│   │   ├── engines/
│   │   │   ├── survival-engine.ts          # Survival score calculator
│   │   │   ├── health-engine.ts            # Financial health score
│   │   │   ├── readiness-engine.ts         # Investor readiness score
│   │   │   ├── metrics-engine.ts           # Individual metric calculators
│   │   │   └── alerts-engine.ts            # Alert rule evaluator
│   │   ├── ai/
│   │   │   ├── client.ts                   # AI provider client
│   │   │   ├── prompts.ts                  # Prompt templates
│   │   │   └── orchestrator.ts             # Commentary generation pipeline
│   │   ├── billing/
│   │   │   ├── plans.ts                    # Plan definitions
│   │   │   ├── stripe.ts                   # Stripe client
│   │   │   └── gates.ts                    # Feature gating logic
│   │   ├── auth/
│   │   │   ├── permissions.ts              # Role/permission map
│   │   │   └── tenant.ts                   # Tenant context helpers
│   │   ├── db/
│   │   │   └── client.ts                   # Prisma singleton
│   │   ├── jobs/
│   │   │   ├── inngest.ts                  # Inngest client
│   │   │   ├── report-generation.ts
│   │   │   ├── alert-evaluation.ts
│   │   │   └── ai-commentary.ts
│   │   ├── validators/
│   │   │   ├── survival-predictor.ts
│   │   │   ├── financials.ts
│   │   │   ├── investor-readiness.ts
│   │   │   └── onboarding.ts
│   │   └── utils/
│   │       ├── formatting.ts               # Currency, %, date formatters
│   │       └── constants.ts                # App-wide constants
│   ├── types/
│   │   ├── domain.ts                       # Core domain types
│   │   ├── api.ts                          # API request/response types
│   │   └── enums.ts                        # Shared enums
│   ├── hooks/
│   │   ├── use-company.ts
│   │   ├── use-financials.ts
│   │   └── use-permissions.ts
│   ├── config/
│   │   └── site.ts                         # Site metadata, nav config
│   └── middleware.ts                        # Auth + tenant middleware
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```
