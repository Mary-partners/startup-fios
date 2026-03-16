// ============================================================
// Advisory - Individual Startup Detail (Enhanced with trends)
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import Link from "next/link";
import MetricCard, { RunwayCard, ScoreCard } from "@/components/dashboard/metric-card";
import StartupDetailClient from "./detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdvisoryStartupDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Parallel data fetches for performance
  const [advisoryCase, latestHealth, latestSurvival, activeAlerts, recentPeriods] =
    await Promise.all([
      db.advisoryCase.findUnique({
        where: { companyId: id },
        include: {
          company: true,
          notes: {
            include: { author: true },
            orderBy: { createdAt: "desc" },
            take: 30,
          },
          tasks: {
            include: { assignedTo: true, createdBy: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      db.financialHealthScore.findFirst({
        where: { companyId: id },
        orderBy: { createdAt: "desc" },
      }),
      db.survivalAssessment.findFirst({
        where: { companyId: id },
        orderBy: { createdAt: "desc" },
      }),
      db.alert.findMany({
        where: { companyId: id, isDismissed: false },
        orderBy: { createdAt: "desc" },
      }),
      db.financialPeriod.findMany({
        where: { companyId: id },
        include: {
          cashBalances: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 6,
      }),
    ]);

  if (!advisoryCase) notFound();

  const survivalScore = latestSurvival
    ? Number(latestSurvival.survivalScore)
    : null;
  const healthScoreVal = latestHealth
    ? Number(latestHealth.overallScore)
    : null;
  const healthGrade = latestHealth?.grade ?? null;
  const runwayVal = latestSurvival
    ? Number(latestSurvival.runway)
    : null;
  const riskLevel = latestSurvival?.riskLevel ?? null;

  // Compute financial snapshot from recent periods
  const latestPeriod = recentPeriods[0] ?? null;
  const previousPeriod = recentPeriods[1] ?? null;

  const currentRevenue = latestPeriod
    ? Number(latestPeriod.totalRevenue)
    : null;
  const currentExpenses = latestPeriod
    ? Number(latestPeriod.totalExpenses)
    : null;
  const currentCash =
    latestPeriod?.cashBalances[0]
      ? Number(latestPeriod.cashBalances[0].closingBalance)
      : null;
  const burnRate =
    currentRevenue !== null && currentExpenses !== null
      ? currentExpenses - currentRevenue
      : null;
  const previousRevenue = previousPeriod
    ? Number(previousPeriod.totalRevenue)
    : null;
  const revenueGrowth =
    currentRevenue !== null &&
    previousRevenue !== null &&
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : null;

  // Serialize tasks for client component
  const serializedTasks = advisoryCase.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
    assignedTo: t.assignedTo?.name ?? t.assignedTo?.email ?? null,
    createdAt: t.createdAt.toISOString(),
  }));

  // Serialize alerts for client component
  const serializedAlerts = activeAlerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    metric: a.metric,
    value: a.value ? Number(a.value) : undefined,
    threshold: a.threshold ? Number(a.threshold) : undefined,
    isDismissed: a.isDismissed,
    createdAt: a.createdAt.toISOString(),
  }));

  // Period label helper
  const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const periodLabel = latestPeriod
    ? `${MONTH_LABELS[latestPeriod.month - 1]} ${latestPeriod.year}`
    : null;

  return (
    <div className="space-y-6">
      {/* Back nav + header */}
      <div>
        <Link
          href="/advisory/startups"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to all startups
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {advisoryCase.company.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>
                {advisoryCase.company.stage?.replace(/_/g, " ") ??
                  "Unknown stage"}
              </span>
              <span>•</span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  advisoryCase.priority === "CRITICAL"
                    ? "bg-red-100 text-red-700"
                    : advisoryCase.priority === "HIGH"
                    ? "bg-orange-100 text-orange-700"
                    : advisoryCase.priority === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {advisoryCase.priority}
              </span>
              <span>•</span>
              <span>{advisoryCase.status}</span>
              {riskLevel && (
                <>
                  <span>•</span>
                  <span
                    className={`text-xs font-semibold ${
                      riskLevel === "CRITICAL" || riskLevel === "HIGH"
                        ? "text-red-600"
                        : riskLevel === "MODERATE"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {riskLevel} Risk
                  </span>
                </>
              )}
            </div>
          </div>
          {periodLabel && (
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Latest: {periodLabel}
            </span>
          )}
        </div>
      </div>

      {/* Score Cards Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          title="Survival Score"
          score={survivalScore}
          maxScore={100}
        />
        <ScoreCard
          title="Health Score"
          score={healthScoreVal}
          grade={healthGrade ?? undefined}
          maxScore={100}
        />
        <RunwayCard months={runwayVal} />
      </div>

      {/* Financial Snapshot Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Monthly Revenue"
          value={
            currentRevenue !== null
              ? `$${(currentRevenue / 1000).toFixed(1)}k`
              : "-"
          }
          trend={
            revenueGrowth !== null
              ? {
                  direction:
                    revenueGrowth > 0
                      ? "up"
                      : revenueGrowth < 0
                      ? "down"
                      : "flat",
                  label: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}% MoM`,
                }
              : undefined
          }
          highlight="default"
        />
        <MetricCard
          title="Monthly Expenses"
          value={
            currentExpenses !== null
              ? `$${(currentExpenses / 1000).toFixed(1)}k`
              : "-"
          }
          highlight="default"
        />
        <MetricCard
          title="Net Burn"
          value={
            burnRate !== null
              ? burnRate > 0
                ? `$${(burnRate / 1000).toFixed(1)}k/mo`
                : `+$${(Math.abs(burnRate) / 1000).toFixed(1)}k/mo`
              : "-"
          }
          highlight={
            burnRate !== null
              ? burnRate > 0
                ? "danger"
                : "success"
              : "default"
          }
        />
        <MetricCard
          title="Cash Balance"
          value={
            currentCash !== null
              ? `$${(currentCash / 1000).toFixed(0)}k`
              : "-"
          }
          highlight="default"
        />
      </div>

      {/* Client-side interactive sections */}
      <StartupDetailClient
        caseId={advisoryCase.id}
        companyId={id}
        alerts={serializedAlerts}
        tasks={serializedTasks}
        notes={advisoryCase.notes.map((n) => ({
          id: n.id,
          content: n.content,
          authorName: n.author.name ?? n.author.email,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
