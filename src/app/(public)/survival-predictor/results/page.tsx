"use client";

// ============================================================
// Survival Predictor Results Page
// Uses shared ResultsDisplay component with canonical types
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResultsDisplay from "@/components/survival-predictor/results-display";
import type { SurvivalResult } from "@/types/domain";

export default function SurvivalResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<SurvivalResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("survivalResult");
    if (!stored) {
      router.push("/survival-predictor");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.push("/survival-predictor");
    }
  }, [router]);

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500">Loading results...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-6">
        {/* Shared results component — canonical SurvivalResult type */}
        <ResultsDisplay result={result} />

        {/* CTA Section */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            Track Your Score Over Time
          </h3>
          <p className="mb-4 text-sm text-blue-700">
            Sign up to monitor your financial health, get AI-powered commentary,
            and generate investor-ready reports.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-500 transition"
            >
              Create Free Account
            </Link>
            <Link
              href="/survival-predictor"
              className="rounded-lg border border-blue-300 px-6 py-2 font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              Run Again
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
