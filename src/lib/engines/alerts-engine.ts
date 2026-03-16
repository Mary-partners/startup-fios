// ============================================================
// Alerts Engine
// Evaluates financial data against defined thresholds.
// ============================================================

import type { AlertRule, AlertContext, AlertEvaluation } from "@/types/domain";
import { AlertType, AlertSeverity } from "@/types/enums";

// ──────────────────────────────────────────────
// Alert Rule Definitions
// ──────────────────────────────────────────────

export const ALERT_RULES: AlertRule[] = [
  // LOW RUNWAY
  {
    type: AlertType.LOW_RUNWAY,
    severity: AlertSeverity.CRITICAL,
    title: "Critical: Runway Below 3 Months",
    evaluate: (ctx) => {
      if (ctx.runway < 3 && ctx.runway !== Infinity) {
        return {
          type: AlertType.LOW_RUNWAY,
          severity: AlertSeverity.CRITICAL,
          title: "Critical: Runway Below 3 Months",
          message: `Your current runway is ${ctx.runway.toFixed(1)} months. Immediate action required to extend runway through cost reduction or fundraising.`,
          metric: "runway",
          value: ctx.runway,
          threshold: 3,
        };
      }
      return null;
    },
  },
  {
    type: AlertType.LOW_RUNWAY,
    severity: AlertSeverity.WARNING,
    title: "Warning: Runway Below 6 Months",
    evaluate: (ctx) => {
      if (ctx.runway >= 3 && ctx.runway < 6) {
        return {
          type: AlertType.LOW_RUNWAY,
          severity: AlertSeverity.WARNING,
          title: "Warning: Runway Below 6 Months",
          message: `Your runway is ${ctx.runway.toFixed(1)} months. Begin fundraising preparations or identify cost savings.`,
          metric: "runway",
          value: ctx.runway,
          threshold: 6,
        };
      }
      return null;
    },
  },

  // HIGH BURN
  {
    type: AlertType.HIGH_BURN,
    severity: AlertSeverity.WARNING,
    title: "Burn Rate Exceeding Revenue by 3x+",
    evaluate: (ctx) => {
      if (ctx.grossMargin !== null && ctx.grossMargin < -2) {
        return {
          type: AlertType.HIGH_BURN,
          severity: AlertSeverity.WARNING,
          title: "Burn Rate Exceeding Revenue by 3x+",
          message:
            "Your expenses significantly exceed revenue. Review spending priorities and unit economics.",
          metric: "expense_to_revenue_ratio",
          value: ctx.grossMargin,
          threshold: -2,
        };
      }
      return null;
    },
  },

  // LOW MARGIN
  {
    type: AlertType.LOW_MARGIN,
    severity: AlertSeverity.WARNING,
    title: "Gross Margin Below 40%",
    evaluate: (ctx) => {
      if (ctx.grossMargin !== null && ctx.grossMargin >= 0 && ctx.grossMargin < 0.4) {
        return {
          type: AlertType.LOW_MARGIN,
          severity: AlertSeverity.WARNING,
          title: "Gross Margin Below 40%",
          message: `Gross margin is ${(ctx.grossMargin * 100).toFixed(1)}%. For SaaS/software businesses, target 60%+ to be investor-attractive.`,
          metric: "gross_margin",
          value: ctx.grossMargin,
          threshold: 0.4,
        };
      }
      return null;
    },
  },

  // POOR GROWTH
  {
    type: AlertType.POOR_GROWTH,
    severity: AlertSeverity.WARNING,
    title: "Revenue Growth Stalling",
    evaluate: (ctx) => {
      if (
        ctx.revenueGrowthRate !== null &&
        ctx.revenueGrowthRate < 0.02
      ) {
        return {
          type: AlertType.POOR_GROWTH,
          severity:
            ctx.revenueGrowthRate < 0
              ? AlertSeverity.CRITICAL
              : AlertSeverity.WARNING,
          title:
            ctx.revenueGrowthRate < 0
              ? "Revenue Declining"
              : "Revenue Growth Below 2%",
          message: `Month-over-month revenue growth is ${(ctx.revenueGrowthRate * 100).toFixed(1)}%. Investigate pipeline health and customer retention.`,
          metric: "revenue_growth_rate",
          value: ctx.revenueGrowthRate,
          threshold: 0.02,
        };
      }
      return null;
    },
  },

  // HIGH CONCENTRATION
  {
    type: AlertType.HIGH_CONCENTRATION,
    severity: AlertSeverity.WARNING,
    title: "High Revenue Concentration Risk",
    evaluate: (ctx) => {
      if (ctx.concentrationRisk > 0.4) {
        return {
          type: AlertType.HIGH_CONCENTRATION,
          severity:
            ctx.concentrationRisk > 0.6
              ? AlertSeverity.CRITICAL
              : AlertSeverity.WARNING,
          title:
            ctx.concentrationRisk > 0.6
              ? "Critical Customer Dependency"
              : "High Revenue Concentration",
          message: `${(ctx.concentrationRisk * 100).toFixed(0)}% of revenue from a single customer. Loss of this customer would severely impact the business.`,
          metric: "concentration_risk",
          value: ctx.concentrationRisk,
          threshold: 0.4,
        };
      }
      return null;
    },
  },

  // INCOMPLETE READINESS
  {
    type: AlertType.INCOMPLETE_READINESS,
    severity: AlertSeverity.INFO,
    title: "Investor Readiness Assessment Incomplete",
    evaluate: (ctx) => {
      if (ctx.readinessScore !== undefined && ctx.readinessScore < 30) {
        return {
          type: AlertType.INCOMPLETE_READINESS,
          severity: AlertSeverity.INFO,
          title: "Low Investor Readiness Score",
          message:
            "Your investor readiness score is below 30. Complete the assessment and address key gaps before approaching investors.",
          metric: "readiness_score",
          value: ctx.readinessScore,
          threshold: 30,
        };
      }
      return null;
    },
  },

  // MISSING DATA
  {
    type: AlertType.MISSING_DATA,
    severity: AlertSeverity.INFO,
    title: "Incomplete Financial Data",
    evaluate: (ctx) => {
      if (ctx.missingFields.length > 0) {
        return {
          type: AlertType.MISSING_DATA,
          severity: AlertSeverity.INFO,
          title: "Incomplete Financial Data",
          message: `Missing data: ${ctx.missingFields.join(", ")}. Complete data entry for more accurate analysis.`,
          metric: "data_completeness",
          value: ctx.missingFields.length,
          threshold: 0,
        };
      }
      return null;
    },
  },
];

// ──────────────────────────────────────────────
// Main Evaluator
// ──────────────────────────────────────────────

export function evaluateAlerts(context: AlertContext): AlertEvaluation[] {
  const alerts: AlertEvaluation[] = [];

  for (const rule of ALERT_RULES) {
    const result = rule.evaluate(context);
    if (result) {
      alerts.push(result);
    }
  }

  // Sort by severity: CRITICAL first, then WARNING, then INFO
  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  alerts.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return alerts;
}
