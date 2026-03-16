// ============================================================
// Pricing Page — Public
// ============================================================

import Link from "next/link";
import { PLANS } from "@/lib/billing/plans";
import { SubscriptionTier } from "@/types/enums";

export default function PricingPage() {
  const tiers = [
    SubscriptionTier.FREE,
    SubscriptionTier.STARTER,
    SubscriptionTier.GROWTH,
    SubscriptionTier.ENTERPRISE,
  ] as const;

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-slate-900">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600">
            Start free. Upgrade when you need AI commentary, board packs, and
            full financial intelligence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const plan = PLANS[tier];
            const isPopular = tier === SubscriptionTier.GROWTH;

            return (
              <div
                key={tier}
                className={`relative rounded-xl border bg-white p-6 shadow-sm ${
                  isPopular
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-slate-200"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {plan.description}
                </p>
                <div className="mt-4">
                  {plan.priceMonthly > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900">
                        ${plan.priceMonthly}
                      </span>
                      <span className="text-slate-500">/mo</span>
                    </>
                  ) : tier === SubscriptionTier.ENTERPRISE ? (
                    <span className="text-2xl font-bold text-slate-900">
                      Custom
                    </span>
                  ) : (
                    <span className="text-4xl font-bold text-slate-900">
                      Free
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 text-blue-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={
                      tier === SubscriptionTier.ENTERPRISE
                        ? "mailto:advisory@cfolead.solutions"
                        : "/sign-up"
                    }
                    className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                      isPopular
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tier === SubscriptionTier.FREE
                      ? "Get Started Free"
                      : tier === SubscriptionTier.ENTERPRISE
                      ? "Contact Us"
                      : "Start Free Trial"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
