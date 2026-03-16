// ============================================================
// Onboarding Page — Full-screen setup with "What to Expect"
// visualization + 4-step company setup flow
// ============================================================

"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth/use-user";
import {
  Upload,
  Link,
  PenLine,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  HeartPulse,
  Target,
  TrendingUp,
  Shield,
  Brain,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

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

const EXPECT_ITEMS = [
  {
    icon: HeartPulse,
    title: "Survival Score",
    description: "AI-powered prediction of your startup's financial health",
    color: "from-red-500 to-rose-500",
    bg: "bg-red-50",
    iconColor: "text-red-600",
    stat: "0-100",
  },
  {
    icon: BarChart3,
    title: "Financial Dashboard",
    description: "Revenue, burn rate, runway, and cash flow at a glance",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    stat: "Real-time",
  },
  {
    icon: Target,
    title: "Investor Readiness",
    description: "Know exactly where you stand before approaching investors",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    stat: "5 Pillars",
  },
  {
    icon: Brain,
    title: "CFO AI Assistant",
    description: "Ask financial questions, get instant expert analysis",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    stat: "24/7",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Track revenue growth, gross margin, and unit economics",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    stat: "12 months",
  },
  {
    icon: Shield,
    title: "Risk Alerts",
    description: "Proactive warnings before problems become crises",
    color: "from-slate-500 to-gray-600",
    bg: "bg-slate-50",
    iconColor: "text-slate-600",
    stat: "Automated",
  },
];

const TOTAL_STEPS = 4;

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  skippedPeriods?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [showSetup, setShowSetup] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Company basics
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 2: Data import
  const [importMethod, setImportMethod] = useState<"upload" | "quickbooks" | "manual" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [qbMessage, setQbMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Financial baseline (manual entry)
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Step 4: Preferences
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [foundedYear, setFoundedYear] = useState("");

  // File upload handler
  const handleFile = useCallback(async (file: File) => {
    setImportError(null);
    setImportResult(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImportResult(data.data);
      } else {
        setImportError(data.error ?? "Import failed. Please try again.");
      }
    } catch {
      setImportError("Network error. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

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

  // ── "What to Expect" landing screen ──
  if (!showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 text-white overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
              <Sparkles className="h-4 w-4" />
              Welcome{user?.firstName ? `, ${user.firstName}` : ""} — Let&apos;s get you set up
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
              Your <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Financial Command Center</span> Awaits
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              In 2 minutes, you&apos;ll unlock powerful financial tools built specifically for African startups. Here&apos;s what you&apos;ll get:
            </p>
          </div>

          {/* Visualization Grid */}
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EXPECT_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Stat badge */}
                  <div className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70">
                    {item.stat}
                  </div>

                  <div className={`inline-flex rounded-xl ${item.bg} p-3`}>
                    <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-400">
                    {item.description}
                  </p>

                  {/* Mini visualization bar */}
                  <div className="mt-4 flex items-end gap-1 h-8">
                    {Array.from({ length: 8 }, (_, j) => (
                      <div
                        key={j}
                        className={`flex-1 rounded-sm bg-gradient-to-t ${item.color} opacity-30 group-hover:opacity-60 transition-opacity duration-500`}
                        style={{
                          height: `${20 + Math.sin((i + j) * 0.8) * 40 + 40}%`,
                          transitionDelay: `${j * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard Preview Visualization */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/60" />
                <div className="h-3 w-3 rounded-full bg-amber-400/60" />
                <div className="h-3 w-3 rounded-full bg-green-400/60" />
              </div>
              <span className="text-xs text-slate-500">CFOIP Financial OS — Dashboard Preview</span>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {/* Score Ring */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 p-4">
                <svg viewBox="0 0 100 100" className="h-24 w-24">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${0.72 * 264} ${264}`}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <text x="50" y="46" textAnchor="middle" className="fill-white text-2xl font-bold" fontSize="22">72</text>
                  <text x="50" y="62" textAnchor="middle" className="fill-slate-400 text-xs" fontSize="8">Health Score</text>
                </svg>
                <p className="mt-2 text-xs text-slate-400">Your Score</p>
              </div>

              {/* Mini metric cards */}
              <div className="space-y-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Revenue</p>
                  <p className="text-lg font-bold text-emerald-400">$24.5K</p>
                  <p className="text-[10px] text-emerald-400/70">+12.3% MoM</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Burn Rate</p>
                  <p className="text-lg font-bold text-amber-400">$18.2K</p>
                </div>
              </div>

              {/* Chart Preview */}
              <div className="md:col-span-2 rounded-lg bg-white/5 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Revenue vs Expenses (6mo)</p>
                <div className="flex items-end gap-2 h-20">
                  {[
                    { r: 40, e: 65 },
                    { r: 48, e: 60 },
                    { r: 55, e: 58 },
                    { r: 62, e: 55 },
                    { r: 70, e: 52 },
                    { r: 82, e: 50 },
                  ].map((d, j) => (
                    <div key={j} className="flex-1 flex gap-0.5 items-end">
                      <div
                        className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400 opacity-70"
                        style={{ height: `${d.r}%` }}
                      />
                      <div
                        className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-rose-400 opacity-40"
                        style={{ height: `${d.e}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-slate-600">
                  <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowSetup(true)}
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
            >
              <Zap className="h-5 w-5" />
              Set Up My Dashboard
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-sm text-slate-400">
              Takes about 2 minutes — you can always update later
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Setup Form (4 steps) ──
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
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  s < step
                    ? "bg-green-500 text-white"
                    : s === step
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < TOTAL_STEPS && (
                <div
                  className={`h-0.5 w-12 transition-colors ${
                    s < step ? "bg-green-500" : "bg-slate-200"
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

          {/* Step 2: Data Import */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  How would you like to add your financial data?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a method or skip this step to enter data later
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => setImportMethod("upload")}
                  className={`rounded-xl border-2 p-5 text-center transition-colors ${
                    importMethod === "upload"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Upload className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Upload CSV / Excel</h3>
                    <p className="text-[11px] text-slate-500">Import historical data</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setImportMethod("quickbooks");
                    setQbMessage(true);
                    setTimeout(() => setQbMessage(false), 3000);
                  }}
                  className={`relative rounded-xl border-2 p-5 text-center transition-colors ${
                    importMethod === "quickbooks"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                    Coming Soon
                  </span>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <Link className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Connect QuickBooks</h3>
                    <p className="text-[11px] text-slate-500">Auto-sync data</p>
                  </div>
                </button>

                <button
                  onClick={() => setImportMethod("manual")}
                  className={`rounded-xl border-2 p-5 text-center transition-colors ${
                    importMethod === "manual"
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <PenLine className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Enter Manually</h3>
                    <p className="text-[11px] text-slate-500">Type in your numbers</p>
                  </div>
                </button>
              </div>

              {qbMessage && (
                <div className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700">
                  QuickBooks integration coming soon. You can upload a CSV or enter data manually for now.
                </div>
              )}

              {importMethod === "upload" && (
                <div
                  className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    ) : importResult ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <FileSpreadsheet className="h-8 w-8 text-slate-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {uploading
                          ? "Uploading and parsing..."
                          : importResult
                          ? `Imported ${importResult.imported} period${importResult.imported !== 1 ? "s" : ""}`
                          : "Drag and drop your CSV file here"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Expected columns: month, year, revenue, expenses, cash_balance, cogs
                      </p>
                    </div>
                    {!uploading && !importResult && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500"
                      >
                        Choose File
                      </button>
                    )}
                  </div>
                  {importResult && importResult.skipped > 0 && (
                    <p className="mt-3 text-xs text-amber-600">
                      {importResult.skipped} period{importResult.skipped !== 1 ? "s" : ""} skipped (already exist).
                    </p>
                  )}
                  {importError && (
                    <div className="mt-3 flex items-start justify-center gap-2 text-xs text-red-600">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>{importError}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (importMethod === "manual") {
                      setStep(3);
                    } else if (importResult) {
                      setStep(4);
                    } else {
                      setStep(3);
                    }
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  {importResult ? "Continue" : importMethod === "manual" ? "Enter Manually" : "Skip for Now"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Financial Baseline */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Financial Snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Approximate numbers are fine — you can update these later
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Monthly Revenue ($)</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Monthly Expenses ($)</label>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cash Balance ($)</label>
                  <input
                    type="number"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Team Size</label>
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
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
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
                  placeholder="e.g., Kenya"
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
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Setting up..." : "Launch My Dashboard"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
