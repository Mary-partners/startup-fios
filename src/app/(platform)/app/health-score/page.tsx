"use client";

// ============================================================
// Financial Health Score Page - Refactored with MetricCard +
// ScoreCard components. Client component that fetches data.
// ============================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/dashboard/metric-card";

interface HealthData {
  subScores: {
    liquidityScore: number;
    growthScore: number;
    marginScore: number;
    burnDisciplineScore: number;
    concentrationScore: number;
    governanceScore: number;
  };
  overallScore: number;
  grade: string;
  weights: Record<string, number>;
}

const SUB_SCORE_CONFIG: Record<
  string,
  { label: string; description: string; actionWhenLow: string }
> = {
  liquidityScore: {
    label: "Liquidity",
    description: "Cash reserves and runway relative to burn rate",
    actionWhenLow: "Reduce discretionary spend or accelerate revenue collection cycles.",
  },
  growthScore: {
    label: "Revenue Growth",
    description: "Month-over-month revenue growth trajectory",
    actionWhenLow: "Review sales pipeline conversion rates and expansion revenue opportunities.",
  },
  marginScore: {
    label: "Gross Margin",
    description: "Revenue minus cost of goods sold efficiency",
    actionWhenLow: "Audit COGS line items for optimization: hosting, infrastructure, direct labor.",
  },
  burnDisciplineScore: {
    label: "Burn Discipline",
    description: "Expense-to-revenue ratio and spending consistency",
    actionWhenLow: "Implement monthly budget reviews and tighten approval thresholds for new spend.",
  },
  concentrationScore: {
    label: "Revenue Diversification",
    description: "Customer concentration risk level",
    actionWhenLow: "Diversify pipeline. No single customer should exceed 25% of total revenue.",
  },
  governanceScore: {
    label: "Financial Governance",
    description: "Monthly close, board reporting, and audit practices",
    actionWhenLow: "Establish monthly close process, regular board reporting, and financial model updates.",
  },
};

const GRADE_CONFIG: Record<string, { color: string; label: string; summary: string }> = {
  A: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    label: "Excellent",
    summary:
      "Your startup demonstrates strong fundamentals across all measured dimensions. Continue disciplined execution and consider scaling confidently.",
  },
  B: {
    color: "text-green-600 bg-green-50 border-green-200",
    label: "Good",
    summary:
      "Good financial health with minor areas for improvement. Focus on the lowest-scoring dimensions to move toward an A grade. This position is solid for most fundraising conversations.",
  },
  C: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "Moderate",
    summary:
      "Several areas need attention. Review the lowest-scoring sub-scores and create action plans to improve each within the next 2-3 months.",
  },
  D: {
    color: "text-orange-600 bg-orange-50 border-orange-200",
    label: "Below Average",
    summary:
      "Significant gaps exist that could affect fundraising and long-term viability. Prioritize the critical areas immediately, particularly liquidity and burn discipline.",
  },
  F: {
    color: "text-red-600 bg-red-50 border-red-200",
    label: "Critical",
    summary:
      "Immediate intervention is needed across multiple dimensions. Consider engaging a fractional CFO or financial advisor to develop a recovery plan.",
  },
};

export default function HealthScorePage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health-score")
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) {
          setError(json.error);
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Failed to load health score"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Calculating health score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Health Score</h1>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive assessment across 6 financial dimensions
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-800">
            {error.includes("upgraded") ? "Upgrade Required" : "Unable to Calculate"}
          </p>
          <p className="mt-1 text-sm text-amber-700">{error}</p>
          <div className="mt-4 flex gap-3">
            {error.includes("No financial data") && (
              <Link
                href="/app/financials"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Enter Financial Data
              </Link>
            )}
            {error.includes("upgraded") && (
              <Link
                href="/pricing"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                View Plans
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const gradeConfig = GRADE_CONFIG[data.grade] ?? GRADE_CONFIG.C;

  // Sort sub-scores ascending to highlight weakest areas first
  const sortedSubs = Object.entries(data.subScores)
    .map(([key, score]) => ({
      key,
      score,
      ...(SUB_SCORE_CONFIG[key] ?? { label: key, description: "", actionWhenLow: "" }),
    }))
    .sort((a, b) => a.score - b.score);

  const weakest = sortedSubs.filter((s) => s.score < 50);

  const scoreBarColor = (score: number) =>
    score >= 75
      ? "bg-emerald-500"
      : score >= 55
      ? "bg-green-500"
      : score >= 40
      ? "bg-yellow-500"
      : score >= 25
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Health Score</h1>
        <p className="mt-1 text-sm text-slate-500">
          Comprehensive assessment across 6 financial dimensions
        </p>
      </div>

      {/* Overall Score Hero */}
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Overall Health Score
        </p>
        <p className="mt-2 text-6xl font-bold text-slate-900">
          {data.overallScore.toFixed(0)}
        </p>
        <p className="mt-1 text-sm text-slate-500">out of 100</p>
        <div
          className={`mt-3 inline-block rounded-full border px-4 py-1 text-lg font-bold ${gradeConfig.color}`}
        >
          Grade {data.grade}: {gradeConfig.label}
        </div>
        {/* Full-width bar */}
        <div className="mx-auto mt-4 h-3 max-w-md rounded-full bg-slate-100">
          <div
            className={`h-3 rounded-full transition-all ${scoreBarColor(data.overallScore)}`}
            style={{ width: `${Math.min(100, data.overallScore)}%` }}
          />
        </div>
      </div>

      {/* Sub-scores Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedSubs.map(({ key, score, label, description }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{label}</p>
              <p className="text-xl font-bold text-slate-900">{score.toFixed(0)}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full transition-all ${scoreBarColor(score)}`}
                style={{ width: `${Math.min(100, score)}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">{score.toFixed(1)}/100</p>
          </div>
        ))}
      </div>

      {/* Improvement Priorities */}
      {weakest.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="text-lg font-semibold text-orange-900">
            Priority Improvements
          </h2>
          <p className="mt-1 text-sm text-orange-700">
            These areas scored below 50 and should be addressed first:
          </p>
          <div className="mt-4 space-y-3">
            {weakest.map((s) => (
              <div key={s.key} className="rounded-lg bg-white/60 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {s.label}{" "}
                  <span className="font-normal text-red-600">({s.score.toFixed(0)}/100)</span>
                </p>
                <p className="mt-1 text-xs text-slate-600">{s.actionWhenLow}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">What This Means</h2>
        <p className="mt-2 text-sm text-slate-700">{gradeConfig.summary}</p>
      </div>
    </div>
  );
}
