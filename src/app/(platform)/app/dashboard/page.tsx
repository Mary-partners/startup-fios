// ============================================================
// Founder Dashboard — Authenticated Server Component
// Fetches all data server-side, passes to DashboardClient
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { calculateSurvivalScore } from "@/lib/engines/survival-engine";
import {
  calcNetBurn,
  calcRunway,
  calcGrossMargin,
  calcRevenueGrowthRate,
} from "@/lib/engines/metrics-engine";
import { evaluateAlerts } from "@/lib/engines/alerts-engine";
import type {
  SurvivalPredictorInput,
  AlertContext,
  DashboardData,
  MonthlySnapshot,
} from "@/types/domain";
import { DashboardClient } from "./dashboard-client";

const MONTH_LABELS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenant = await resolveTenantContext(userId);
  if (!tenant) redirect("/app/onboarding");

  // Fetch latest financial periods (up to 12 months)
  const periods = await db.financialPeriod.findMany({
    where: { companyId: tenant.companyId },
    include: {
      cashBalance: true,
      cogsRecord: true,
      customerConcentration: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 12,
  });

  // Fetch latest scores
  const [latestHealthScore, latestReadiness] = await Promise.all([
    db.financialHealthScore.findFirst({
      where: { companyId: tenant.companyId },
      orderBy: { createdAt: "desc" },
    }),
    db.investorReadinessAssessment.findFirst({
      where: { companyId: tenant.companyId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Build empty dashboard data
  let dashboardData: DashboardData = {
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
  };

  if (periods.length > 0) {
    const current = periods[0];
    const previous = periods[1];

    const currentRevenue = Number(current.totalRevenue ?? 0);
    const currentExpenses = Number(current.totalExpenses ?? 0);
    const currentCash = Number(current.cashBalance?.closingBalance ?? 0);
    const currentCogs = Number(current.totalCogs ?? 0);
    const prevRevenue = previous ? Number(previous.totalRevenue ?? 0) : 0;
    const concentration = Number(
      current.customerConcentration?.largestCustomerShare ?? 0
    );

    // Calculate survival score
    const input: SurvivalPredictorInput = {
      cashBalance: currentCash,
      monthlyRevenue: currentRevenue,
      previousMonthRevenue: prevRevenue,
      monthlyExpenses: currentExpenses,
      cogs: currentCogs,
      largestCustomerShare: concentration,
    };
    const survival = calculateSurvivalScore(input);

    // Calculate standalone metrics for the dashboard
    const netBurn = calcNetBurn(currentExpenses, currentRevenue);
    const runway = calcRunway(currentCash, netBurn);
    const grossMargin = calcGrossMargin(currentRevenue, currentCogs);
    const revenueGrowth = calcRevenueGrowthRate(currentRevenue, prevRevenue);

    // Evaluate alerts
    const alertContext: AlertContext = {
      runway: survival.metrics.runway,
      grossMargin: survival.metrics.grossMargin,
      revenueGrowthRate: survival.metrics.revenueGrowthRate,
      concentrationRisk: survival.metrics.concentrationRisk,
      healthScore: latestHealthScore
        ? Number(latestHealthScore.overallScore)
        : undefined,
      readinessScore: latestReadiness
        ? Number(latestReadiness.overallScore)
        : undefined,
      missingFields: [],
    };
    const alerts = evaluateAlerts(alertContext);

    // Build monthly trend (chronological order for charts)
    const chronological = [...periods].reverse();
    const monthlyTrend: MonthlySnapshot[] = chronological.map((p, idx) => {
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

    dashboardData = {
      runway: runway === Infinity ? 999 : runway,
      burnRate: netBurn,
      cashBalance: currentCash,
      revenue: currentRevenue,
      expenses: currentExpenses,
      grossMargin,
      revenueGrowth,
      survivalScore: survival.survivalScore,
      healthScore: latestHealthScore
        ? Number(latestHealthScore.overallScore)
        : null,
      readinessScore: latestReadiness
        ? Number(latestReadiness.overallScore)
        : null,
      riskLevel: survival.riskLevel,
      healthGrade: (latestHealthScore?.grade as any) ?? null,
      readinessLevel: (latestReadiness?.readinessLevel as any) ?? null,
      activeAlerts: alerts,
      monthlyTrend,
      currentPeriodLabel: `${MONTH_LABELS[current.month]} ${current.year}`,
      companyName: tenant.companyName ?? "Your Company",
    };
  }

  return <DashboardClient data={dashboardData} hasData={periods.length > 0} />;
}
