// ============================================================
// GET /api/health-score — Calculate & return financial health score
// POST /api/health-score — Force recalculation and persist
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import { requireFeature } from "@/lib/billing/gates";
import { calculateHealthScore } from "@/lib/engines/health-engine";
import type { HealthScoreInput } from "@/types/domain";
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

    requirePermission(tenant.role, "health_score:read");

    // Get subscription tier
    const sub = await db.subscription.findUnique({
      where: { companyId: tenant.companyId },
    });
    requireFeature((sub?.tier as SubscriptionTier) ?? SubscriptionTier.FREE, "hasHealthScore");

    // Get latest two periods for the company
    const periods = await db.financialPeriod.findMany({
      where: { companyId: tenant.companyId },
      include: {
        cashBalance: true,
        cogsRecord: true,
        customerConcentration: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 2,
    });

    if (periods.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No financial data available. Enter at least one period.",
      }, { status: 404 });
    }

    const current = periods[0];
    const previous = periods[1];

    const input: HealthScoreInput = {
      cashBalance: Number(current.cashBalance?.closingBalance ?? 0),
      monthlyRevenue: Number(current.totalRevenue ?? 0),
      previousMonthRevenue: previous ? Number(previous.totalRevenue ?? 0) : 0,
      monthlyExpenses: Number(current.totalExpenses ?? 0),
      cogs: Number(current.totalCogs ?? 0),
      largestCustomerShare: Number(
        current.customerConcentration?.largestCustomerShare ?? 0
      ),
      hasMonthlyClose: current.isFinalized,
      hasBoardReporting: false, // TODO: derive from report history
      hasAuditedFinancials: false, // TODO: derive from company profile
    };

    const result = calculateHealthScore(input);

    // Persist the score
    await db.financialHealthScore.upsert({
      where: {
        companyId_periodYear_periodMonth: {
          companyId: tenant.companyId,
          periodYear: current.year,
          periodMonth: current.month,
        },
      },
      create: {
        companyId: tenant.companyId,
        periodYear: current.year,
        periodMonth: current.month,
        liquidityScore: result.subScores.liquidityScore,
        growthScore: result.subScores.growthScore,
        marginScore: result.subScores.marginScore,
        burnDisciplineScore: result.subScores.burnDisciplineScore,
        concentrationScore: result.subScores.concentrationScore,
        governanceScore: result.subScores.governanceScore,
        weights: result.weights,
        overallScore: result.overallScore,
        grade: result.grade,
      },
      update: {
        liquidityScore: result.subScores.liquidityScore,
        growthScore: result.subScores.growthScore,
        marginScore: result.subScores.marginScore,
        burnDisciplineScore: result.subScores.burnDisciplineScore,
        concentrationScore: result.subScores.concentrationScore,
        governanceScore: result.subScores.governanceScore,
        weights: result.weights,
        overallScore: result.overallScore,
        grade: result.grade,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    if (error.code === "FEATURE_GATED") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    console.error("Health score error:", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
