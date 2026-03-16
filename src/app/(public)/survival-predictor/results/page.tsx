"use client";

// ============================================================
// Survival Predictor Results Page
// With callback request and results sharing
// ============================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResultsDisplay from "@/components/survival-predictor/results-display";
import type { SurvivalResult } from "@/types/domain";
import { Phone, Send, CheckCircle2, Mail } from "lucide-react";

export default function SurvivalResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<SurvivalResult | null>(null);
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackEmail, setCallbackEmail] = useState("");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);

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

  const handleCallbackRequest = async () => {
    if (!callbackName.trim() || (!callbackPhone.trim() && !callbackEmail.trim())) return;
    setCallbackSubmitting(true);
    try {
      await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: callbackName.trim(),
          phone: callbackPhone.trim() || null,
          email: callbackEmail.trim() || null,
          source: "survival_predictor",
          survivalScore: result?.survivalScore,
          riskLevel: result?.riskLevel,
          runway: result?.metrics?.runway,
        }),
      });
    } catch {
      // Silent fail
    }
    setCallbackSubmitting(false);
    setCallbackSubmitted(true);
  };

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
        {/* Shared results component */}
        <ResultsDisplay result={result} />

        {/* Callback Request Section */}
        <div className="mt-8 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-6">
          {callbackSubmitted ? (
            <div className="flex items-center gap-4 justify-center py-4">
              <CheckCircle2 className="h-10 w-10 text-green-500 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  We&apos;ll be in touch!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Our team has received your results and will reach out within 24 hours to discuss your financial health and how we can help.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 mb-3">
                  <Phone className="h-3 w-3" />
                  Free Consultation
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Want to discuss your results with a financial expert?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Leave your details and our team will call you back to review your survival score and recommend next steps.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={callbackEmail}
                    onChange={(e) => setCallbackEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCallbackRequest}
                  disabled={callbackSubmitting || !callbackName.trim() || (!callbackPhone.trim() && !callbackEmail.trim())}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <Send className="h-4 w-4" />
                  {callbackSubmitting ? "Sending..." : "Request a Callback"}
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                We&apos;ll share a copy of your results and recommendations via email.
              </p>
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            Track Your Score Over Time
          </h3>
          <p className="mb-4 text-sm text-blue-700">
            Sign up to monitor your financial health, get AI-powered insights,
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
