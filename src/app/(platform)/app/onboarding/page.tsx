// ============================================================
// Onboarding Page — Company setup after first sign-up
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/use-user";

const STAGES = [
  { value: "PRE_SEED", label: "Pre-Seed", description: "Idea stage, no funding yet" },
  { value: "SEED", label: "Seed", description: "Initial funding, building MVP" },
  { value: "SERIES_A", label: "Series A", description: "Product-market fit, scaling" },
  { value: "SERIES_B", label: "Series B", description: "Growth stage" },
  { value: "SERIES_C", label: "Series C+", description: "Late-stage expansion" },
  { value: "GROWTH", label: "Growth / Bootstrapped", description: "Self-funded growth" },
  { value: "PROFITABLE", label: "Profitable", description: "Cash-flow positive" },
];

const INDUSTRIES = [
  "SaaS / Software",
  "FinTech",
  "HealthTech",
  "EdTech",
  "E-Commerce",
  "Marketplace",
  "AI / ML",
  "Blockchain / Web3",
  "CleanTech",
  "BioTech",
  "Consumer",
  "Enterprise",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Company basics
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 2: Financial baseline
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Step 3: Preferences
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [foundedYear, setFoundedYear] = useState("");

  const handleSubmit = async () => {
    if (!companyName.trim() || !stage) {
      setError("Company name and stage are required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          stage,
          industry: industry || null,
          website: website || null,
          country: country || null,
          foundedYear: foundedYear ? parseInt(foundedYear) : null,
          initialFinancials: {
            monthlyRevenue: monthlyRevenue ? parseFloat(monthlyRevenue) : 0,
            monthlyExpenses: monthlyExpenses ? parseFloat(monthlyExpenses) : 0,
            cashBalance: cashBalance ? parseFloat(cashBalance) : 0,
            teamSize: teamSize ? parseInt(teamSize) : null,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/app/dashboard");
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Onboarding failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mt-2 text-slate-500">
            Let&apos;s set up your company profile to get started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  s <= step
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    s < step ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-10 rounded-xl border bg-white p-8 shadow-sm">
          {/* Step 1: Company Basics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Company Basics</h2>
                <p className="mt-1 text-sm text-slate-500">Tell us about your company</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Stage <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 grid gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStage(s.value)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                        stage === s.value
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-slate-500">{s.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!companyName.trim() || !stage}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Financial Baseline */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Financial Snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Approximate numbers are fine — you can update these later
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Monthly Expenses ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Cash Balance ($)
                  </label>
                  <input
                    type="number"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    placeholder="e.g., 5"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Final Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Optional — you can always add these later
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Founded Year</label>
                <input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="e.g., 2023"
                  min="1900"
                  max="2030"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? "Setting up..." : "Launch Dashboard"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
