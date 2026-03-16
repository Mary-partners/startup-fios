// ============================================================
// POST /api/ai/commentary
// Generate AI financial commentary for the current company.
// Requires Growth plan or above.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import { requireFeature } from "@/lib/billing/gates";
import { calculateSurvivalScore } from "@/lib/engines/survival-engine";
import { evaluateAlerts } from "@/lib/engines/alerts-engine";
import { generateCommentary } from "@/lib/ai/orchestrator";
import { SubscriptionTier } from "@/types/enums";
import type { SurvivalPredictorInput, AlertContext } from "@/types/domain";

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

    requirePermission(tenant.role, "financials:read");

    const sub = await db.subscription.findUnique({
      where: { companyId: tenant.companyId },
    });
    requireFeature((sub?.tier as SubscriptionTier) ?? SubscriptionTier.FREE, "hasAiCommentary");

    // Get latest periods
    const periods = await db.financialPeriod.findMany({
      where: { companyId: tenant.companyId },
      include: {
        cashBalance: true,
        cogsRecord: true,
        customerConcentration: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 6,
    });

    if (periods.length === 0) {
      return NextResponse.json(
        { success: false, error: "No financial data available" },
        { status: 404 }
      );
    }

    const current = periods[0];
    const previous = periods[1];
    const company = await db.company.findUnique({ where: { id: tenant.companyId } });

    // Step 1: Deterministic calculation
    const survivalInput: SurvivalPredictorInput = {
      cashBalance: Number(current.cashBalance?.closingBalance ?? 0),
      monthlyRevenue: Number(current.totalRevenue ?? 0),
      previousMonthRevenue: previous ? Number(previous.totalRevenue ?? 0) : 0,
      monthlyExpenses: Number(current.totalExpenses ?? 0),
      cogs: Number(current.totalCogs ?? 0),
      largestCustomerShare: Number(current.customerConcentration?.largestCustomerShare ?? 0),
    };

    const survivalResult = calculateSurvivalScore(survivalInput);

    // Step 2: Alert evaluation
    const alertContext: AlertContext = {
      runway: survivalResult.metrics.runway,
      grossMargin: survivalResult.metrics.grossMargin,
      revenueGrowthRate: survivalResult.metrics.revenueGrowthRate,
      concentrationRisk: survivalResult.metrics.concentrationRisk,
      missingFields: [],
    };
    const alerts = evaluateAlerts(alertContext);

    // Step 3: Build historical trend
    const historicalTrend = periods.reverse().map((p) => ({
      year: p.year,
      month: p.month,
      revenue: Number(p.totalRevenue ?? 0),
      expenses: Number(p.totalExpenses ?? 0),
      cashBalance: Number(p.cashBalance?.closingBalance ?? 0),
      netBurn: Number(p.totalExpenses ?? 0) - Number(p.totalRevenue ?? 0),
      runway: 0, // Simplified for trend display
    }));

    // Step 4: AI narrative generation
    const commentary = await generateCommentary({
      companyName: company?.name ?? "Company",
      stage: company?.stage ?? "unknown",
      metrics: survivalResult.metrics,
      survivalScore: survivalResult.survivalScore,
      riskLevel: survivalResult.riskLevel,
      alerts,
      historicalTrend,
    });

    return NextResponse.json({ success: true, data: commentary });
  } catch (error: any) {
    if (error.code === "FEATURE_GATED") {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("AI commentary error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
