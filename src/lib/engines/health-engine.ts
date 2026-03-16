// ============================================================
// Financial Health Score Engine
// Weighted multi-factor health assessment.
// ============================================================

import type {
  HealthScoreInput,
  HealthScoreResult,
  HealthSubScores,
  HealthWeights,
} from "@/types/domain";
import { HealthGrade } from "@/types/enums";
import {
  calcNetBurn,
  calcRunway,
  calcRevenueGrowthRate,
  calcGrossMargin,
  calcConcentrationRisk,
} from "./metrics-engine";

// ──────────────────────────────────────────────
// Default Weights
// ──────────────────────────────────────────────

export const DEFAULT_HEALTH_WEIGHTS: HealthWeights = {
  liquidity: 0.25,
  growth: 0.2,
  margin: 0.15,
  burnDiscipline: 0.2,
  concentration: 0.1,
  governance: 0.1,
};

// ──────────────────────────────────────────────
// Sub-score Calculators (0-100)
// ──────────────────────────────────────────────

/**
 * Liquidity: combination of absolute runway and cash ratio.
 */
function scoreLiquidity(
  cashBalance: number,
  monthlyExpenses: number,
  monthlyRevenue: number
): number {
  const netBurn = calcNetBurn(monthlyExpenses, monthlyRevenue);
  const runway = calcRunway(cashBalance, netBurn);

  // Runway component (0-70 points)
  let runwayPts: number;
  if (runway === Infinity) runwayPts = 70;
  else if (runway >= 18) runwayPts = 70;
  else if (runway >= 12) runwayPts = 50 + ((runway - 12) / 6) * 20;
  else if (runway >= 6) runwayPts = 25 + ((runway - 6) / 6) * 25;
  else runwayPts = (runway / 6) * 25;

  // Cash ratio component (0-30 points): cash vs 3 months of expenses
  const threeMonthCover = monthlyExpenses > 0 ? cashBalance / (monthlyExpenses * 3) : 1;
  const cashPts = Math.min(30, threeMonthCover * 30);

  return Math.min(100, runwayPts + cashPts);
}

/**
 * Growth: revenue growth rate scoring.
 */
function scoreGrowth(
  monthlyRevenue: number,
  previousMonthRevenue: number,
  trendOverride?: number
): number {
  const growthRate =
    trendOverride ?? calcRevenueGrowthRate(monthlyRevenue, previousMonthRevenue);

  if (growthRate === null) return 20; // Pre-revenue baseline
  if (growthRate < -0.1) return 0;
  if (growthRate < 0) return 15 + (growthRate + 0.1) * 150;
  if (growthRate <= 0.05) return 30 + (growthRate / 0.05) * 20;
  if (growthRate <= 0.15) return 50 + ((growthRate - 0.05) / 0.1) * 25;
  if (growthRate <= 0.3) return 75 + ((growthRate - 0.15) / 0.15) * 15;
  return Math.min(100, 90 + (growthRate - 0.3) * 33);
}

/**
 * Margin: gross margin scoring.
 */
function scoreMargin(revenue: number, cogs: number): number {
  const gm = calcGrossMargin(revenue, cogs);
  if (gm === null) return 25;
  if (gm < 0) return 0;
  if (gm < 0.4) return (gm / 0.4) * 40;
  if (gm < 0.6) return 40 + ((gm - 0.4) / 0.2) * 20;
  if (gm < 0.8) return 60 + ((gm - 0.6) / 0.2) * 25;
  return Math.min(100, 85 + ((gm - 0.8) / 0.2) * 15);
}

/**
 * Burn Discipline: how efficiently cash is being spent relative to revenue.
 */
