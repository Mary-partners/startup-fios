// ============================================================
// Core Domain Types
// ============================================================

import {
  RiskLevel,
  ConfidenceFlag,
  HealthGrade,
  ReadinessLevel,
  AlertSeverity,
  AlertType,
  AdvisoryCasePriority,
} from "./enums";

// ──────────────────────────────────────────────
// Survival Predictor
// ──────────────────────────────────────────────

export interface SurvivalPredictorInput {
  cashBalance: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  monthlyExpenses: number;
  cogs: number;
  largestCustomerShare: number; // 0-1
  plannedHiresImpact?: number;
}

export interface SurvivalMetrics {
  grossBurn: number;
  netBurn: number;
  runway: number; // months
  burnMultiple: number | null;
  revenueGrowthRate: number | null;
  grossMargin: number | null;
  concentrationRisk: number; // 0-1
}

export interface SurvivalSubScores {
  runwayScore: number;
  burnMultipleScore: number;
  revenueGrowthScore: number;
  grossMarginScore: number;
  concentrationScore: number;
}

export interface SurvivalResult {
  metrics: SurvivalMetrics;
  subScores: SurvivalSubScores;
  survivalScore: number; // 0-100
  riskLevel: RiskLevel;
  isPreRevenue: boolean;
  confidenceFlag: ConfidenceFlag;
  recommendation: string;
  weights: SurvivalWeights;
}

export interface SurvivalWeights {
  runway: number;
  burnMultiple: number;
  revenueGrowth: number;
  grossMargin: number;
  concentration: number;
}

// ──────────────────────────────────────────────
// Financial Health Score
// ──────────────────────────────────────────────

export interface HealthScoreInput {
  // Current period
  cashBalance: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  monthlyExpenses: number;
  cogs: number;
  largestCustomerShare: number;
  // Historical context (optional for richer scoring)
  avgMonthlyBurnLast3?: number;
  revenueGrowthTrend3m?: number;
  // Governance proxy
  hasMonthlyClose: boolean;
  hasBoardReporting: boolean;
  hasAuditedFinancials: boolean;
}

export interface HealthSubScores {
  liquidityScore: number;
  growthScore: number;
  marginScore: number;
  burnDisciplineScore: number;
  concentrationScore: number;
  governanceScore: number;
}

export interface HealthScoreResult {
  subScores: HealthSubScores;
  overallScore: number; // 0-100
  grade: HealthGrade;
  weights: HealthWeights;
}

export interface HealthWeights {
  liquidity: number;
  growth: number;
  margin: number;
  burnDiscipline: number;
  concentration: number;
  governance: number;
}

// ──────────────────────────────────────────────
// Investor Readiness
// ──────────────────────────────────────────────

export type ReadinessCategory =
  | "reporting"
  | "controls"
  | "cap_table"
  | "kpi_clarity"
  | "governance"
  | "forecasting"
  | "due_diligence";

export interface ReadinessQuestion {
  id: string;
  category: ReadinessCategory;
  text: string;
  description: string;
  weight: number;
}

export interface ReadinessAnswer {
  questionId: string;
  category: ReadinessCategory;
  answer: number; // 1-5
  notes?: string;
}

export interface ReadinessCategoryScore {
  category: ReadinessCategory;
  score: number; // 0-100
  maxPossible: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface ReadinessResult {
  categoryScores: Record<ReadinessCategory, ReadinessCategoryScore>;
  overallScore: number; // 0-100
  readinessLevel: ReadinessLevel;
  recommendations: ReadinessRecommendation[];
}

export interface ReadinessRecommendation {
  category: ReadinessCategory;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
}

// ──────────────────────────────────────────────
// Alerts
// ──────────────────────────────────────────────

export interface AlertRule {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  evaluate: (context: AlertContext) => AlertEvaluation | null;
}

export interface AlertContext {
  runway: number;
  grossMargin: number | null;
  revenueGrowthRate: number | null;
  concentrationRisk: number;
  healthScore?: number;
  readinessScore?: number;
  missingFields: string[];
}

export interface AlertEvaluation {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export interface DashboardData {
  // Core metrics (current period)
  runway: number | null;
  burnRate: number | null;
  cashBalance: number | null;
  revenue: number | null;
  expenses: number | null;
  grossMargin: number | null;
  revenueGrowth: number | null;
  // Scores
  survivalScore: number | null;
  healthScore: number | null;
  readinessScore: number | null;
  riskLevel: RiskLevel | null;
  healthGrade: HealthGrade | null;
  readinessLevel: ReadinessLevel | null;
  // Alerts & trends
  activeAlerts: AlertEvaluation[];
  monthlyTrend: MonthlySnapshot[];
  // Period & company context
  currentPeriodLabel: string | null; // e.g. "Jan 2026"
  companyName: string;
}

export interface MonthlySnapshot {
  year: number;
  month: number;
  label: string; // e.g. "Jan 26"
  revenue: number;
  expenses: number;
  cashBalance: number;
  netBurn: number;
  runway: number;
  grossMargin: number | null;
}

// ──────────────────────────────────────────────
// Advisory
// ──────────────────────────────────────────────

export interface AdvisoryStartupSummary {
  companyId: string;
  companyName: string;
  stage: string | null;
  priority: AdvisoryCasePriority;
  survivalScore: number | null;
  healthScore: number | null;
  runway: number | null;
  activeAlertCount: number;
  openTaskCount: number;
  lastReviewedAt: Date | null;
}

// ──────────────────────────────────────────────
// Financial Period Input
// ──────────────────────────────────────────────

export interface FinancialPeriodInput {
  year: number;
  month: number;
  revenues: {
    source: string;
    amount: number;
    isRecurring: boolean;
    customerName?: string;
  }[];
  expenses: {
    category: string;
    description?: string;
    amount: number;
    isFixed: boolean;
  }[];
  cashBalance: {
    opening: number;
    closing: number;
  };
  cogs?: number;
  largestCustomerShare?: number;
  topThreeCustomerShare?: number;
  totalCustomerCount?: number;
}

// ──────────────────────────────────────────────
// AI Commentary
// ──────────────────────────────────────────────

export interface CommentaryRequest {
  companyName: string;
  stage: string;
  metrics: SurvivalMetrics;
  survivalScore: number;
  riskLevel: RiskLevel;
  healthScore?: number;
  healthGrade?: HealthGrade;
  alerts: AlertEvaluation[];
  historicalTrend?: MonthlySnapshot[];
}

export interface CommentaryResponse {
  executiveSummary: string;
  keyFindings: string[];
  risks: string[];
  recommendations: string[];
  outlook: string;
}
