// ============================================================
// Survival Score Engine
// Calculates the Startup Survival Predictor score.
// Pure functions — deterministic, testable, no side effects.
// ============================================================

import type {
  SurvivalPredictorInput,
  SurvivalResult,
  SurvivalMetrics,
  SurvivalSubScores,
  SurvivalWeights,
} from "@/types/domain";
import { RiskLevel, ConfidenceFlag } from "@/types/enums";
import {
  calcGrossBurn,
  calcNetBurn,
  calcRunway,
  calcBurnMultiple,
  calcRevenueGrowthRate,
  calcGrossMargin,
  calcConcentrationRisk,
} from "./metrics-engine";

// ──────────────────────────────────────────────
// Default Weights
// ──────────────────────────────────────────────

export const DEFAULT_SURVIVAL_WEIGHTS: SurvivalWeights = {
  runway: 0.3,
  burnMultiple: 0.25,
  revenueGrowth: 0.2,
  grossMargin: 0.15,
  concentration: 0.1,
};

// ──────────────────────────────────────────────
// Score Banding Functions (0-100 scale)
// ──────────────────────────────────────────────

/**
 * Runway score: higher runway = better score.
 * 0 months = 0, 3 months = 30, 6 = 50, 12 = 75, 18+ = 95, 24+ = 100
 */
export function scoreRunway(runwayMonths: number): number {
  if (runwayMonths === Infinity) return 100;
  if (runwayMonths <= 0) return 0;
  if (runwayMonths >= 24) return 100;
  if (runwayMonths >= 18) return 90 + ((runwayMonths - 18) / 6) * 10;
  if (runwayMonths >= 12) return 75 + ((runwayMonths - 12) / 6) * 15;
  if (runwayMonths >= 6) return 50 + ((runwayMonths - 6) / 6) * 25;
  if (runwayMonths >= 3) return 20 + ((runwayMonths - 3) / 3) * 30;
  return (runwayMonths / 3) * 20;
}

/**
 * Burn Multiple score: lower is better.
 * <= 0 (cash-flow positive) = 100
 * < 1x = 90, 1-2x = 70, 2-4x = 40, > 4x = 10
 * null (no growth) handled by caller.
 */
export function scoreBurnMultiple(burnMultiple: number | null): number {
  if (burnMultiple === null) return 40; // Neutral when no growth data
  if (burnMultiple <= 0) return 100;
  if (burnMultiple < 1) return 85 + (1 - burnMultiple) * 15;
  if (burnMultiple <= 2) return 70 + (2 - burnMultiple) * 15;
  if (burnMultiple <= 4) return 30 + ((4 - burnMultiple) / 2) * 40;
  if (burnMultiple <= 8) return 10 + ((8 - burnMultiple) / 4) * 20;
  return 5;
}

/**
 * Revenue Growth score: higher MoM growth = better.
 * Negative growth = 0-20
 * 0% = 30
 * 5% = 50
 * 10% = 65
 * 20% = 80
 * 30%+ = 90-100
 * null (pre-revenue) uses a reduced score.
 */
export function scoreRevenueGrowth(growthRate: number | null): number {
  if (growthRate === null) return 25; // Pre-revenue baseline
  if (growthRate < -0.2) return 0;
  if (growthRate < 0) return 10 + (growthRate + 0.2) * 50;
  if (growthRate === 0) return 30;
  if (growthRate <= 0.05) return 30 + (growthRate / 0.05) * 20;
  if (growthRate <= 0.1) return 50 + ((growthRate - 0.05) / 0.05) * 15;
  if (growthRate <= 0.2) return 65 + ((growthRate - 0.1) / 0.1) * 15;
  if (growthRate <= 0.3) return 80 + ((growthRate - 0.2) / 0.1) * 10;
  return Math.min(100, 90 + (growthRate - 0.3) * 33);
}

/**
 * Gross Margin score: higher = better.
 * Negative = 0, 0% = 10, 30% = 40, 50% = 60, 70% = 80, 80%+ = 90-100
 * null (pre-revenue) = baseline.
 */