function scoreBurnDiscipline(
  monthlyExpenses: number,
  monthlyRevenue: number,
  avgBurnLast3?: number
): number {
  // Expense-to-revenue ratio (lower is better for established companies)
  const ratio = monthlyRevenue > 0 ? monthlyExpenses / monthlyRevenue : 10;

  let ratioScore: number;
  if (ratio <= 1) ratioScore = 80 + (1 - ratio) * 20; // Profitable
  else if (ratio <= 1.5) ratioScore = 60 + ((1.5 - ratio) / 0.5) * 20;
  else if (ratio <= 2.5) ratioScore = 30 + ((2.5 - ratio) / 1) * 30;
  else if (ratio <= 5) ratioScore = 10 + ((5 - ratio) / 2.5) * 20;
  else ratioScore = 5;

  // Burn consistency bonus (if we have historical data)
  let consistencyBonus = 0;
  if (avgBurnLast3 !== undefined && avgBurnLast3 > 0) {
    const variance = Math.abs(monthlyExpenses - avgBurnLast3) / avgBurnLast3;
    if (variance < 0.1) consistencyBonus = 10;
    else if (variance < 0.2) consistencyBonus = 5;
  }

  return Math.min(100, ratioScore + consistencyBonus);
}

/**
 * Concentration Risk scoring (same logic as survival engine).
 */
function scoreConcentration(largestCustomerShare: number): number {
  const risk = calcConcentrationRisk(largestCustomerShare);
  if (risk <= 0.1) return 100;
  if (risk <= 0.2) return 85 + ((0.2 - risk) / 0.1) * 15;
  if (risk <= 0.35) return 60 + ((0.35 - risk) / 0.15) * 25;
  if (risk <= 0.5) return 35 + ((0.5 - risk) / 0.15) * 25;
  if (risk <= 0.7) return 15 + ((0.7 - risk) / 0.2) * 20;
  return Math.max(0, (1 - risk) * 50);
}

/**
 * Governance proxy score based on yes/no practices.
 */
function scoreGovernance(
  hasMonthlyClose: boolean,
  hasBoardReporting: boolean,
  hasAuditedFinancials: boolean
): number {
  let score = 20; // Baseline for existing
  if (hasMonthlyClose) score += 35;
  if (hasBoardReporting) score += 25;
  if (hasAuditedFinancials) score += 20;
  return score;
}

// ──────────────────────────────────────────────
// Grade from Score
// ──────────────────────────────────────────────

export function gradeFromScore(score: number): HealthGrade {
  if (score >= 80) return HealthGrade.A;
  if (score >= 65) return HealthGrade.B;
  if (score >= 50) return HealthGrade.C;
  if (score >= 35) return HealthGrade.D;
  return HealthGrade.F;
}

// ──────────────────────────────────────────────
// Main Engine
// ──────────────────────────────────────────────

export function calculateHealthScore(
  input: HealthScoreInput,
  weights: HealthWeights = DEFAULT_HEALTH_WEIGHTS
): HealthScoreResult {
  const subScores: HealthSubScores = {
    liquidityScore: scoreLiquidity(
      input.cashBalance,
      input.monthlyExpenses,
      input.monthlyRevenue
    ),
    growthScore: scoreGrowth(
      input.monthlyRevenue,
      input.previousMonthRevenue,
      input.revenueGrowthTrend3m
    ),
    marginScore: scoreMargin(input.monthlyRevenue, input.cogs),
    burnDisciplineScore: scoreBurnDiscipline(
      input.monthlyExpenses,
      input.monthlyRevenue,
      input.avgMonthlyBurnLast3
    ),
    concentrationScore: scoreConcentration(input.largestCustomerShare),
    governanceScore: scoreGovernance(
      input.hasMonthlyClose,
      input.hasBoardReporting,
      input.hasAuditedFinancials
    ),
  };

  const overallScore =
    subScores.liquidityScore * weights.liquidity +
    subScores.growthScore * weights.growth +
    subScores.marginScore * weights.margin +
    subScores.burnDisciplineScore * weights.burnDiscipline +
    subScores.concentrationScore * weights.concentration +
    subScores.governanceScore * weights.governance;

  const rounded = Math.round(overallScore * 100) / 100;

  return {
    subScores,
    overallScore: rounded,
    grade: gradeFromScore(rounded),
    weights,
  };
}
