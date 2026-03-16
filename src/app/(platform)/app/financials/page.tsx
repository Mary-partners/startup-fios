// ============================================================
// Financials Page — Server component that loads periods
// and renders summary cards + client data entry interface
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { FinancialsClient } from "./financials-client";
import MetricCard from "@/components/dashboard/metric-card";
import { calcNetBurn, calcRunway, calcGrossMargin, calcRevenueGrowthRate } from "@/lib/engines/metrics-engine";
import { formatCurrency, formatRunway } from "@/lib/utils/formatting";

export default async function FinancialsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenant = await resolveTenantContext(userId);
  if (!tenant) redirect("/app/onboarding");

  const periods = await db.financialPeriod.findMany({
    where: { companyId: tenant.companyId },
    include: {
      revenueRecords: true,
      expenseRecords: true,
      cashBalance: true,
      cogsRecord: true,
      customerConcentration: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Compute summary metrics from the latest period
  const latest = periods[0];
  const previous = periods[1];

  let revenue = 0, expenses = 0, cash = 0, runway = 0;
  let growthPct: number | null = null;
  let grossMargin: number | null = null;

  if (latest) {
    revenue = Number(latest.totalRevenue ?? 0);
    expenses = Number(latest.totalExpenses ?? 0);
    cash = Number(latest.cashBalance?.closingBalance ?? 0);
    const cogs = Number(latest.totalCogs ?? 0);
    const prevRevenue = previous ? Number(previous.totalRevenue ?? 0) : 0;
    const netBurn = calcNetBurn(expenses, revenue);
    runway = calcRunway(cash, netBurn);
    grossMargin = calcGrossMargin(revenue, cogs);
    const rawGrowth = prevRevenue > 0 ? calcRevenueGrowthRate(revenue, prevRevenue) : null;
    growthPct = rawGrowth !== null ? rawGrowth * 100 : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Data</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter and manage your monthly financial data. Use Quick Entry for
          summary numbers or Detailed Entry for line-by-line breakdown.
        </p>
      </div>

      {/* Summary Metric Cards */}
      {latest && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Monthly Revenue"
            value={formatCurrency(revenue)}
            trend={
              growthPct !== null
                ? {
                    direction: growthPct > 0 ? "up" : growthPct < 0 ? "down" : "flat",
                    label: `${Math.abs(growthPct).toFixed(1)}%`,
                  }
                : undefined
            }
            highlight={revenue > 0 ? "success" : "default"}
          />
          <MetricCard
            title="Monthly Expenses"
            value={formatCurrency(expenses)}
            highlight="default"
          />
          <MetricCard
            title="Cash Balance"
            value={formatCurrency(cash)}
            highlight={cash > 100000 ? "success" : cash > 25000 ? "warning" : "danger"}
          />
          <MetricCard
            title="Runway"
            value={formatRunway(runway)}
            subtitle={
              grossMargin !== null
                ? `Gross margin: ${(grossMargin * 100).toFixed(1)}%`
                : undefined
            }
            highlight={
              runway >= 18 || runway === Infinity
                ? "success"
                : runway >= 6
                ? "warning"
                : "danger"
            }
          />
        </div>
      )}

      <FinancialsClient
        periods={JSON.parse(JSON.stringify(periods))}
        companyId={tenant.companyId}
      />
    </div>
  );
}
