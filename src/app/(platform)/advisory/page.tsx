// ============================================================
// Advisory Dashboard — Summary view for Head of Advisory
// Enhanced with MetricCards, computed scores, and alert counts
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import MetricCard from "@/components/dashboard/metric-card";
import AlertsList from "@/components/dashboard/alerts-list";

export default async function AdvisoryDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenant = await resolveTenantContext(userId);
  if (!tenant || !isAdvisoryRole(tenant.role)) {
    redirect("/app/dashboard");
  }

  // Fetch all advisory cases with related data including scores
  const cases = await db.advisoryCase.findMany({
    include: {
      company: {
        include: {
          subscription: true,
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
      tasks: true,
      notes: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Summary stats
  const totalCases = cases.length;
  const criticalCases = cases.filter((c) => c.priority === "CRITICAL").length;
  const highCases = cases.filter((c) => c.priority === "HIGH").length;
  const activeCases = cases.filter((c) => c.status === "active").length;
  const pendingTasks = cases.reduce(
    (sum, c) => sum + c.tasks.filter((t) => t.status !== "COMPLETE").length,
    0
  );
  const overdueReviews = cases.filter((c) => {
    if (!c.nextReviewDate) return false;
    return new Date(c.nextReviewDate) < new Date();
  }).length;

  // Aggregate alert count
  const totalAlerts = cases.reduce(
    (sum, c) => sum + c.company.alerts.length,
    0
  );

  // Average scores across portfolio
  const scoredCases = cases.filter(
    (c) => c.company.survivalAssessments.length > 0
  );
  const avgSurvival =
    scoredCases.length > 0
      ? scoredCases.reduce(
          (sum, c) =>
            sum + Number(c.company.survivalAssessments[0].survivalScore),
          0
        ) / scoredCases.length
      : null;

  const healthScoredCases = cases.filter(
    (c) => c.company.financialHealthScores.length > 0
  );
  const avgHealth =
    healthScoredCases.length > 0
      ? healthScoredCases.reduce(
          (sum, c) =>
            sum + Number(c.company.financialHealthScores[0].overallScore),
          0
        ) / healthScoredCases.length
      : null;

  // Collect top alerts across portfolio (CRITICAL first)
  const portfolioAlerts = cases
    .flatMap((c) =>
      c.company.alerts.map((a) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: `[${c.company.name}] ${a.title}`,
        message: a.message,
        metric: a.metric,
        value: a.value ? Number(a.value) : undefined,
        threshold: a.threshold ? Number(a.threshold) : undefined,
        isDismissed: a.isDismissed,
        createdAt: a.createdAt.toISOString(),
      }))
    )
    .sort((a, b) => {
      const order: Record<string, number> = {
        CRITICAL: 0,
        WARNING: 1,
        INFO: 2,
      };
      return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
    });

  // Recent activity — notes across all cases sorted by date
  const recentNotes = cases
    .flatMap((c) =>
      c.notes.map((n) => ({
        ...n,
        companyName: c.company.name,
        caseId: c.id,
        authorName: n.author.name ?? n.author.email,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  const priorityColors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
    STABLE: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Advisory Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of all managed startups and advisory activities
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/advisory/tasks"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            All Tasks
          </Link>
          <Link
            href="/advisory/startups"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            View All Startups
          </Link>
        </div>
      </div>

      {/* Summary Cards — Row 1: Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Total Cases"
          value={totalCases}
          subtitle={`${activeCases} active`}
          highlight="default"
        />
        <MetricCard
          title="Critical"
          value={criticalCases}
          highlight={criticalCases > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="High Priority"
          value={highCases}
          highlight={highCases > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Pending Tasks"
          value={pendingTasks}
          highlight={pendingTasks > 10 ? "warning" : "default"}
        />
        <MetricCard
          title="Overdue Reviews"
          value={overdueReviews}
          highlight={overdueReviews > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Active Alerts"
          value={totalAlerts}
          highlight={totalAlerts > 0 ? "warning" : "default"}
        />
      </div>

      {/* Summary Cards — Row 2: Portfolio Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Avg. Survival Score"
          value={
            avgSurvival !== null ? `${avgSurvival.toFixed(0)}/100` : "—"
          }
          subtitle={
            scoredCases.length > 0
              ? `across ${scoredCases.length} scored startups`
              : "no assessments yet"
          }
          highlight={
            avgSurvival !== null
              ? avgSurvival >= 60
                ? "success"
                : avgSurvival >= 40
                ? "warning"
                : "danger"
              : "default"
          }
        />
        <MetricCard
          title="Avg. Health Score"
          value={
            avgHealth !== null ? `${avgHealth.toFixed(0)}/100` : "—"
          }
          subtitle={
            healthScoredCases.length > 0
              ? `across ${healthScoredCases.length} scored startups`
              : "no health scores yet"
          }
          highlight={
            avgHealth !== null
              ? avgHealth >= 60
                ? "success"
                : avgHealth >= 40
                ? "warning"
                : "danger"
              : "default"
          }
        />
      </div>

      {/* Three-Column Layout: Attention, Recent Activity, Portfolio Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cases Requiring Attention */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Needs Attention</h2>
          </div>
          <div className="divide-y">
            {cases
              .filter(
                (c) => c.priority === "CRITICAL" || c.priority === "HIGH"
              )
              .slice(0, 6)
              .map((c) => {
                const survScore = c.company.survivalAssessments[0]
                  ? Number(c.company.survivalAssessments[0].survivalScore)
                  : null;
                return (
                  <Link
                    key={c.id}
                    href={`/advisory/startups/${c.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">
                        {c.company.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          {c.tasks.filter((t) => t.status !== "COMPLETE").length}{" "}
                          open tasks
                        </span>
                        {survScore !== null && (
                          <span
                            className={
                              survScore >= 60
                                ? "text-green-600"
                                : survScore >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            Score: {Math.round(survScore)}
                          </span>
                        )}
                        {c.company.alerts.length > 0 && (
                          <span className="text-red-600">
                            {c.company.alerts.length} alert
                            {c.company.alerts.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`ml-2 shrink-0 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        priorityColors[c.priority] ?? ""
                      }`}
                    >
                      {c.priority}
                    </span>
                  </Link>
                );
              })}
            {cases.filter(
              (c) => c.priority === "CRITICAL" || c.priority === "HIGH"
            ).length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                No critical or high-priority cases
              </div>
            )}
          </div>
        </div>

        {/* Recent Notes / Activity */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                href={`/advisory/startups/${note.caseId}`}
                className="block p-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">
                    {note.companyName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  by {note.authorName}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {note.content}
                </p>
              </Link>
            ))}
            {recentNotes.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Alerts */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Portfolio Alerts</h2>
              {portfolioAlerts.length > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-bold text-red-700">
                  {portfolioAlerts.length}
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            <AlertsList
              alerts={portfolioAlerts.slice(0, 8)}
              compact
              maxVisible={5}
              emptyMessage="No active alerts across the portfolio"
            />
          </div>
        </div>
      </div>

      {/* Full Case Table with Score Columns */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">All Advisory Cases</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Survival</th>
                <th className="px-4 py-3 text-center">Health</th>
                <th className="px-4 py-3 text-center">Alerts</th>
                <th className="px-4 py-3 text-center">Open Tasks</th>
                <th className="px-4 py-3">Last Note</th>
                <th className="px-4 py-3">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const openTasks = c.tasks.filter(
                  (t) => t.status !== "COMPLETE"
                ).length;
                const lastNote = c.notes[0];
                const overdue =
                  c.nextReviewDate &&
                  new Date(c.nextReviewDate) < new Date();

                const survScore = c.company.survivalAssessments[0]
                  ? Number(c.company.survivalAssessments[0].survivalScore)
                  : null;
                const hlthScore = c.company.financialHealthScores[0]
                  ? Number(
                      c.company.financialHealthScores[0].overallScore
                    )
                  : null;
                const hlthGrade =
                  c.company.financialHealthScores[0]?.grade ?? null;
                const alertCount = c.company.alerts.length;

                return (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/advisory/startups/${c.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {c.company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          priorityColors[c.priority] ?? ""
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.status}</td>
                    <td className="px-4 py-3 text-center">
                      {survScore !== null ? (
                        <span
                          className={`text-xs font-semibold ${
                            survScore >= 70
                              ? "text-green-600"
                              : survScore >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.round(survScore)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hlthScore !== null ? (
                        <span
                          className={`text-xs font-semibold ${
                            hlthScore >= 70
                              ? "text-green-600"
                              : hlthScore >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.round(hlthScore)}
                          {hlthGrade && (
                            <span className="ml-0.5 text-slate-400">
                              ({hlthGrade})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {alertCount > 0 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                          {alertCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          openTasks > 0
                            ? "font-medium text-slate-900"
                            : "text-slate-400"
                        }
                      >
                        {openTasks}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {lastNote ? (
                        <div>
                          <p className="text-xs">
                            {new Date(
                              lastNote.createdAt
                            ).toLocaleDateString()}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
                            {lastNote.content}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.nextReviewDate ? (
                        <span
                          className={
                            overdue
                              ? "font-medium text-red-600"
                              : "text-slate-600"
                          }
                        >
                          {new Date(
                            c.nextReviewDate
                          ).toLocaleDateString()}
                          {overdue && " (overdue)"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
