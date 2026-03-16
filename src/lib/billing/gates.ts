// ============================================================
// Feature Gating — checks subscription tier against features
// ============================================================

import { SubscriptionTier } from "@/types/enums";
import { getPlanLimits, type PlanLimits } from "./plans";

export type Feature = keyof Omit<PlanLimits, "maxTeamMembers" | "maxFinancialPeriods" | "maxFileUploadsMb">;

/**
 * Check if a feature is available on the given tier.
 */
export function isFeatureEnabled(
  tier: SubscriptionTier,
  feature: Feature
): boolean {
  const limits = getPlanLimits(tier);
  return limits[feature] === true;
}

/**
 * Check if the team member limit has been reached.
 */
export function canAddTeamMember(
  tier: SubscriptionTier,
  currentCount: number
): boolean {
  const limits = getPlanLimits(tier);
  if (limits.maxTeamMembers === -1) return true; // Unlimited
  return currentCount < limits.maxTeamMembers;
}

/**
 * Check if the financial period limit has been reached.
 */
export function canAddFinancialPeriod(
  tier: SubscriptionTier,
  currentCount: number
): boolean {
  const limits = getPlanLimits(tier);
  if (limits.maxFinancialPeriods === -1) return true;
  return currentCount < limits.maxFinancialPeriods;
}

/**
 * Middleware-style gate: throws if feature is not available.
 */
export function requireFeature(
  tier: SubscriptionTier,
  feature: Feature
): void {
  if (!isFeatureEnabled(tier, feature)) {
    throw new FeatureGateError(
      `Feature "${feature}" requires an upgraded plan. Current tier: ${tier}.`
    );
  }
}

export class FeatureGateError extends Error {
  public readonly code = "FEATURE_GATED";
  constructor(message: string) {
    super(message);
    this.name = "FeatureGateError";
  }
}
