// ============================================================
// POST /api/survival-predictor
// Public endpoint — no auth required.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { survivalPredictorSchema } from "@/lib/validators/survival-predictor";
import { calculateSurvivalScore } from "@/lib/engines/survival-engine";
import { db } from "@/lib/db/client";
import type { SurvivalPredictorResponse } from "@/types/api";

export async function POST(
  request: NextRequest
): Promise<NextResponse<SurvivalPredictorResponse>> {
  try {
    const body = await request.json();
    const parsed = survivalPredictorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        },
        { status: 400 }
      );
    }

    // Strip email before passing to the engine (it doesn't need it)
    const { email, ...engineInput } = parsed.data;
    const result = calculateSurvivalScore(engineInput);

    // Persist the assessment (fire-and-forget for performance)
    db.survivalAssessment
      .create({
        data: {
          cashBalance: parsed.data.cashBalance,
          monthlyRevenue: parsed.data.monthlyRevenue,
          previousMonthRevenue: parsed.data.previousMonthRevenue,
          monthlyExpenses: parsed.data.monthlyExpenses,
          cogs: parsed.data.cogs,
          largestCustomerShare: parsed.data.largestCustomerShare,
          plannedHiresImpact: parsed.data.plannedHiresImpact,
          grossBurn: result.metrics.grossBurn,
          netBurn: result.metrics.netBurn,
          runway: result.metrics.runway,
          burnMultiple: result.metrics.burnMultiple,
          revenueGrowthRate: result.metrics.revenueGrowthRate,
          grossMargin: result.metrics.grossMargin,
          concentrationRisk: result.metrics.concentrationRisk,
          survivalScore: result.survivalScore,
          riskLevel: result.riskLevel,
          isPreRevenue: result.isPreRevenue,
          confidenceFlag: result.confidenceFlag,
          recommendation: result.recommendation,
        },
      })
      .catch((err) => console.error("Failed to persist assessment:", err));

    // Persist lead if email was provided (fire-and-forget)
    if (email) {
      db.lead
        .upsert({
          where: { email_source: { email, source: "survival_predictor" } },
          create: {
            email,
            source: "survival_predictor",
            metadata: {
              survivalScore: result.survivalScore,
              riskLevel: result.riskLevel,
              runway: result.metrics.runway,
            },
          },
          update: {
            metadata: {
              survivalScore: result.survivalScore,
              riskLevel: result.riskLevel,
              runway: result.metrics.runway,
              lastAssessedAt: new Date().toISOString(),
            },
          },
        })
        .catch((err) => console.error("Failed to persist lead:", err));
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Survival predictor error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
