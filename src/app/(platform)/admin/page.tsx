// ============================================================
// Admin Panel — System overview and management
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
  ] = await Promise.all([
    db.company.count(),
    db.user.count(),
    db.survivalAssessment.count(),
    db.alert.count({ where: { isDismissed: false } }),
    db.report.count(),
    db.advisoryCase.count(),
  ]);

  // Recent signups
  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, email: true, createdAt: true },
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
    { label: "Companies", value: companyCount, color: "text-blue-600" },
    { label: "Users", value: userCount, color: "text-slate-900" },
    { label: "Assessments", value: assessmentCount, color: "text-green-600" },
    { label: "Active Alerts", value: alertCount, color: "text-red-600" },
    { label: "Reports", value: reportCount, color: "text-purple-600" },
    { label: "Advisory Cases", value: advisoryCaseCount, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          System overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tier Breakdown */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Subscription Tiers</h2>
          <div className="mt-4 space-y-3">
            {["FREE", "STARTER", "GROWTH", "ENTERPRISE"].map((tier) => {
              const count = tierBreakdown[tier] ?? 0;
              const pct = companyCount > 0 ? (count / companyCount) * 100 : 0;
              return (
                <div key={tier} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium text-slate-600">
                    {tier}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
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
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent Signups</h2>
          <div className="mt-4 space-y-2">
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
                <span className="text-xs text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
