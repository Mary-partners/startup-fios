// ============================================================
// API Request/Response Types
// ============================================================

import type {
  SurvivalPredictorInput,
  SurvivalResult,
  HealthScoreResult,
  ReadinessResult,
  ReadinessAnswer,
  DashboardData,
  FinancialPeriodInput,
  CommentaryResponse,
  AdvisoryStartupSummary,
} from "./domain";

// ──────────────────────────────────────────────
// Generic API wrapper
// ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// ──────────────────────────────────────────────
// Survival Predictor
// ──────────────────────────────────────────────

export type SurvivalPredictorRequest = SurvivalPredictorInput;
export type SurvivalPredictorResponse = ApiResponse<SurvivalResult>;

// ──────────────────────────────────────────────
// Financials
// ──────────────────────────────────────────────

export type CreateFinancialPeriodRequest = FinancialPeriodInput;
export type CreateFinancialPeriodResponse = ApiResponse<{ periodId: string }>;

// ──────────────────────────────────────────────
// Health Score
// ──────────────────────────────────────────────

export type HealthScoreResponse = ApiResponse<HealthScoreResult>;

// ──────────────────────────────────────────────
// Investor Readiness
// ──────────────────────────────────────────────

export interface SubmitReadinessRequest {
  answers: ReadinessAnswer[];
}
export type ReadinessResponse = ApiResponse<ReadinessResult>;

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export type DashboardResponse = ApiResponse<DashboardData>;

// ──────────────────────────────────────────────
// AI Commentary
// ──────────────────────────────────────────────

export type CommentaryApiResponse = ApiResponse<CommentaryResponse>;

// ──────────────────────────────────────────────
// Advisory
// ──────────────────────────────────────────────

export type AdvisoryListResponse = ApiResponse<AdvisoryStartupSummary[]>;

// ──────────────────────────────────────────────
// Billing
// ──────────────────────────────────────────────

export interface CreateCheckoutRequest {
  tier: "STARTER" | "GROWTH" | "ENTERPRISE";
}

export type CheckoutResponse = ApiResponse<{ checkoutUrl: string }>;

// ──────────────────────────────────────────────
// Lead Capture
// ──────────────────────────────────────────────

export interface LeadCaptureRequest {
  email: string;
  name?: string;
  companyName?: string;
}
