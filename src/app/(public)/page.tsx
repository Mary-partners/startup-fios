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
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-40">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
              By CFO Innovation Partners
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Know Your Startup&apos;s Financial Health{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Before It&apos;s Too Late
              </span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
              AI-powered financial intelligence that reveals your runway, burn
              rate, and survival probability in seconds — then gives you the
              tools to improve them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/survival-predictor"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-500/50 px-7 py-3.5 text-lg font-semibold text-white transition hover:border-white/70 hover:bg-white/5"
              >
                Try Survival Predictor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-slate-200 bg-slate-50 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 text-sm text-slate-600 md:gap-12">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Financial Intelligence, Not Just Accounting
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Three powerful tools that give you a complete picture of your
              startup&apos;s financial position and investor readiness.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 p-8 transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              From sign-up to investor-ready in four simple steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[calc(50%+28px)] top-5 hidden h-0.5 w-[calc(100%-56px)] bg-blue-200 md:block" />
                )}
                <div className="relative mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/20">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Your Financial Data is Sacred
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              We treat your financial data with the highest level of care and
              security. Here&apos;s how we protect it.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {SECURITY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-slate-200 p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to take control of your startup&apos;s finances?
          </h2>
          <p className="mb-10 text-lg text-blue-100">
            Join founders who use Startup FIOS to monitor their financial health
            and become investor-ready.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition hover:bg-blue-50"
          >
            Create Your Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

const TRUST_ITEMS = [
  { icon: Lock, label: "256-bit encryption" },
  { icon: Shield, label: "SOC 2 Compliant" },
  { icon: Eye, label: "Your data stays private" },
  { icon: Server, label: "Bank-level security" },
];

const FEATURES = [
  {
    icon: Activity,
    title: "Survival Score",
    description:
      "Know your exact runway, burn multiple, and survival probability. Instant analysis with actionable recommendations.",
  },
  {
    icon: Heart,
    title: "Health Score",
    description:
      "A comprehensive 6-dimension financial health assessment covering liquidity, growth, margins, burn discipline, concentration, and governance.",
  },
  {
    icon: Target,
    title: "Investor Readiness",
    description:
      "Due-diligence preparation scoring that tells you exactly what to fix before your next fundraise. Be ready when opportunity knocks.",
  },
];

const STEPS = [
  {
    title: "Sign Up & Connect",
    description: "Create your account and enter your financial data securely.",
  },
  {
    title: "Instant Diagnostics",
    description:
      "Get your survival score, health assessment, and burn analysis immediately.",
  },
  {
    title: "Track Over Time",
    description:
      "Monitor your metrics monthly. See trends and get AI-powered commentary.",
  },
  {
    title: "Be Investor-Ready",
    description:
      "Improve your scores with targeted recommendations and generate board packs.",
  },
];

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All data is encrypted with 256-bit AES at rest and TLS 1.3 in transit. Your financial data is never exposed.",
  },
  {
    icon: Eye,
    title: "Complete Data Isolation",
    description:
      "Each user sees only their own data. Strict tenant isolation ensures no cross-account access is possible.",
  },
  {
    icon: Shield,
    title: "No Third-Party Data Sharing",
    description:
      "Your data is used only to provide the service. We never sell, share, or monetize your financial information.",
  },
  {
    icon: CheckCircle2,
    title: "GDPR Compliant Handling",
    description:
      "Full compliance with data protection regulations. Export or delete your data at any time.",
  },
];
