// ============================================================
// Admin Panel — System overview, leads, and callback requests
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

  const isAdmin = user.memberships.some((m) => m.role === "ADMIN");
  if (!isAdmin) redirect("/app/dashboard");

  // Aggregate stats
  const [
    companyCount,
    userCount,
    assessmentCount,
    alertCount,
    reportCount,
    advisoryCaseCount,
    leadCount,
  ] = await Promise.all([
    db.company.count(),
    db.user.count(),
    db.survivalAssessment.count(),
    db.alert.count({ where: { isDismissed: false } }),
    db.report.count(),
    db.advisoryCase.count(),
    db.lead.count(),
  ]);

  // Recent signups
  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // All leads (including callback requests)
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Recent survival assessments
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

  // Subscription tier breakdown
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

  const stats = [
    { label: "Companies", value: companyCount, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Users", value: userCount, color: "text-slate-900", bg: "bg-slate-50" },
    { label: "Leads", value: leadCount, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Assessments", value: assessmentCount, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Alerts", value: alertCount, color: "text-red-600", bg: "bg-red-50" },
    { label: "Reports", value: reportCount, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          System overview — leads, users, assessments, and platform stats
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-slate-200 ${stat.bg} p-4`}
          >
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads & Callback Requests */}
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Leads & Callback Requests</h2>
          <p className="text-xs text-slate-500 mb-4">From survival predictor, feedback, and other sources</p>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No leads yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Source</th>
                    <th className="pb-2 pr-4 font-medium">Details</th>
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
                          <p className="font-medium text-slate-900">{lead.email}</p>
                          {meta.name && (
                            <p className="text-xs text-slate-500">{meta.name}</p>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            lead.source === "survival_predictor"
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
                        <td className="py-2.5 pr-4 text-xs text-slate-600">
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
        </div>

        {/* Subscription Tiers + Recent Signups */}
        <div className="space-y-6">
          {/* Tier Breakdown */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Subscription Tiers</h2>
            <div className="space-y-3">
              {["FREE", "STARTER", "GROWTH", "ENTERPRISE"].map((tier) => {
                const count = tierBreakdown[tier] ?? 0;
                const pct = companyCount > 0 ? (count / companyCount) * 100 : 0;
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
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Signups</h2>
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
