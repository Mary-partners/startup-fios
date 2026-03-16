"use client";

// ============================================================
// Investor Readiness Assessment Page - Refactored with
// progress tracking, collapsible categories, and richer UX
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/dashboard/metric-card";

interface Question {
  id: string;
  category: string;
  text: string;
  description: string;
  weight: number;
}

interface CategoryScore {
  category: string;
  score: number;
  maxPossible: number;
  questionsAnswered: number;
  totalQuestions: number;
}

interface ReadinessResult {
  categoryScores: Record<string, CategoryScore>;
  overallScore: number;
  readinessLevel: string;
  recommendations: {
    category: string;
    priority: string;
    title: string;
    description: string;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  reporting: "Financial Reporting",
  controls: "Internal Controls",
  cap_table: "Cap Table Management",
  kpi_clarity: "KPI Clarity",
  governance: "Corporate Governance",
  forecasting: "Financial Forecasting",
  due_diligence: "Due Diligence Readiness",
};

const ANSWER_LABELS = [
  { value: 1, label: "Not Started", color: "bg-red-100 text-red-700 border-red-200" },
  { value: 2, label: "Early Stage", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: 3, label: "In Progress", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: 4, label: "Mostly Done", color: "bg-green-100 text-green-700 border-green-200" },
  { value: 5, label: "Complete", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

const READINESS_BADGE: Record<string, { bg: string; label: string }> = {
  INVESTOR_READY: { bg: "bg-emerald-100 text-emerald-700", label: "Investor Ready" },
  STRONG: { bg: "bg-green-100 text-green-700", label: "Strong" },
  DEVELOPING: { bg: "bg-yellow-100 text-yellow-700", label: "Developing" },
  EARLY: { bg: "bg-orange-100 text-orange-700", label: "Early Stage" },
  NOT_READY: { bg: "bg-red-100 text-red-700", label: "Not Ready" },
};

export default function InvestorReadinessPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/investor-readiness")
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) {
          setError(json.error);
          return;
        }
        setQuestions(json.data.questions);
        if (json.data.latestAssessment?.answers) {
          const existing: Record<string, number> = {};
          for (const a of json.data.latestAssessment.answers) {
            existing[a.questionId] = a.answer;
          }
          setAnswers(existing);
        }
      })
      .catch(() => setError("Failed to load assessment"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const answerArray = Object.entries(answers).map(([questionId, answer]) => {
      const q = questions.find((q) => q.id === questionId);
      return { questionId, category: q?.category ?? "", answer };
    });

    try {
      const res = await fetch("/api/investor-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArray }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to submit");
        return;
      }
      setResult(json.data);
      // Scroll to top to see results
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Group questions by category
  const grouped = useMemo(
    () =>
      questions.reduce(
        (acc, q) => {
          if (!acc[q.category]) acc[q.category] = [];
          acc[q.category].push(q);
          return acc;
        },
        {} as Record<string, Question[]>
      ),
    [questions]
  );

  const toggleCategory = (cat: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Per-category completion
  const catCompletion = useMemo(() => {
    const result: Record<string, { answered: number; total: number }> = {};
    for (const [cat, qs] of Object.entries(grouped)) {
      result[cat] = {
        total: qs.length,
        answered: qs.filter((q) => answers[q.id] != null).length,
      };
    }
    return result;
  }, [grouped, answers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading assessment...</p>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Investor Readiness</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-800">{error}</p>
          {error.includes("upgraded") && (
            <Link
              href="/pricing"
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              View Plans
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Investor Readiness Assessment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rate your readiness across {Object.keys(grouped).length} categories ({totalCount} questions).
          Your score shows exactly what to improve before approaching investors.
        </p>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="space-y-4">
          {/* Score Hero */}
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Your Readiness Score
            </p>
            <p className="mt-2 text-5xl font-bold text-slate-900">
              {result.overallScore.toFixed(0)}
            </p>
            <p className="mt-1 text-sm text-slate-500">out of 100</p>
            <div className="mt-3">
              <span
                className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${
                  READINESS_BADGE[result.readinessLevel]?.bg ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {READINESS_BADGE[result.readinessLevel]?.label ?? result.readinessLevel}
              </span>
            </div>
            <div className="mx-auto mt-4 h-3 max-w-md rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full transition-all ${
                  result.overallScore >= 70
                    ? "bg-green-500"
                    : result.overallScore >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, result.overallScore)}%` }}
              />
            </div>
          </div>

          {/* Category Breakdown Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(result.categoryScores).map(([cat, cs]) => (
              <ScoreCard
                key={cat}
                title={CATEGORY_LABELS[cat] ?? cat}
                score={cs.score}
                maxScore={100}
              />
            ))}
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Prioritized Recommendations</h2>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            rec.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : rec.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rec.priority}
                        </span>
                        <span className="text-xs text-slate-400">
                          {CATEGORY_LABELS[rec.category] ?? rec.category}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{rec.title}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            Progress: {answeredCount} of {totalCount} questions
          </p>
          <p className="text-sm font-bold text-slate-900">{progressPct}%</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Assessment Form - Collapsible Categories */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(grouped).map(([category, qs]) => {
          const cc = catCompletion[category];
          const isCollapsed = collapsedCats.has(category);
          const catComplete = cc && cc.answered === cc.total;

          return (
            <div key={category} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between border-b bg-slate-50 px-6 py-4 text-left hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-slate-900">
                    {CATEGORY_LABELS[category] ?? category}
                  </span>
                  {catComplete && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Complete
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {cc?.answered ?? 0}/{cc?.total ?? 0}
                  </span>
                  <span className="text-slate-400">{isCollapsed ? "▶" : "▼"}</span>
                </div>
              </button>

              {/* Questions */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100 px-6">
                  {qs.map((q) => (
                    <div key={q.id} className="py-5">
                      <p className="font-medium text-slate-900">{q.text}</p>
                      <p className="mt-1 text-sm text-slate-500">{q.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ANSWER_LABELS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                            }
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                              answers[q.id] === opt.value
                                ? opt.color + " ring-2 ring-offset-1 ring-blue-400"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {opt.value}. {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            {answeredCount === 0
              ? "Answer at least one question to calculate your score"
              : `${answeredCount} of ${totalCount} questions answered`}
          </p>
          <button
            type="submit"
            disabled={submitting || answeredCount === 0}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting
              ? "Calculating..."
              : result
              ? "Recalculate Score"
              : "Calculate Readiness Score"}
          </button>
        </div>
      </form>
    </div>
  );
}
