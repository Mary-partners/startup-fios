"use client";

// ============================================================
// Advisory Command Center - Comprehensive dashboard for the
// fractional CFO advisory team at CFO Innovation Partners
// ============================================================

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  AlertTriangle,
  DollarSign,
  Clock,
  FileText,
  ArrowRight,
  Loader2,
  UserPlus,
  Activity,
  BarChart3,
  CalendarDays,
} from "lucide-react";

interface AdvisoryCase {
  id: string;
  engagementStatus: string;
  status: string;
  retainerAmount: number | null;
  priority: string;
  nextReviewDate: string | null;
  estimatedHoursPerMonth: number | null;
  assignedAdvisor?: string | null;
  advisorName?: string | null;
  servicePackage?: { id: string; name: string } | null;
  company: {
    id: string;
    name: string;
    stage?: string | null;
  };
  openTasks: number;
  overdueDeliverables: number;
  upcomingDeliverables: number;
  nextDeliverable?: {
    title: string;
    dueDate: string | null;
    status: string;
  } | null;
}

interface Deliverable {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  advisoryCaseId: string;
  assignedTo?: { name: string | null } | null;
  advisoryCase?: {
    company: { name: string };
  };
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: string;
  performedBy?: { name: string | null } | null;
  advisoryCase?: {
    company: { name: string };
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

function todayFormatted(): string {
  return new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isPastDue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  ONBOARDING: "bg-blue-100 text-blue-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  CHURNED: "bg-red-100 text-red-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  OVERDUE: "bg-red-100 text-red-700",
  DONE: "bg-green-100 text-green-700",
};

const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  NOTE: FileText,
  CALL: Activity,
  EMAIL: FileText,
  MEETING: Users,
  TASK_COMPLETED: ClipboardList,
  STATUS_CHANGE: ArrowRight,
  DELIVERABLE_SENT: CalendarDays,
  ISSUE_FLAGGED: AlertTriangle,
  ASSIGNMENT_CHANGE: Users,
  CHECKLIST_COMPLETED: ClipboardList,
};

export default function AdvisoryDashboardPage() {
  const [cases, setCases] = useState<AdvisoryCase[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [casesRes, deliverablesRes, activityRes] = await Promise.allSettled([
        fetch("/api/advisory/cases"),
        fetch("/api/advisory/deliverables/upcoming"),
        fetch("/api/advisory/activity/feed"),
      ]);

      if (casesRes.status === "fulfilled" && casesRes.value.ok) {
        const json = await casesRes.value.json();
        setCases(json.data || []);
      }

      if (deliverablesRes.status === "fulfilled" && deliverablesRes.value.ok) {
        const json = await deliverablesRes.value.json();
        setDeliverables(json.data || []);
      }

      if (activityRes.status === "fulfilled" && activityRes.value.ok) {
        const json = await activityRes.value.json();
        setActivityFeed((json.data || []).slice(0, 10));
      }
    } catch {
      // Fail silently, data will show empty states
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed metrics
  const activeClients = cases.filter((c) => c.engagementStatus === "ACTIVE").length;
  const pendingOnboarding = cases.filter((c) => c.engagementStatus === "ONBOARDING").length;
  const overdueCount = deliverables.filter(
    (d) => d.status !== "DELIVERED" && d.dueDate && isPastDue(d.dueDate)
  ).length;
  const weeklyRevenue = cases
    .filter((c) => c.engagementStatus === "ACTIVE" && c.retainerAmount)
    .reduce((sum, c) => sum + (c.retainerAmount || 0), 0) / 4;

  // Next 7 days deliverables
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const upcomingDeliverables = deliverables
    .filter((d) => {
      if (!d.dueDate) return false;
      const due = new Date(d.dueDate);
      return due >= now && due <= nextWeek && d.status !== "DELIVERED";
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Sorted client table: overdue items first, then by next due date
  const sortedCases = [...cases].sort((a, b) => {
    const aDue = a.nextDeliverable?.dueDate;
    const bDue = b.nextDeliverable?.dueDate;
    const aOverdue = isPastDue(aDue ?? null) ? 0 : 1;
    const bOverdue = isPastDue(bDue ?? null) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const aDate = aDue ? new Date(aDue).getTime() : Infinity;
    const bDate = bDue ? new Date(bDue).getTime() : Infinity;
    return aDate - bDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-sm text-slate-500">Loading command center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advisory Command Center</h1>
          <p className="mt-1 text-sm text-slate-500">{todayFormatted()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/advisory/onboard"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <UserPlus className="h-4 w-4" />
            Onboard Client
          </Link>
          <Link
            href="/advisory/activity"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Activity className="h-4 w-4" />
            Log Activity
          </Link>
          <Link
            href="/advisory/workload"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <BarChart3 className="h-4 w-4" />
            View Workload
          </Link>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Clients */}
        <div className={`rounded-xl border p-5 shadow-sm ${activeClients > 0 ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-slate-500">Active Clients</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeClients}</p>
          <p className="mt-1 text-xs text-slate-500">Currently engaged</p>
        </div>

        {/* Pending Onboarding */}
        <div className={`rounded-xl border p-5 shadow-sm ${pendingOnboarding > 0 ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-slate-500">Pending Onboarding</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingOnboarding}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting setup</p>
        </div>

        {/* Overdue Deliverables */}
        <div className={`rounded-xl border p-5 shadow-sm ${overdueCount > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-medium text-slate-500">Overdue Deliverables</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{overdueCount}</p>
          <p className="mt-1 text-xs text-slate-500">Past due date</p>
        </div>

        {/* This Week's Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">This Week&apos;s Revenue</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {weeklyRevenue.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">Estimated from active retainers</p>
        </div>
      </div>

      {/* Row 2: Deliverables + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deliverables */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Deliverables</h2>
            <Link
              href="/advisory/deliverables"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {upcomingDeliverables.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">No deliverables due in the next 7 days</p>
              </div>
            ) : (
              upcomingDeliverables.slice(0, 8).map((d) => (
                <Link
                  key={d.id}
                  href={`/advisory/startups/${d.advisoryCaseId}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{d.title}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span>{d.advisoryCase?.company?.name || "Client"}</span>
                      {d.assignedTo?.name && <span>Assigned: {d.assignedTo.name}</span>}
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        STATUS_BADGE[d.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {d.status.replace(/_/g, " ")}
                    </span>
                    {d.dueDate && (
                      <span className="text-xs text-slate-400">
                        <Clock className="mr-0.5 inline h-3 w-3" />
                        {formatDate(d.dueDate)}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Link
              href="/advisory/activity"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {activityFeed.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Activity className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">No recent activity</p>
              </div>
            ) : (
              activityFeed.map((item) => {
                const IconComponent = ACTIVITY_ICONS[item.type] || Activity;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 rounded-full bg-slate-100 p-1.5">
                      <IconComponent className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      {item.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.description}</p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.performedBy?.name && <span>{item.performedBy.name} - </span>}
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Client Overview Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-slate-900">Client Overview</h2>
          <Link
            href="/advisory/startups"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All Startups
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Advisor</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3 text-right">Retainer (KES)</th>
                <th className="px-4 py-3">Next Deliverable Due</th>
                <th className="px-4 py-3 text-center">Open Tasks</th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    No advisory cases found. Onboard your first client to get started.
                  </td>
                </tr>
              ) : (
                sortedCases.map((c) => {
                  const nextDue = c.nextDeliverable?.dueDate ?? null;
                  const overdue = isPastDue(nextDue);
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                      onClick={() => {
                        window.location.href = `/advisory/startups/${c.id}`;
                      }}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/advisory/startups/${c.id}`}
                          className="font-medium text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            STATUS_BADGE[c.engagementStatus] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.engagementStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.advisorName || <span className="text-slate-400">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.servicePackage?.name || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {c.retainerAmount
                          ? c.retainerAmount.toLocaleString("en-KE")
                          : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {nextDue ? (
                          <span className={overdue ? "font-medium text-red-600" : "text-slate-600"}>
                            {formatDate(nextDue)}
                            {overdue && " (overdue)"}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            c.openTasks > 0 ? "font-medium text-slate-900" : "text-slate-400"
                          }
                        >
                          {c.openTasks}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
