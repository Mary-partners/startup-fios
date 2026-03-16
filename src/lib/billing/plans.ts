// ============================================================
// Billing Plans & Feature Gating
// ============================================================

import { SubscriptionTier } from "@/types/enums";

// ──────────────────────────────────────────────
// Plan Definitions
// ──────────────────────────────────────────────

export interface PlanDefinition {
  tier: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly: number; // USD, 0 = free
  priceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  maxTeamMembers: number;
  maxFinancialPeriods: number; // -1 = unlimited
  hasHealthScore: boolean;
  hasReadinessAssessment: boolean;
  hasAiCommentary: boolean;
  hasReportGeneration: boolean;
  hasBoardPackGenerator: boolean;
  hasAlerts: boolean;
  hasFileUpload: boolean;
  maxFileUploadsMb: number;
  hasApiAccess: boolean;
}

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  [SubscriptionTier.FREE]: {
    tier: SubscriptionTier.FREE,
    name: "Free",
    description: "Survival Predictor and basic dashboard",
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: [
      "Startup Survival Predictor (unlimited)",
      "Basic financial dashboard",
      "Up to 3 months of financial data",
      "1 team member",
    ],
    limits: {
      maxTeamMembers: 3,
      maxFinancialPeriods: 12,
      hasHealthScore: true,
      hasReadinessAssessment: true,
      hasAiCommentary: true,
      hasReportGeneration: true,
      hasBoardPackGenerator: true,
      hasAlerts: true,
      hasFileUpload: true,
      maxFileUploadsMb: 50,
      hasApiAccess: false,
    },
  },

  [SubscriptionTier.STARTER]: {
    tier: SubscriptionTier.STARTER,
    name: "Starter",
    description: "Full financial intelligence for early-stage startups",
    priceMonthly: 49,
    priceYearly: 470, // ~2 months free
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? "",
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID ?? "",
    features: [
      "Everything in Free",
      "12 months of financial data",
      "Financial Health Score",
      "Investor Readiness Assessment",
      "Basic alerts",
      "Monthly summary reports",
      "Up to 3 team members",
      "File uploads (50 MB)",
    ],
    limits: {
      maxTeamMembers: 3,
      maxFinancialPeriods: 12,
      hasHealthScore: true,
      hasReadinessAssessment: true,
      hasAiCommentary: false,
      hasReportGeneration: true,
      hasBoardPackGenerator: false,
      hasAlerts: true,
      hasFileUpload: true,
      maxFileUploadsMb: 50,
      hasApiAccess: false,
    },
  },

  [SubscriptionTier.GROWTH]: {
    tier: SubscriptionTier.GROWTH,
    name: "Growth",
    description: "AI-powered CFO copilot and full reporting suite",
    priceMonthly: 149,
    priceYearly: 1430,
    stripePriceIdMonthly: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? "",
    stripePriceIdYearly: process.env.STRIPE_GROWTH_YEARLY_PRICE_ID ?? "",
    features: [
      "Everything in Starter",
      "Unlimited financial history",
      "AI CFO Copilot commentary",
      "Board Pack Generator",
      "Advanced alerts & notifications",
      "Up to 10 team members",
      "File uploads (500 MB)",
      "Investor viewer seats",
    ],
    limits: {
      maxTeamMembers: 10,
      maxFinancialPeriods: -1,
      hasHealthScore: true,
      hasReadinessAssessment: true,
      hasAiCommentary: true,
      hasReportGeneration: true,
      hasBoardPackGenerator: true,
      hasAlerts: true,
      hasFileUpload: true,
      maxFileUploadsMb: 500,
      hasApiAccess: false,
    },
  },

  [SubscriptionTier.ENTERPRISE]: {
    tier: SubscriptionTier.ENTERPRISE,
    name: "Enterprise",
    description: "Custom advisory and portfolio management",
    priceMonthly: 0, // Custom pricing
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: [
      "Everything in Growth",
      "Dedicated advisory support",
      "Custom integrations",
      "API access",
      "Unlimited team members",
      "SSO / SAML",
      "Priority support",
    ],
    limits: {
      maxTeamMembers: -1,
      maxFinancialPeriods: -1,
      hasHealthScore: true,
      hasReadinessAssessment: true,
      hasAiCommentary: true,
      hasReportGeneration: true,
      hasBoardPackGenerator: true,
      hasAlerts: true,
      hasFileUpload: true,
      maxFileUploadsMb: 5000,
      hasApiAccess: true,
    },
  },
};

export function getPlan(tier: SubscriptionTier): PlanDefinition {
  return PLANS[tier];
}

export function getPlanLimits(tier: SubscriptionTier): PlanLimits {
  return PLANS[tier].limits;
}
