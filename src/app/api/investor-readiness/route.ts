// ============================================================
// /api/investor-readiness
// GET: Return latest assessment + questions
// POST: Submit answers and calculate score
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import { requireFeature } from "@/lib/billing/gates";
import { submitReadinessSchema } from "@/lib/validators/investor-readiness";
import {
  calculateReadinessScore,
  READINESS_QUESTIONS,
} from "@/lib/engines/readiness-engine";
import { SubscriptionTier } from "@/types/enums";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "No company" }, { status: 404 });
    }

    requirePermission(tenant.role, "readiness:read");

    const sub = await db.subscription.findUnique({
      where: { companyId: tenant.companyId },
    });
    requireFeature((sub?.tier as SubscriptionTier) ?? SubscriptionTier.FREE, "hasReadinessAssessment");

    // Get latest assessment
    const latest = await db.investorReadinessAssessment.findFirst({
      where: { companyId: tenant.companyId },
      include: { answers: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        questions: READINESS_QUESTIONS,
        latestAssessment: latest,
      },
    });
  } catch (error: any) {
    if (error.code === "FEATURE_GATED") {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "No company" }, { status: 404 });
    }

    requirePermission(tenant.role, "readiness:write");

    const body = await request.json();
    const parsed = submitReadinessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> },
        { status: 400 }
      );
    }

    const result = calculateReadinessScore(parsed.data.answers);

    // Persist assessment
    const assessment = await db.investorReadinessAssessment.create({
      data: {
        companyId: tenant.companyId,
        reportingScore: result.categoryScores.reporting.score,
        controlsScore: result.categoryScores.controls.score,
        capTableScore: result.categoryScores.cap_table.score,
        kpiClarityScore: result.categoryScores.kpi_clarity.score,
        governanceScore: result.categoryScores.governance.score,
        forecastingScore: result.categoryScores.forecasting.score,
        dueDiligenceScore: result.categoryScores.due_diligence.score,
        overallScore: result.overallScore,
        readinessLevel: result.readinessLevel,
        recommendations: result.recommendations,
        completedAt: new Date(),
        answers: {
          create: parsed.data.answers.map((a) => ({
            questionId: a.questionId,
            category: a.category,
            answer: a.answer,
            notes: a.notes,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Readiness error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
