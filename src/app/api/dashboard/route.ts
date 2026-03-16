// ============================================================
// Dashboard Data API — GET /api/dashboard
// Returns aggregated metrics, scores, alerts, and trend data
// for the authenticated user's company.
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db/client";
import { cached } from "@/lib/utils/cache";
import {
  calcNetBurn,
  calcRunway,
  calcGrossMargin,
  calcRevenueGrowthRate,
} from "@/lib/engines/metrics-engine";
import { calculateSurvivalScore } from "@/lib/engines/survival-engine";
import { evaluateAlerts } from "@/lib/engines/alerts-engine";
import type {
  SurvivalPredictorInput,
  AlertContext,
  MonthlySnapshot,
} from "@/types/domain";

const MONTH_LABELS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ error: "No tenant context" }, { status: 403 });
    }

    // Cache dashboard data for 30 seconds per tenant to reduce DB load
    const { periods, latestHealth, latestReadiness } = await cached(
      `dashboard:${tenant.companyId}`,
      30_000,
      async () => {
        const [p, h, r] = await Promise.all([
          db.financialPeriod.findMany({
            where: { companyId: tenant.companyId },
            include: {
              cashBalance: true,
              cogsRecord: true,
              customerConcentration: true,
            },
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 12,
          }),
          db.financialHealthScore.findFirst({
            where: { companyId: tenant.companyId },
            orderBy: { createdAt: "desc" },
          }),
          db.investorReadinessAssessment.findFirst({
            where: { companyId: tenant.companyId },
            orderBy: { createdAt: "desc" },
          }),
        ]);
        return { periods: p, latestHealth: h, latestReadiness: r };
      }
    );

    // Empty state
    if (periods.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          runway: null,
          burnRate: null,
          cashBalance: null,
          revenue: null,
          expenses: null,
          grossMargin: null,
          revenueGrowth: null,
          survivalScore: null,
          healthScore: null,
          readinessScore: null,
          riskLevel: null,
          healthGrade: null,
          readinessLevel: null,
          activeAlerts: [],
          monthlyTrend: [],
          currentPeriodLabel: null,
          companyName: tenant.companyName ?? "Your Company",
        },
      });
    }

    const current = periods[0];
    const previous = periods[1];

    const revenue = Number(current.totalRevenue ?? 0);
    const expenses = Number(current.totalExpenses ?? 0);
    const cashBalance = Number(current.cashBalance?.closingBalance ?? 0);
    const cogs = Number(current.totalCogs ?? 0);
    const prevRevenue = previous ? Number(previous.totalRevenue ?? 0) : 0;
    const concentration = Number(
      current.customerConcentration?.largestCustomerShare ?? 0
    );

    // Survival score
    const survivalInput: SurvivalPredictorInput = {
      cashBalance,
      monthlyRevenue: revenue,
      previousMonthRevenue: prevRevenue,
      monthlyExpenses: expenses,
      cogs,
      largestCustomerShare: concentration,
    };
    const survival = calculateSurvivalScore(survivalInput);

    // Standalone metrics
    const netBurn = calcNetBurn(expenses, revenue);
    const runway = calcRunway(cashBalance, netBurn);
    const grossMargin = calcGrossMargin(revenue, cogs);
    const revenueGrowth = calcRevenueGrowthRate(revenue, prevRevenue);

    // Alerts (deterministic, computed from metrics)
    const alertContext: AlertContext = {
      runway: survival.metrics.runway,
      grossMargin: survival.metrics.grossMargin,
      revenueGrowthRate: survival.metrics.revenueGrowthRate,
      concentrationRisk: survival.metrics.concentrationRisk,
      healthScore: latestHealth ? Number(latestHealth.overallScore) : undefined,
      readinessScore: latestReadiness ? Number(latestReadiness.overallScore) : undefined,
      missingFields: [],
    };
    const alerts = evaluateAlerts(alertContext);

    // Monthly trend (chronological)
    const chronological = [...periods].reverse();
    const monthlyTrend: MonthlySnapshot[] = chronological.map((p) => {
      const pRevenue = Number(p.totalRevenue ?? 0);
      const pExpenses = Number(p.totalExpenses ?? 0);
      const pCash = Number(p.cashBalance?.closingBalance ?? 0);
      const pCogs = Number(p.totalCogs ?? 0);
      const pNetBurn = calcNetBurn(pExpenses, pRevenue);
      const pRunway = calcRunway(pCash, pNetBurn);
      const pGrossMargin = pRevenue > 0 ? calcGrossMargin(pRevenue, pCogs) : null;

      return {
        year: p.year,
        month: p.month,
        label: `${MONTH_LABELS[p.month]} ${String(p.year).slice(2)}`,
        revenue: pRevenue,
        expenses: pExpenses,
        cashBalance: pCash,
        netBurn: pNetBurn,
        runway: pRunway === Infinity ? 999 : pRunway,
        grossMargin: pGrossMargin,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        runway: runway === Infinity ? 999 : runway,
        burnRate: netBurn,
        cashBalance,
        revenue,
        expenses,
        grossMargin,
        revenueGrowth,
        survivalScore: survival.survivalScore,
        healthScore: latestHealth ? Number(latestHealth.overallScore) : null,
        readinessScore: latestReadiness ? Number(latestReadiness.overallScore) : null,
        riskLevel: survival.riskLevel,
        healthGrade: latestHealth?.grade ?? null,
        readinessLevel: latestReadiness?.readinessLevel ?? null,
        activeAlerts: alerts,
        monthlyTrend,
        currentPeriodLabel: `${MONTH_LABELS[current.month]} ${current.year}`,
        companyName: tenant.companyName ?? "Your Company",
      },
    });
  } catch (error) {
    console.error("[dashboard] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
