// ============================================================
// useFeatureGate — Client-side feature gating by subscription tier
// ============================================================

"use client";

import { useState, useEffect } from "react";

export interface FeatureGateInfo {
  tier: string;
  hasHealthScore: boolean;
  hasReadinessAssessment: boolean;
  hasAiCommentary: boolean;
  hasReportGeneration: boolean;
  hasBoardPackGenerator: boolean;
  hasAlerts: boolean;
  hasFileUpload: boolean;
  maxTeamMembers: number;
  maxFinancialPeriods: number;
  hasApiAccess: boolean;
  loading: boolean;
}

const DEFAULT_STATE: FeatureGateInfo = {
  tier: "FREE",
  hasHealthScore: true,
  hasReadinessAssessment: true,
  hasAiCommentary: true,
  hasReportGeneration: true,
  hasBoardPackGenerator: true,
  hasAlerts: true,
  hasFileUpload: true,
  maxTeamMembers: 3,
  maxFinancialPeriods: 12,
  hasApiAccess: false,
  loading: true,
};

/**
 * Fetches the current user's subscription tier and returns
 * plan limits for use in conditional rendering.
 */
export function useFeatureGate(): FeatureGateInfo {
  const [state, setState] = useState<FeatureGateInfo>(DEFAULT_STATE);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (cancelled || !json.success) return;

        const sub = json.data.subscription;
        const tier = sub?.tier ?? "FREE";

        // Mirror the plan limits from the server
        const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.FREE;
        setState({ ...limits, tier, loading: false });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Client-side mirror of plans.ts limits — avoids importing server code
const TIER_LIMITS: Record<string, Omit<FeatureGateInfo, "tier" | "loading">> = {
  FREE: {
    hasHealthScore: true,
    hasReadinessAssessment: true,
    hasAiCommentary: true,
    hasReportGeneration: true,
    hasBoardPackGenerator: true,
    hasAlerts: true,
    hasFileUpload: true,
    maxTeamMembers: 3,
    maxFinancialPeriods: 12,
    hasApiAccess: false,
  },
  STARTER: {
    hasHealthScore: true,
    hasReadinessAssessment: true,
    hasAiCommentary: false,
    hasReportGeneration: true,
    hasBoardPackGenerator: false,
    hasAlerts: true,
    hasFileUpload: true,
    maxTeamMembers: 3,
    maxFinancialPeriods: 12,
    hasApiAccess: false,
  },
  GROWTH: {
    hasHealthScore: true,
    hasReadinessAssessment: true,
    hasAiCommentary: true,
    hasReportGeneration: true,
    hasBoardPackGenerator: true,
    hasAlerts: true,
    hasFileUpload: true,
    maxTeamMembers: 10,
    maxFinancialPeriods: -1,
    hasApiAccess: false,
  },
  ENTERPRISE: {
    hasHealthScore: true,
    hasReadinessAssessment: true,
    hasAiCommentary: true,
    hasReportGeneration: true,
    hasBoardPackGenerator: true,
    hasAlerts: true,
    hasFileUpload: true,
    maxTeamMembers: -1,
    maxFinancialPeriods: -1,
    hasApiAccess: true,
  },
};
