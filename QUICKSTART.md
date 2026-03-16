# Startup Financial Intelligence OS — Quickstart

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **PostgreSQL** 14+ running locally or remotely
- **Clerk account** — [clerk.com](https://clerk.com) (free tier works)
- **Stripe account** — [stripe.com](https://stripe.com) (test mode)
- **OpenAI API key** — [platform.openai.com](https://platform.openai.com)

## Local Setup (5 minutes)

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag resolves a peer dependency conflict between eslint 9 and eslint-config-next (expects eslint 7/8). This is cosmetic and does not affect runtime.

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks (create one pointing to `/api/webhooks/clerk`) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI or Dashboard → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `OPENAI_API_KEY` | OpenAI Platform → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

Stripe price IDs (`STRIPE_STARTER_MONTHLY_PRICE_ID`, etc.) and S3 credentials are optional for initial local development.

### 3. Set up database

```bash
npx prisma migrate dev --name init
```

This creates all 22 tables, 11 enums, and generates the Prisma client.

### 4. Seed demo data (optional but recommended)

```bash
npx prisma db seed
```

Creates a demo company (Acme SaaS Inc.) with 6 months of financial data, a demo user, and an advisory case.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What you'll see

### Public pages (no auth required)
- **/** — Marketing homepage
- **/pricing** — Tier comparison (Free / Starter / Growth)
- **/survival-predictor** — Free public tool (lead gen)
- **/sign-in**, **/sign-up** — Clerk auth pages

### Authenticated platform (requires sign-in)
- **/app/dashboard** — KPI dashboard with charts
- **/app/financials** — Financial period management
- **/app/health-score** — 6-factor health assessment
- **/app/investor-readiness** — Readiness checklist + scoring
- **/app/reports** — Survival, health, and board reports
- **/app/alerts** — Smart financial alerts
- **/app/settings** — Company, team, billing settings
- **/app/onboarding** — New company setup wizard

### Advisory command center (advisory roles only)
- **/advisory** — Advisory dashboard
- **/advisory/startups** — Client portfolio
- **/advisory/startups/[id]** — Individual startup detail
- **/advisory/tasks** — Cross-client task management

## Clerk webhook setup

For user creation/update to work, configure a Clerk webhook:

1. Go to Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/clerk` (use ngrok for local dev)
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

For local development with ngrok:
```bash
ngrok http 3000
# Then use the ngrok URL in Clerk webhook config
```

## Stripe webhook setup

```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/billing/webhook
# Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET
```

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npx prisma studio` | Visual database browser |
| `npx prisma migrate dev` | Run pending migrations |
| `npx prisma db seed` | Seed demo data |
| `npx prisma generate` | Regenerate Prisma client |

## Codebase structure

```
startup-fios/
├── prisma/
│   ├── schema.prisma          # 22 models, 11 enums
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Sign-in/sign-up pages
│   │   ├── (platform)/        # Authenticated app (sidebar layout)
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── advisory/      # Advisory command center
│   │   │   └── app/           # Core platform pages
│   │   ├── (public)/          # Marketing pages (public layout)
│   │   ├── api/               # 24 API routes
│   │   ├── layout.tsx         # Root layout (ClerkProvider)
│   │   └── globals.css        # Tailwind base styles
│   ├── components/            # 31 reusable components
│   │   ├── advisory/          # Advisory-specific components
│   │   ├── charts/            # Recharts wrappers
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── financials/        # Financial data tables/forms
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Sidebar, header, nav
│   │   ├── reports/           # Report builders
│   │   ├── survival-predictor/# Predictor UI
│   │   └── ui/                # Base UI primitives
│   ├── hooks/                 # 4 custom React hooks
│   ├── lib/                   # 25 library modules
│   │   ├── ai/                # OpenAI client + prompts
│   │   ├── auth/              # Tenant resolution + permissions
│   │   ├── billing/           # Stripe integration + plans
│   │   ├── db/                # Prisma client singleton
│   │   ├── engines/           # Calculation engines (survival, health, readiness, metrics)
│   │   ├── jobs/              # Background job system (mock Inngest)
│   │   └── utils/             # Formatting, cn(), helpers
│   ├── types/                 # 3 type definition files
│   └── middleware.ts          # Clerk route protection
├── .env.example               # Environment template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind theme (brand colors)
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies + scripts
```

## Production deployment

See `DEPLOYMENT-GUIDE.md` for the full production deployment guide including:
- Infrastructure architecture (Vercel/Railway/Docker)
- Database migration strategy
- SSL/domain configuration
- Monitoring and alerting stack
- Security hardening checklist (21 items)
- 5-phase deployment plan
- Launch day checklist

## Architecture notes

- **Deterministic-first AI**: All financial calculations (survival score, health score, readiness) use pure TypeScript engines. AI (OpenAI) is only used for narrative commentary generation.
- **Multi-tenant**: Users belong to Companies via Memberships with 7 role types and 28 granular permissions.
- **Server/Client boundary**: Server components handle data fetching and computation. Client components (marked `"use client"`) handle interactivity.
- **Background jobs**: MVP uses a fire-and-forget event system (`emit`/`on`). Can be upgraded to Inngest for production reliability.
