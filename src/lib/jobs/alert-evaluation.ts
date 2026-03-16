// ============================================================
// Background Job: Alert Evaluation
// Re-evaluates alerts after financial data changes.
// ============================================================

import { db } from "@/lib/db/client";
import { on } from "./inngest";
import { evaluateAlerts } from "@/lib/engines/alerts-engine";
import { calcNetBurn, calcRunway, calcRevenueGrowthRate, calcGrossMargin } from "@/lib/engines/metrics-engine";
import type { AlertContext } from "@/types/domain";

on("financial-period/created", async (data) => {
  const { companyId } = data;

  try {
    const periods = await db.financialPeriod.findMany({
      where: { companyId },
      include: {
        cashBalance: true,
        cogsRecord: true,
        customerConcentration: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 2,
    });

    if (periods.length === 0) return;

    const current = periods[0];
    const previous = periods[1];

    const revenue = Number(current.totalRevenue ?? 0);
    const expenses = Number(current.totalExpenses ?? 0);
    const cash = Number(current.cashBalance?.closingBalance ?? 0);
    const cogs = Number(current.totalCogs ?? 0);
    const prevRevenue = previous ? Number(previous.totalRevenue ?? 0) : 0;
    const concentration = Number(
      current.customerConcentration?.largestCustomerShare ?? 0
    );

    const netBurn = calcNetBurn(expenses, revenue);
    const runway = calcRunway(cash, netBurn);
    const growthRate = calcRevenueGrowthRate(revenue, prevRevenue);
    const grossMargin = calcGrossMargin(revenue, cogs);

    const context: AlertContext = {
      runway: runway === Infinity ? 999 : runway,
      grossMargin,
      revenueGrowthRate: growthRate,
      concentrationRisk: concentration,
      missingFields: [],
    };

    const newAlerts = evaluateAlerts(context);

    // Clear old non-dismissed alerts for this company
    await db.alert.updateMany({
      where: { companyId, isDismissed: false },
      data: { isDismissed: true, dismissedAt: new Date() },
    });

    // Insert new alerts
    if (newAlerts.length > 0) {
      await db.alert.createMany({
        data: newAlerts.map((a) => ({
          companyId,
          type: a.type,
          severity: a.severity,
          title: a.title,
          message: a.message,
          metric: a.metric,
          value: a.value,
          threshold: a.threshold,
        })),
      });
    }
  } catch (error) {
    console.error(`Alert evaluation failed for company ${companyId}:`, error);
  }
});
