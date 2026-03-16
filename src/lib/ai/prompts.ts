// ============================================================
// AI Prompt Templates
// Deterministic metrics are computed BEFORE these prompts run.
// AI only generates narrative/commentary on top of calculations.
// ============================================================

import type { CommentaryRequest } from "@/types/domain";

export const SYSTEM_PROMPT = `You are an expert fractional CFO advisor working for CFO Innovation Partners.
You provide clear, actionable financial commentary for startup founders.

Your communication style:
- Direct and concise — founders are busy
- Lead with the most important insight
- Use specific numbers from the provided data
- Always tie observations to actionable recommendations
- Be honest about risks without being alarmist
- Frame advice in terms of investor expectations where relevant

You NEVER fabricate numbers. You only reference the metrics provided to you.
You NEVER provide legal, tax, or audit advice — you flag when a specialist is needed.`;

export function buildCommentaryPrompt(req: CommentaryRequest): string {
  const { companyName, stage, metrics, survivalScore, riskLevel, healthScore, healthGrade, alerts } = req;

  const alertLines = alerts.length > 0
    ? alerts.map((a) => `  - [${a.severity}] ${a.title}: ${a.message}`).join("\n")
    : "  No active alerts.";

  const trendLines = req.historicalTrend && req.historicalTrend.length > 1
    ? req.historicalTrend
        .map(
          (s) =>
            `  ${s.year}-${String(s.month).padStart(2, "0")}: Revenue $${s.revenue.toLocaleString()}, Expenses $${s.expenses.toLocaleString()}, Cash $${s.cashBalance.toLocaleString()}, Runway ${s.runway.toFixed(1)}mo`
        )
        .join("\n")
    : "  Insufficient historical data.";

  return `Generate a financial commentary for ${companyName} (stage: ${stage}).

COMPUTED METRICS (deterministic — do not recalculate):
  Survival Score: ${survivalScore}/100 (Risk Level: ${riskLevel})
  Gross Burn: $${metrics.grossBurn.toLocaleString()}/mo
  Net Burn: $${metrics.netBurn.toLocaleString()}/mo
  Runway: ${metrics.runway === 999 ? "Cash-flow positive" : metrics.runway.toFixed(1) + " months"}
  Burn Multiple: ${metrics.burnMultiple !== null ? metrics.burnMultiple.toFixed(2) + "x" : "N/A (no net new revenue)"}
  Revenue Growth: ${metrics.revenueGrowthRate !== null ? (metrics.revenueGrowthRate * 100).toFixed(1) + "%" : "N/A"}
  Gross Margin: ${metrics.grossMargin !== null ? (metrics.grossMargin * 100).toFixed(1) + "%" : "N/A"}
  Concentration Risk: ${(metrics.concentrationRisk * 100).toFixed(0)}%
  ${healthScore !== undefined ? `Financial Health Score: ${healthScore}/100 (Grade: ${healthGrade})` : ""}

ACTIVE ALERTS:
${alertLines}

HISTORICAL TREND:
${trendLines}

Respond with a JSON object containing:
{
  "executiveSummary": "2-3 sentence overview of financial position",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "risks": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "outlook": "1-2 sentence forward-looking statement"
}

Be specific. Reference actual numbers. Keep each finding/risk/recommendation to 1-2 sentences.`;
}

export function buildBoardPackSummaryPrompt(
  companyName: string,
  periodLabel: string,
  metricsJson: string
): string {
  return `Write a board-ready executive summary for ${companyName} for ${periodLabel}.

FINANCIAL DATA:
${metricsJson}

The summary should be:
- 3-4 paragraphs
- Professional tone suitable for board members and investors
- Lead with the headline (good or bad)
- Cover: financial performance, key metrics, risks, and near-term priorities
- Close with a forward-looking statement

Do not use bullet points. Write in complete paragraphs.`;
}

export function buildAlertNarrativePrompt(
  alertType: string,
  metricValue: number,
  threshold: number,
  companyContext: string
): string {
  return `Write a brief, actionable alert narrative for a startup founder.

Alert: ${alertType}
Current Value: ${metricValue}
Threshold: ${threshold}
Context: ${companyContext}

Respond with 2-3 sentences: what happened, why it matters, and what to do next.`;
}