export function scoreGrossMargin(grossMargin: number | null): number {
  if (grossMargin === null) return 30; // Pre-revenue baseline
  if (grossMargin < 0) return 0;
  if (grossMargin <= 0.3) return 10 + (grossMargin / 0.3) * 30;
  if (grossMargin <= 0.5) return 40 + ((grossMargin - 0.3) / 0.2) * 20;
  if (grossMargin <= 0.7) return 60 + ((grossMargin - 0.5) / 0.2) * 20;
  if (grossMargin <= 0.85) return 80 + ((grossMargin - 0.7) / 0.15) * 15;
  return Math.min(100, 95 + (grossMargin - 0.85) * 33);
}

/**
 * Concentration Risk score: lower concentration = better score.
 * 0% = 100 (perfectly distributed)
 * 20% = 80
 * 40% = 60
 * 60% = 35
 * 80%+ = 10-0
 */
export function scoreConcentration(concentrationRisk: number): number {
  if (concentrationRisk <= 0) return 100;
  if (concentrationRisk <= 0.2) return 100 - concentrationRisk * 100;
  if (concentrationRisk <= 0.4) return 80 - ((concentrationRisk - 0.2) / 0.2) * 20;
  if (concentrationRisk <= 0.6) return 60 - ((concentrationRisk - 0.4) / 0.2) * 25;
  if (concentrationRisk <= 0.8) return 35 - ((concentrationRisk - 0.6) / 0.2) * 25;
  return Math.max(0, 10 - ((concentrationRisk - 0.8) / 0.2) * 10);
}

// ──────────────────────────────────────────────
// Risk Level from Score
// ──────────────────────────────────────────────

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return RiskLevel.STRONG;
  if (score >= 60) return RiskLevel.LOW;
  if (score >= 40) return RiskLevel.MODERATE;
  if (score >= 20) return RiskLevel.HIGH;
  return RiskLevel.CRITICAL;
}

// ──────────────────────────────────────────────
// Confidence Assessment
// ──────────────────────────────────────────────

function assessConfidence(input: SurvivalPredictorInput): ConfidenceFlag {
  const missing: string[] = [];
  if (input.monthlyRevenue === 0 && input.previousMonthRevenue === 0) {
    missing.push("revenue");
  }
  if (input.cogs === 0) missing.push("cogs");
  if (input.largestCustomerShare === 0) missing.push("concentration");

  if (missing.length === 0) return ConfidenceFlag.FULL;
  if (missing.length <= 1) return ConfidenceFlag.PARTIAL;
  return ConfidenceFlag.LOW;
}

// ──────────────────────────────────────────────
// Recommendation Generator (deterministic)
// ──────────────────────────────────────────────

function generateRecommendation(
  metrics: SurvivalMetrics,
  subScores: SurvivalSubScores,
  score: number,
  riskLevel: RiskLevel,
  isPreRevenue: boolean
): string {
  const parts: string[] = [];

  if (riskLevel === RiskLevel.CRITICAL) {
    parts.push(
      "URGENT: Your startup is at critical risk. Immediate action is required to extend runway."
    );
  } else if (riskLevel === RiskLevel.HIGH) {
    parts.push(
      "Your startup faces significant financial risk. Focused attention on burn management is needed."
    );
  } else if (riskLevel === RiskLevel.MODERATE) {
    parts.push(
      "Your financial position is moderate with room for improvement in key areas."
    );
  } else if (riskLevel === RiskLevel.LOW) {
    parts.push(
      "Your startup is in a healthy financial position with manageable risk."
    );
  } else {
    parts.push(
      "Strong financial position. Continue disciplined execution."
    );
  }

  // Specific findings
  if (metrics.runway < 6 && metrics.runway !== Infinity) {
    parts.push(
      `With ${metrics.runway.toFixed(1)} months of runway, securing additional funding or reducing burn should be a top priority.`
    );
  }

  if (metrics.burnMultiple !== null && metrics.burnMultiple > 4) {
    parts.push(
      `Your burn multiple of ${metrics.burnMultiple.toFixed(1)}x indicates you are spending significantly more than your revenue growth justifies. Target below 2x.`
    );
  }

  if (metrics.grossMargin !== null && metrics.grossMargin < 0.5) {
    parts.push(
      `Gross margin of ${(metrics.grossMargin * 100).toFixed(0)}% is below the 50%+ threshold investors typically look for in software businesses.`
    );
  }

  if (metrics.concentrationRisk > 0.4) {
    parts.push(
      `Revenue concentration of ${(metrics.concentrationRisk * 100).toFixed(0)}% in a single customer creates significant risk. Prioritize diversification.`
    );
  }

  if (isPreRevenue) {
    parts.push(
      "As a pre-revenue startup, your survival depends primarily on runway management and reaching product-market fit."
    );
  }

  return parts.join(" ");
}

