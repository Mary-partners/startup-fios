// ============================================================
// Landing Page — Public
// ============================================================

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-400">
              By CFO Innovation Partners
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
              Know Your Startup's{" "}
              <span className="text-blue-400">Survival Odds</span> Before
              Investors Ask
            </h1>
            <p className="mb-8 text-lg text-slate-300 md:text-xl">
              AI-powered financial intelligence that tells you your runway,
              burn rate, and survival probability in seconds. Then gives you
              the tools to improve them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/survival-predictor"
                className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
              >
                Try the Free Survival Predictor
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-slate-600 px-6 py-3 text-lg font-semibold text-white transition hover:border-white"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Financial Intelligence, Not Just Accounting
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="rounded-xl border border-slate-200 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">
                  {prop.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  {prop.title}
                </h3>
                <p className="text-slate-600">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold">
            Start With Your Free Survival Score
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            No signup required. Get your survival score, runway, and burn
            analysis in under 60 seconds.
          </p>
          <Link
            href="/survival-predictor"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Get Your Score Now
          </Link>
        </div>
      </section>
    </main>
  );
}

const VALUE_PROPS = [
  {
    icon: "📊",
    title: "Survival Predictor",
    description:
      "Know your exact runway, burn multiple, and survival probability. Free, instant, no signup required.",
  },
  {
    icon: "🏥",
    title: "Financial Health Score",
    description:
      "A comprehensive weighted score across liquidity, growth, margins, burn discipline, and governance.",
  },
  {
    icon: "🎯",
    title: "Investor Readiness",
    description:
      "Assessment-based scoring that tells you exactly what to fix before your next fundraise.",
  },
];

const STEPS = [
  {
    title: "Enter Your Numbers",
    description: "Cash balance, revenue, expenses, and a few key data points.",
  },
  {
    title: "Get Your Score",
    description: "Instant survival score with metric breakdown and risk level.",
  },
  {
    title: "Sign Up for More",
    description: "Track over time, get AI commentary, and generate board packs.",
  },
  {
    title: "Become Investor-Ready",
    description: "Improve your scores with targeted recommendations.",
  },
];
