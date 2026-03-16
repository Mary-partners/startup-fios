import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Server,
  Activity,
  Heart,
  Target,
  UserPlus,
  BarChart3,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Zap,
  Brain,
  FileText,
  Bell,
  LineChart,
  DollarSign,
  Users,
  Clock,
  Gauge,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Star,
  Layers,
  GitBranch,
  Award,
  CircleDot,
  Cpu,
  KeyRound,
  DatabaseZap,
  ShieldCheck,
  Ban,
  Scale,
  Check,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* ================================================================ */}
      {/* SECTION 1 — HERO                                                 */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        {/* Decorative gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent" />
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-36 lg:py-44">
          <div className="max-w-4xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-300">
              <Sparkles className="h-4 w-4" />
              By CFO Innovation Partners — Trusted by 50+ Companies Globally
            </p>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              The Financial Intelligence Platform for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                High-Growth Startups
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Know your survival odds, financial health, and investor readiness
              — in real time. Built by CFO Innovation Partners, trusted by 50+
              companies globally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/30"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/survival-predictor"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-500/50 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/70 hover:bg-white/10"
              >
                Try Survival Predictor
                <Activity className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-12 md:grid-cols-4 md:gap-8">
            {[
              { value: "50+", label: "Companies Served" },
              { value: "1,000+", label: "Founders Trained" },
              { value: "$50M+", label: "Capital Raised" },
              { value: "92%", label: "Client Retention" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 2 — THE PROBLEM                                          */}
      {/* ================================================================ */}
      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-red-600">
              The Reality
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Why Most Startups Fail at the $1M Mark
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              The path from $0 to $1M in revenue is littered with avoidable
              financial failures. Here are the four traps that kill promising
              companies.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: AlertTriangle,
                iconColor: "text-red-600",
                iconBg: "bg-red-100",
                title: "The Financial Blind Spot",
                stat: "82%",
                statLabel: "of startups fail due to cash flow mismanagement",
                description:
                  "Founders build incredible products but fly blind on finances. By the time they see the cliff, it is too late to course-correct.",
              },
              {
                icon: DollarSign,
                iconColor: "text-orange-600",
                iconBg: "bg-orange-100",
                title: "The CFO Gap",
                stat: "70%",
                statLabel: "lack a dedicated finance leader",
                description:
                  "A full-time CFO costs $120K-$250K/year. Early-stage startups cannot afford one, but they cannot afford to operate without financial leadership either.",
              },
              {
                icon: FileText,
                iconColor: "text-amber-600",
                iconBg: "bg-amber-100",
                title: "The Fundraising Failure",
                stat: "60%",
                statLabel: "of rounds stall due to poor financial documentation",
                description:
                  "Investors ask for financial models, cap tables, burn analyses, and board reports. Most startups scramble to produce them, losing precious momentum.",
              },
              {
                icon: Gauge,
                iconColor: "text-purple-600",
                iconBg: "bg-purple-100",
                title: "Flying Blind",
                stat: "4x",
                statLabel: "per year — how often most founders check financials",
                description:
                  "Quarterly financial reviews are not enough. Markets shift monthly, burn rates fluctuate weekly, and cash crunches happen overnight.",
              },
            ].map((problem) => (
              <div
                key={problem.title}
                className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${problem.iconBg} ${problem.iconColor}`}
                  >
                    <problem.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {problem.title}
                    </h3>
                  </div>
                </div>
                <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {problem.stat}
                  </span>{" "}
                  <span className="text-sm text-slate-600">
                    {problem.statLabel}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 3 — THE PLATFORM (Feature Deep-Dive)                     */}
      {/* ================================================================ */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
              The Platform
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Six Integrated Financial Intelligence Tools
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Every tool a startup needs to understand, monitor, and
              improve its financial position — in one unified platform.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Survival Score Engine */}
            <div className="group rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-600/20">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Survival Score Engine
              </h3>
              <p className="mb-5 text-slate-600 leading-relaxed">
                AI-powered survival probability scoring that tells you — in
                plain numbers — how likely your startup is to survive the next
                12 months.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Analyzes runway, burn rate, revenue growth, margins, concentration",
                  "Weighted algorithm refined across 50+ company datasets",
                  "Real-time alerts when metrics deteriorate",
                  "Actionable recommendations to improve your score",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2: Financial Health Dashboard */}
            <div className="group rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Financial Health Dashboard
              </h3>
              <p className="mb-5 text-slate-600 leading-relaxed">
                A comprehensive 6-dimension health assessment that grades your
                financial fitness from A+ to F — with specific actions to
                improve each dimension.
              </p>
              <ul className="space-y-2.5">
                {[
                  "6 dimensions: Liquidity, Growth, Margins, Burn Discipline, Concentration, Governance",
                  "Monthly trend tracking with interactive charts",
                  "Automated variance analysis",
                  "Grade system: A+ to F with actionable recommendations",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3: Investor Readiness Assessment */}
            <div className="group rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-green-600/20">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Investor Readiness Assessment
              </h3>
              <p className="mb-5 text-slate-600 leading-relaxed">
                A 7-category due diligence preparation score that tells you
                exactly where you stand and what to fix before your next raise.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Categories: Reporting, Controls, Cap Table, KPI Clarity, Governance, Forecasting, Due Diligence",
                  "Gap analysis with specific remediation steps",
                  "Track progress over time as you improve",
                  "Benchmark against investor expectations",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 4: Cash Runway Projector */}
            <div className="group rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-600/20">
                <LineChart className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Cash Runway Projector
              </h3>
              <p className="mb-5 text-slate-600 leading-relaxed">
                Real-time burn rate monitoring and automated runway calculations
                so you always know exactly how long your cash will last.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Real-time burn rate monitoring",
                  "Automated runway calculations",
                  "Early warning alerts at critical thresholds",
                  "Scenario modeling for different growth paths",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 5: Smart Alerts System */}
            <div className="group rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-600/20">
                <Bell className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Smart Alerts System
              </h3>
              <p className="mb-5 text-slate-600 leading-relaxed">
                Automated monitoring of 7 critical financial indicators with
                proactive notifications before problems become crises.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Monitors 7 critical financial indicators",
                  "Severity levels: Critical, Warning, Info",
                  "Proactive notifications before crises emerge",
                  "Dismissible alerts with full audit trail",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 6: Board & Investor Reports */}
            <div className="group rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/20">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Board & Investor Reports
              </h3>
              <p className="mb-5 text-slate-600 leading-relaxed">
                One-click generation of investor-grade reports with AI-powered
                narrative commentary — professionally formatted and ready to
                share.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Monthly summaries, board packs, investor updates",
                  "AI-powered narrative commentary",
                  "Professional formatting ready to share",
                  "Historical archive for tracking progress",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 4 — HOW IT WORKS                                         */}
      {/* ================================================================ */}
      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
              Getting Started
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Get Started in 4 Simple Steps
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              From sign-up to financial intelligence in under 5 minutes.
              No credit card required.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: 1,
                title: "Create Your Account",
                description:
                  "Sign up free in 30 seconds. No credit card, no commitment — just an email and password.",
                icon: UserPlus,
              },
              {
                step: 2,
                title: "Set Up Your Company",
                description:
                  "Enter your company details, stage, industry, and founding date. Takes about 2 minutes.",
                icon: Briefcase,
              },
              {
                step: 3,
                title: "Input Your Financials",
                description:
                  "Add your revenue, expenses, and cash balance. Start with one month — add more for trend analysis.",
                icon: BarChart3,
              },
              {
                step: 4,
                title: "Get Instant Intelligence",
                description:
                  "See your survival score, health grade, and investor readiness level immediately. No waiting.",
                icon: Zap,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg"
              >
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-md shadow-blue-600/20">
                    {item.step}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 hover:shadow-xl"
            >
              Create Your Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 5 — TECHNOLOGY & AI                                      */}
      {/* ================================================================ */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-400">
              Our Technology
            </p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Powered by AI, Built by Financial Experts
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-300 leading-relaxed">
              The Startup Financial Intelligence OS combines Mary Ndinda&apos;s
              decade of CPA expertise and hands-on advisory work across 50+
              companies with cutting-edge AI algorithms. The result: financial
              diagnostics that used to take weeks — delivered in seconds, with
              institutional-grade accuracy.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Zap,
                value: "5x Faster",
                label: "Financial diagnostics in seconds, not weeks",
                description:
                  "Our AI engine processes your financial data instantly, delivering comprehensive diagnostics that would take a human analyst days or weeks to produce manually.",
              },
              {
                icon: Target,
                value: "99.2% Accuracy",
                label: "AI-powered calculations eliminate manual errors",
                description:
                  "Every calculation is verified algorithmically. No spreadsheet typos, no formula mistakes, no missed cells. Your financial intelligence is precise and reliable.",
              },
              {
                icon: DollarSign,
                value: "70% Cost Savings",
                label: "Institutional-grade intelligence at a fraction of CFO cost",
                description:
                  "Access the same financial analysis that Fortune 500 companies get from their CFO offices — at a fraction of the cost of hiring even a part-time CFO.",
              },
            ].map((metric) => (
              <div
                key={metric.value}
                className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:bg-white/10"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <metric.icon className="h-6 w-6" />
                </div>
                <p className="mb-1 text-3xl font-extrabold text-white">
                  {metric.value}
                </p>
                <p className="mb-4 text-sm font-semibold text-blue-300">
                  {metric.label}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 6 — SECURITY & DATA PROTECTION                           */}
      {/* ================================================================ */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Your Financial Data is Sacred
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 leading-relaxed">
              We handle sensitive financial information every day. Our security
              infrastructure is built to the same institutional standards we
              recommend to our clients.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "256-bit AES Encryption at Rest",
                description:
                  "All stored data is encrypted using industry-standard AES-256. Even if systems were breached, your data remains unreadable.",
              },
              {
                icon: ShieldCheck,
                title: "TLS 1.3 Encryption in Transit",
                description:
                  "Every byte of data moving between your browser and our servers is protected by the latest TLS 1.3 protocol.",
              },
              {
                icon: DatabaseZap,
                title: "Complete Data Isolation",
                description:
                  "Strict tenant isolation ensures each user sees only their own data. No cross-account access is possible.",
              },
              {
                icon: KeyRound,
                title: "Role-Based Access Controls",
                description:
                  "Granular permissions ensure that team members see only what they need to. Full audit trail on all access.",
              },
              {
                icon: Ban,
                title: "No Data Selling or Sharing — Ever",
                description:
                  "Your financial data is used only to provide the service. We never sell, share, or monetize your information. Period.",
              },
              {
                icon: Scale,
                title: "GDPR Compliant",
                description:
                  "Full compliance with data protection regulations. Export all your data or request complete deletion at any time.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-slate-200 p-6 transition-all duration-200 hover:border-green-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Read our full privacy policy
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 7 — TRACK RECORD (Social Proof)                          */}
      {/* ================================================================ */}
      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
              Proven Results
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Proven Impact Across 50+ Companies
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Real outcomes from real companies. Here is what changes when
              startups move from guessing to knowing.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">
                      Metric
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-red-600">
                      Before CFOIP
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-green-600">
                      After CFOIP
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-blue-600">
                      Impact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      metric: "Fundraise Close Time",
                      before: "9-12 months",
                      after: "3-5 months",
                      impact: "60% faster",
                    },
                    {
                      metric: "Financial Visibility",
                      before: "Quarterly",
                      after: "Real-time",
                      impact: "Continuous",
                    },
                    {
                      metric: "Cash Runway Visibility",
                      before: "1-2 months",
                      after: "6-12 months",
                      impact: "5x improvement",
                    },
                    {
                      metric: "Investor Confidence",
                      before: "Low",
                      after: "Data-driven",
                      impact: "3x faster response",
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.metric}
                      className={
                        i < 3 ? "border-b border-slate-100" : ""
                      }
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {row.metric}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {row.before}
                      </td>
                      <td className="px-6 py-4 font-medium text-green-700">
                        {row.after}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {row.impact}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sectors */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
              Sectors We Serve
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Fintech",
                "Healthtech",
                "Agritech",
                "Edtech",
                "E-Commerce",
                "SaaS",
                "Cleantech",
                "Logistics",
              ].map((sector) => (
                <span
                  key={sector}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 8 — PRICING                                              */}
      {/* ================================================================ */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
              Pricing
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Start free, upgrade as you grow. No hidden fees, no surprises,
              no long-term contracts.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Free Tier */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg">
              <p className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-500">
                Free
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  $0
                </span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="mb-6 text-sm text-slate-600">
                Perfect for early-stage founders exploring their financial
                position.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Survival predictor tool",
                  "Basic health score",
                  "1 company profile",
                  "Monthly data entry",
                  "Community support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-lg border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Get Started Free
              </Link>
            </div>

            {/* Growth Tier */}
            <div className="relative rounded-xl border-2 border-blue-600 bg-white p-8 shadow-lg shadow-blue-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
              <p className="mb-1 text-sm font-bold uppercase tracking-widest text-blue-600">
                Growth
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  $49
                </span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="mb-6 text-sm text-slate-600">
                Full-suite financial intelligence for growing startups.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Everything in Free",
                  "Full health dashboard",
                  "All scores & assessments",
                  "Investor readiness reports",
                  "Smart alerts system",
                  "AI-powered commentary",
                  "Board & investor reports",
                  "Email support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Start Growth Plan
              </Link>
            </div>

            {/* Scale Tier */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg">
              <p className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-500">
                Scale
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  $199
                </span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="mb-6 text-sm text-slate-600">
                Enterprise-grade intelligence with advisory integration.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Everything in Growth",
                  "Advisory integration",
                  "Priority support",
                  "API access",
                  "Custom reporting",
                  "Multiple company profiles",
                  "Team member access",
                  "Dedicated account manager",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-lg border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Start Scale Plan
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Start free — no credit card required. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 9 — LEADERSHIP                                           */}
      {/* ================================================================ */}
      <section className="bg-slate-50 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
              Leadership
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              Built by Finance Experts
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              The platform is built on real-world experience, not theory. Every
              algorithm, every score, every recommendation is informed by
              hands-on advisory work with real startups.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <div className="mb-6 flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-3xl font-bold text-white shadow-lg shadow-blue-600/20">
                  MN
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Mary Ndinda
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    Founder & CEO
                  </p>
                  <p className="text-sm text-slate-500">
                    CPA & MSc Qualified
                  </p>
                </div>
              </div>
              <blockquote className="mb-6 border-l-4 border-blue-600 pl-5 text-slate-700 leading-relaxed italic">
                &ldquo;I founded CFOIP on a singular observation: companies that
                stall at the $1M mark almost universally share the same root
                cause — not a product problem, not a market problem, a financial
                infrastructure problem. The Startup Financial Intelligence OS is
                the tool I wished existed when I started advising my first
                startup clients.&rdquo;
              </blockquote>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { value: "50+", label: "Companies Advised" },
                  { value: "1,000+", label: "Founders Trained" },
                  { value: "$50M+", label: "Capital Raised" },
                  { value: "10+", label: "Years Experience" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-xl font-extrabold text-blue-600">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 10 — FAQ                                                 */}
      {/* ================================================================ */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
              FAQ
            </p>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                question: "What is Startup Financial Intelligence OS?",
                answer:
                  "It is an AI-powered platform that gives startups real-time financial diagnostics, including survival probability scoring, 6-dimension financial health assessments, investor readiness evaluation, cash runway projections, smart alerts, and automated investor-grade reports. Think of it as having a virtual CFO that monitors your financial health 24/7 and tells you exactly what to fix.",
              },
              {
                question:
                  "How is this different from accounting software?",
                answer:
                  "We do not replace QuickBooks, Xero, or your accounting system. We sit on top of your financial data, analyzing it to provide strategic intelligence. Your accounting software tells you what happened. We tell you what it means, what is about to happen, and what to do about it. It is the difference between a thermometer and a doctor.",
              },
              {
                question: "Is my financial data secure?",
                answer:
                  "Absolutely. We use 256-bit AES encryption at rest, TLS 1.3 encryption in transit, complete data isolation between users, and role-based access controls. We never sell or share your data. We are fully GDPR compliant, and you can export or delete your data at any time.",
              },
              {
                question: "Do I need a CFO to use this?",
                answer:
                  "No. The platform was built specifically for founders who do not have finance backgrounds. Every metric comes with plain-language explanations, and every score includes specific, actionable recommendations. If you can read a bank statement, you can use this platform.",
              },
              {
                question: "What stage companies is this for?",
                answer:
                  "The platform is designed for pre-seed through Series A stage companies — typically $0 to $5M in annual revenue. This is the stage where financial infrastructure matters most but is most often neglected. Whether you are pre-revenue or crossing the $1M mark, the platform adapts to your stage.",
              },
              {
                question: "How do I get started?",
                answer:
                  "Sign up for a free account (no credit card required), set up your company profile, and input at least 3 months of financial data. You will get your survival score, health grade, and investor readiness level immediately. The entire process takes under 5 minutes.",
              },
            ].map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-blue-200 [&[open]]:border-blue-200 [&[open]]:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 11 — FINAL CTA                                           */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-20 text-center text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Ready to Take Control of Your Startup&apos;s Financial Future?
          </h2>
          <p className="mb-10 text-lg text-blue-100 leading-relaxed">
            Join 50+ companies already using CFOIP Financial OS to make smarter
            financial decisions. Start free, see results in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all duration-200 hover:bg-blue-50 hover:shadow-2xl"
            >
              Create Your Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="mailto:partner@cfopartners.fund"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white/20"
            >
              Book a Discovery Call
              <Mail className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
            <a
              href="mailto:partner@cfopartners.fund"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <Mail className="h-4 w-4" />
              partner@cfopartners.fund
            </a>
            <a
              href="tel:+254748918910"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <Phone className="h-4 w-4" />
              +254 748 918 910
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nairobi, Kenya
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
