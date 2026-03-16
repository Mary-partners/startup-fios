// ============================================================
// ResultsDisplay - Full survival predictor results breakdown
// Accepts the canonical SurvivalResult type from domain.ts
// ============================================================

"use client";

import ScoreGauge from "./score-gauge";
import { formatCurrency } from "@/lib/utils/formatting";
import type { SurvivalResult } from "@/types/domain";

interface ResultsDisplayProps {
  result: SurvivalResult;
}

const METRIC_LABELS: Record<string, { label: string; weight: string }> = {
  runwayScore: { label: "Runway", weight: "30%" },
  burnMultipleScore: { label: "Burn Efficiency", weight: "25%" },
  revenueGrowthScore: { label: "Revenue Growth", weight: "20%" },
  grossMarginScore: { label: "Gross Margin", weight: "15%" },
  concentrationScore: { label: "Concentration Risk", weight: "10%" },
};

const RISK_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  MODERATE: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  LOW: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  STRONG: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { metrics, subScores, survivalScore, riskLevel, isPreRevenue, confidenceFlag, recommendation, weights } = result;
  const riskStyle = RISK_STYLES[riskLevel] ?? RISK_STYLES.MODERATE;

  // Build weight display from the actual weights used (accounts for pre-revenue redistribution)
  const weightMap: Record<string, number> = {
    runwayScore: weights.runway,
    burnMultipleScore: weights.burnMultiple,
    revenueGrowthScore: weights.revenueGrowth,
    grossMarginScore: weights.grossMargin,
    concentrationScore: weights.concentration,
  };

  return (
    <div className="space-y-8">
      {/* Hero Score */}
      <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <ScoreGauge score={survivalScore} label="Survival Score" size={200} />

        <div className="mt-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {metrics.runway >= 999 ? "∞" : `${metrics.runway.toFixed(1)}mo`}
            </p>
            <p className="text-xs text-slate-500">Runway</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(Math.abs(metrics.netBurn))}
            </p>
            <p className="text-xs text-slate-500">
              {metrics.netBurn <= 0 ? "Cash-flow positive" : "Net Burn / mo"}
            </p>
          </div>
          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${riskStyle.bg} ${riskStyle.text}`}
            >
              {riskLevel}
            </span>
            <p className="mt-1 text-xs text-slate-500">Risk Level</p>
          </div>
        </div>

        {isPreRevenue && (
          <p className="mt-4 text-sm text-slate-500">
            Pre-revenue startup. Score weighted toward runway
          </p>
        )}
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Gross Burn"
          value={formatCurrency(metrics.grossBurn) + "/mo"}
        />
        <MetricTile
          label="Burn Multiple"
          value={metrics.burnMultiple !== null ? `${metrics.burnMultiple.toFixed(2)}x` : "N/A"}
          annotation={
            metrics.burnMultiple !== null
              ? metrics.burnMultiple <= 1.5 ? "Efficient" : metrics.burnMultiple <= 2.5 ? "Acceptable" : "Concerning"
              : "Insufficient data"
          }
        />
        <MetricTile
          label="Revenue Growth"
          value={
            metrics.revenueGrowthRate !== null
              ? `${(metrics.revenueGrowthRate * 100).toFixed(1)}%`
              : "N/A"
          }
          annotation={isPreRevenue ? "Pre-revenue" : undefined}
        />
        <MetricTile
          label="Gross Margin"
          value={
            metrics.grossMargin !== null
              ? `${(metrics.grossMargin * 100).toFixed(1)}%`
              : "N/A"
          }
        />
        <MetricTile
          label="Concentration Risk"
          value={`${(metrics.concentrationRisk * 100).toFixed(0)}%`}
          annotation={
            metrics.concentrationRisk > 0.5
              ? "High dependency"
              : metrics.concentrationRisk > 0.3
              ? "Moderate dependency"
              : "Diversified"
          }
        />
        <MetricTile
          label="Runway"
          value={metrics.runway >= 999 ? "Cash-flow positive" : `${metrics.runway.toFixed(1)} months`}
          annotation={
            metrics.runway >= 999
              ? undefined
              : metrics.runway < 6
              ? "Critical: under 6 months"
              : metrics.runway < 12
              ? "Needs attention"
              : "Healthy"
          }
        />
      </div>

      {/* Sub-scores Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Score Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(subScores).map(([key, value]) => {
            const meta = METRIC_LABELS[key];
            if (!meta) return null;
            const actualWeight = weightMap[key];
            const weightLabel = actualWeight !== undefined
              ? `${(actualWeight * 100).toFixed(0)}%`
              : meta.weight;
            const color =
              value >= 70 ? "bg-green-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500";

            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-40 text-sm text-slate-600">
                  {meta.label}
                  <span className="ml-1 text-xs text-slate-400">({weightLabel})</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-sm font-semibold text-slate-700">
                  {Math.round(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-xl border p-6 ${riskStyle.border} ${riskStyle.bg}`}>
        <h3 className={`mb-3 font-semibold ${riskStyle.text}`}>Recommendation</h3>
        <p className="text-sm leading-relaxed text-slate-700">{recommendation}</p>
      </div>

      {/* Confidence Warning */}
      {confidenceFlag !== "FULL" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          <span className="font-semibold">Data Confidence: {confidenceFlag}</span>. Some
          metrics were estimated based on limited data. Provide more financial details for a more
          accurate assessment.
        </div>
      )}
    </div>
  );
}

/** Small metric tile for the detailed grid */
function MetricTile({
  label,
  value,
  annotation,
}: {
  label: string;
  value: string;
  annotation?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {annotation && (
        <p className="mt-1 text-xs text-slate-500">{annotation}</p>
      )}
    </div>
  );
}
