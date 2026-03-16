// ============================================================
// Survival Predictor Page — Public
// Uses the shared SurvivalPredictorForm component
// ============================================================

import SurvivalPredictorForm from "@/components/forms/survival-predictor-form";

export const metadata = {
  title: "Startup Survival Predictor | CFOIP Financial OS",
  description:
    "Free instant survival score for startups. Calculate your runway, burn rate, and risk level in seconds.",
};

export default function SurvivalPredictorPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        {/* Hero header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Startup Survival Predictor
          </h1>
          <p className="text-slate-600">
            Enter your financial data to get an instant survival score,
            runway calculation, and risk assessment.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Free. No signup required.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <SurvivalPredictorForm />
        </div>

        {/* Trust signals */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your data is not stored unless you create an account
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Used by 500+ startups
          </span>
        </div>
      </div>
    </main>
  );
}
