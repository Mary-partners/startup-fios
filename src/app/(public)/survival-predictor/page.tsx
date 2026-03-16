// ============================================================
// Survival Predictor Page - Public
// Lead capture gate + shared SurvivalPredictorForm component
// ============================================================

"use client";

import { useState } from "react";
import SurvivalPredictorForm from "@/components/forms/survival-predictor-form";
import { Shield, Users, ArrowRight, CheckCircle2 } from "lucide-react";

const REASONS = [
  "Checking if my startup will survive the next 12 months",
  "Preparing for investor conversations",
  "Planning budget and runway",
  "Benchmarking against industry standards",
  "Exploring CFOIP Financial OS for my company",
  "Advising a startup and need quick analysis",
  "Just curious",
];

export default function SurvivalPredictorPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setSubmitting(true);

    try {
      await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          reason,
          source: "survival-predictor",
        }),
      });
    } catch {
      // Non-blocking - don't prevent access if capture fails
    }

    setSubmitting(false);
    setUnlocked(true);
  };

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
            Free. Takes under 2 minutes.
          </p>
        </div>

        {!unlocked ? (
          /* Lead Capture Gate */
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Get Your Free Survival Score
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tell us a bit about yourself to unlock the predictor
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Muthoni"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@startup.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Why are you trying the Survival Predictor? <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a reason...</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {submitting ? (
                  "Unlocking..."
                ) : (
                  <>
                    Unlock Survival Predictor
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Trust signals */}
            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4">
              {[
                "100% free, no payment required",
                "Your data is not stored unless you create an account",
                "Results are instant and confidential",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Unlocked - Show the form */
          <>
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Welcome, <strong>{name.split(" ")[0]}</strong>! Fill in your numbers below to get your score.
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <SurvivalPredictorForm />
            </div>
          </>
        )}

        {/* Social proof */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Used by 500+ startups across Africa
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Built by CFO Innovation Partners
          </span>
        </div>
      </div>
    </main>
  );
}
