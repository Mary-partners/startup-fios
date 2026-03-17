// ============================================================
// Admin Panel - Platform usage, leads, team, and system stats
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Verify admin role
  const user = await db.user.findUnique({
    where: { externalId: userId },
    include: { memberships: true },
  });

  if (!user) redirect("/sign-in");

  const isAdmin = user.memberships.some((m) =>
    m.role === "ADMIN" || m.role === "OWNER" || m.role === "HEAD_OF_ADVISORY"
  );
  if (!isAdmin) redirect("/app/dashboard");

  // Time boundaries
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // All stats in parallel
  const [
    totalCompanies,
    totalUsers,
    totalLeads,
    totalAssessments,
    totalHealthScores,
    totalReadiness,
    totalReports,
    activeAlerts,
    advisoryCases,
    signupsToday,
    signupsThisWeek,
    signupsThisMonth,
    leadsThisWeek,
    assessmentsThisWeek,
    healthScoresThisWeek,
    readinessThisWeek,
    feedbackCount,
  ] = await Promise.all([
    db.company.count(),
    db.user.count(),
    db.lead.count(),
    db.survivalAssessment.count(),
    db.financialHealthScore.count(),
    db.investorReadinessAssessment.count(),
    db.report.count(),
    db.alert.count({ where: { isDismissed: false } }),
    db.advisoryCase.count(),
    db.user.count({ where: { createdAt: { gte: todayStart } } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.user.count({ where: { createdAt: { gte: monthAgo } } }),
    db.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    db.survivalAssessment.count({ where: { createdAt: { gte: weekAgo } } }),
    db.financialHealthScore.count({ where: { createdAt: { gte: weekAgo } } }),
    db.investorReadinessAssessment.count({ where: { createdAt: { gte: weekAgo } } }),
    db.lead.count({ where: { source: "feedback" } }),
  ]);

  // Recent signups (last 20)
  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // All leads
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Recent assessments
  const recentAssessments = await db.survivalAssessment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      survivalScore: true,
      riskLevel: true,
      runway: true,
      cashBalance: true,
      monthlyRevenue: true,
      monthlyExpenses: true,
      createdAt: true,
    },
  });

  // Subscription breakdown
  const subscriptions = await db.subscription.groupBy({
    by: ["tier"],
    _count: { tier: true },
  });

  const tierBreakdown = subscriptions.reduce(
    (acc, s) => {
      acc[s.tier] = s._count.tier;
      return acc;
    },
    {} as Record<string, number>
  );

  // Platform usage (features used)
  const featureUsage = [
    { feature: "Survival Predictor", total: totalAssessments, thisWeek: assessmentsThisWeek, color: "text-green-600", bg: "bg-green-50" },
    { feature: "Health Score", total: totalHealthScores, thisWeek: healthScoresThisWeek, color: "text-blue-600", bg: "bg-blue-50" },
    { feature: "Investor Readiness", total: totalReadiness, thisWeek: readinessThisWeek, color: "text-violet-600", bg: "bg-violet-50" },
    { feature: "Reports Generated", total: totalReports, thisWeek: 0, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform usage, leads, signups, and system health
        </p>
      </div>

      {/* Top-level Stats */}
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Total Users", value: totalUsers, color: "text-slate-900", bg: "bg-slate-50" },
          { label: "Companies", value: totalCompanies, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Leads", value: totalLeads, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Assessments", value: totalAssessments, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active Alerts", value: activeAlerts, color: "text-red-600", bg: "bg-red-50" },
          { label: "Advisory Cases", value: advisoryCases, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Reports", value: totalReports, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Feedback", value: feedbackCount, color: "text-pink-600", bg: "bg-pink-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-slate-200 ${stat.bg} p-3`}
          >
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Activity This Week */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity This Week</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{signupsThisWeek}</p>
            <p className="text-xs font-medium text-blue-600 mt-1">New Signups</p>
            <p className="text-[10px] text-blue-500 mt-0.5">{signupsToday} today | {signupsThisMonth} this month</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{leadsThisWeek}</p>
            <p className="text-xs font-medium text-green-600 mt-1">New Leads</p>
            <p className="text-[10px] text-green-500 mt-0.5">From survival predictor + web</p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 text-center">
            <p className="text-3xl font-bold text-violet-700">{assessmentsThisWeek}</p>
            <p className="text-xs font-medium text-violet-600 mt-1">Survival Assessments</p>
            <p className="text-[10px] text-violet-500 mt-0.5">{totalAssessments} total all time</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-center">
            <p className="text-3xl font-bold text-amber-700">{healthScoresThisWeek + readinessThisWeek}</p>
            <p className="text-xs font-medium text-amber-600 mt-1">Scores Calculated</p>
            <p className="text-[10px] text-amber-500 mt-0.5">{healthScoresThisWeek} health + {readinessThisWeek} readiness</p>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Feature Usage (All Time)</h2>
        <div className="space-y-3">
          {featureUsage.map((f) => {
            const maxVal = Math.max(...featureUsage.map(x => x.total), 1);
            const pct = (f.total / maxVal) * 100;
            return (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-slate-700">{f.feature}</span>
                <div className="flex-1 h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${f.bg.replace("/50", "")} transition-all`}
                    style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: f.color.replace("text-", "").includes("green") ? "#16a34a" : f.color.includes("blue") ? "#2563eb" : f.color.includes("violet") ? "#7c3aed" : "#9333ea" }}
                  />
                </div>
                <span className={`w-16 text-right text-sm font-bold ${f.color}`}>
                  {f.total.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads & Callback Requests */}
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Leads & Callback Requests</h2>
              <p className="text-xs text-slate-500">From survival predictor, feedback, and other sources</p>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              {totalLeads} total
            </span>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No leads yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Name / Email</th>
                    <th className="pb-2 pr-4 font-medium">Source</th>
                    <th className="pb-2 pr-4 font-medium">Reason / Details</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const meta = (lead.metadata as Record<string, any>) ?? {};
                    const hasCallback = meta.callbackRequested;
                    return (
                      <tr key={lead.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-slate-900">{lead.name || meta.name || "-"}</p>
                          <p className="text-xs text-slate-500">{lead.email}</p>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            lead.source === "survival-predictor" || lead.source === "survival_predictor"
                              ? "bg-green-100 text-green-700"
                              : lead.source === "callback"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {lead.source}
                          </span>
                          {hasCallback && (
                            <span className="ml-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Callback
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-slate-600 max-w-[200px]">
                          {meta.reason && <span className="block text-slate-700">{meta.reason}</span>}
                          {meta.phone && <span>Phone: {meta.phone}<br /></span>}
                          {meta.survivalScore !== undefined && (
                            <span>Score: {meta.survivalScore} ({meta.riskLevel})</span>
                          )}
                          {meta.runway !== undefined && (
                            <span> | Runway: {typeof meta.runway === 'number' ? meta.runway.toFixed(1) : meta.runway}mo</span>
                          )}
                        </td>
                        <td className="py-2.5 text-xs text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString()}<br />
                          {new Date(lead.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Survival Assessments */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Assessments</h2>
          {recentAssessments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No assessments yet</p>
          ) : (
            <div className="space-y-2">
              {recentAssessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        a.riskLevel === "LOW" || a.riskLevel === "STRONG"
                          ? "bg-green-100 text-green-700"
                          : a.riskLevel === "MODERATE"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {a.riskLevel}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        Score: {Number(a.survivalScore).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Runway: {Number(a.runway) >= 999 ? "∞" : Number(a.runway).toFixed(1) + "mo"} |
                      Rev: ${Number(a.monthlyRevenue).toLocaleString()} |
                      Exp: ${Number(a.monthlyExpenses).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Tiers + Recent Signups */}
        <div className="space-y-6">
          {/* Tier Breakdown */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Subscription Tiers</h2>
            <div className="space-y-3">
              {["FREE", "STARTER", "GROWTH", "ENTERPRISE"].map((tier) => {
                const count = tierBreakdown[tier] ?? 0;
                const pct = totalCompanies > 0 ? (count / totalCompanies) * 100 : 0;
                return (
                  <div key={tier} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-slate-600">
                      {tier}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-slate-700">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Recent Signups</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {totalUsers} total
              </span>
            </div>
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {u.name ?? "No name"}
                    </p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