// ──────────────────────────────────────────────
// Main Engine
// ──────────────────────────────────────────────

export function calculateSurvivalScore(
  input: SurvivalPredictorInput,
  weights: SurvivalWeights = DEFAULT_SURVIVAL_WEIGHTS
): SurvivalResult {
  const isPreRevenue =
    input.monthlyRevenue === 0 && input.previousMonthRevenue === 0;

  // Apply planned hires adjustment if provided
  const effectiveExpenses =
    input.monthlyExpenses + (input.plannedHiresImpact ?? 0);

  // Calculate raw metrics
  const grossBurn = calcGrossBurn(effectiveExpenses);
  const netBurn = calcNetBurn(effectiveExpenses, input.monthlyRevenue);
  const runway = calcRunway(input.cashBalance, netBurn);
  const burnMultiple = calcBurnMultiple(
    netBurn,
    input.monthlyRevenue,
    input.previousMonthRevenue
  );
  const revenueGrowthRate = calcRevenueGrowthRate(
    input.monthlyRevenue,
    input.previousMonthRevenue
  );
  const grossMargin = calcGrossMargin(input.monthlyRevenue, input.cogs);
  const concentrationRisk = calcConcentrationRisk(input.largestCustomerShare);

  const metrics: SurvivalMetrics = {
    grossBurn,
    netBurn,
    runway: runway === Infinity ? 999 : Math.round(runway * 10) / 10,
    burnMultiple:
      burnMultiple !== null ? Math.round(burnMultiple * 100) / 100 : null,
    revenueGrowthRate:
      revenueGrowthRate !== null
        ? Math.round(revenueGrowthRate * 10000) / 10000
        : null,
    grossMargin:
      grossMargin !== null ? Math.round(grossMargin * 10000) / 10000 : null,
    concentrationRisk: Math.round(concentrationRisk * 10000) / 10000,
  };

  // Score each metric
  const subScores: SurvivalSubScores = {
    runwayScore: scoreRunway(runway),
    burnMultipleScore: scoreBurnMultiple(burnMultiple),
    revenueGrowthScore: scoreRevenueGrowth(revenueGrowthRate),
    grossMarginScore: scoreGrossMargin(grossMargin),
    concentrationScore: scoreConcentration(concentrationRisk),
  };

  // Weighted composite — handle pre-revenue redistribution
  let effectiveWeights = { ...weights };
  if (isPreRevenue) {
    // Pre-revenue: shift burn-multiple and growth weight to runway
    effectiveWeights = {
      runway: weights.runway + weights.burnMultiple * 0.5 + weights.revenueGrowth * 0.3,
      burnMultiple: weights.burnMultiple * 0.5,
      revenueGrowth: weights.revenueGrowth * 0.7,
      grossMargin: weights.grossMargin * 0.5,
      concentration: weights.concentration,
    };
    // Normalize to 1.0
    const total =
      effectiveWeights.runway +
      effectiveWeights.burnMultiple +
      effectiveWeights.revenueGrowth +
      effectiveWeights.grossMargin +
      effectiveWeights.concentration;
    effectiveWeights.runway /= total;
    effectiveWeights.burnMultiple /= total;
    effectiveWeights.revenueGrowth /= total;
    effectiveWeights.grossMargin /= total;
    effectiveWeights.concentration /= total;
  }

  const survivalScore =
    subScores.runwayScore * effectiveWeights.runway +
    subScores.burnMultipleScore * effectiveWeights.burnMultiple +
    subScores.revenueGrowthScore * effectiveWeights.revenueGrowth +
    subScores.grossMarginScore * effectiveWeights.grossMargin +
    subScores.concentrationScore * effectiveWeights.concentration;

  const roundedScore = Math.round(survivalScore * 100) / 100;
  const riskLevel = riskLevelFromScore(roundedScore);
  const confidenceFlag = assessConfidence(input);

  const recommendation = generateRecommendation(
    metrics,
    subScores,
    roundedScore,
    riskLevel,
    isPreRevenue
  );

  return {
    metrics,
    subScores,
    survivalScore: roundedScore,
    riskLevel,
    isPreRevenue,
    confidenceFlag,
    recommendation,
    weights: effectiveWeights,
  };
}
