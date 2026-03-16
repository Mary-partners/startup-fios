// ============================================================
// Advisory Command Center — Startup List (Refactored w/ StartupTable)
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import type { Role } from "@/types/enums";
import MetricCard from "@/components/dashboard/metric-card";
import StartupTableWrapper from "./startup-table-wrapper";

export default async function AdvisoryStartupsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { externalId: userId },
    include: { memberships: true },
  });

  if (!user) redirect("/sign-in");

  const advisoryMembership = user.memberships.find((m) =>
    isAdvisoryRole(m.role as Role)
  );
  if (!advisoryMembership) redirect("/app/dashboard");

  // Fetch all advisory cases with company data
  const cases = await db.advisoryCase.findMany({
    include: {
      company: {
        include: {
          financialHealthScores: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          survivalAssessments: {
            where: { companyId: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          alerts: {
            where: { isDismissed: false },
          },
        },
      },
      tasks: {
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Map to StartupRow shape for the shared component
  const rows = cases.map((c) => ({
    caseId: c.id,
    companyName: c.company.name,
    stage: c.company.stage,
    priority: c.priority as string,
    survivalScore: c.company.survivalAssessments[0]
      ? Number(c.company.survivalAssessments[0].survivalScore)
      : null,
    healthScore: c.company.financialHealthScores[0]
      ? Number(c.company.financialHealthScores[0].overallScore)
      : null,
    runway: c.company.survivalAssessments[0]
      ? Number(c.company.survivalAssessments[0].runway)
      : null,
    activeAlerts: c.company.alerts.length,
    openTasks: c.tasks.length,
    lastReviewedAt: c.lastReviewedAt?.toISOString() ?? null,
    nextReviewDate: c.nextReviewDate?.toISOString() ?? null,
  }));

  // Summary counts
  const criticalCount = rows.filter((r) => r.priority === "CRITICAL").length;
  const highCount = rows.filter((r) => r.priority === "HIGH").length;
  const lowRunway = rows.filter((r) => r.runway !== null && r.runway < 6).length;
  const totalAlerts = rows.reduce((acc, r) => acc + r.activeAlerts, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Advisory Command Center
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {rows.length} active startup{rows.length !== 1 ? "s" : ""} under advisory management
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Startups"
          value={rows.length}
          highlight="default"
        />
        <MetricCard
          title="Critical / High"
          value={`${criticalCount} / ${highCount}`}
          highlight={criticalCount > 0 ? "danger" : highCount > 0 ? "warning" : "success"}
        />
        <MetricCard
          title="Low Runway (<6mo)"
          value={lowRunway}
          highlight={lowRunway > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Active Alerts"
          value={totalAlerts}
          highlight={totalAlerts > 0 ? "warning" : "default"}
        />
      </div>

      {/* Startup Table (client component wrapper) */}
      <StartupTableWrapper startups={rows} />
    </div>
  );
}
