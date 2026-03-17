"use client";

// ============================================================
// Team Workload Dashboard
// Comprehensive team management with capacity tracking
// ============================================================

import { useState, useEffect, useMemo } from "react";

interface AdvisorWorkload {
  userId: string;
  name: string | null;
  email: string;
  activeCases: number;
  estimatedHours: number;
  actualHours: number;
  openTasks: number;
  upcomingDeliverables: number;
}

interface UpcomingDeliverable {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  advisoryCase?: {
    company: { id: string; name: string; stage?: string | null };
  };
  assignedTo?: { id: string; name: string | null; email: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  NOT_STARTED: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-100 text-green-700",
  BLOCKED: "bg-amber-100 text-amber-700",
};

function getUtilizationColor(pct: number): string {
  if (pct > 100) return "bg-red-500";
  if (pct >= 80) return "bg-amber-500";
  return "bg-green-500";
}

function getUtilizationBadge(pct: number): string {
  if (pct > 100) return "text-red-700 bg-red-50";
  if (pct >= 80) return "text-amber-700 bg-amber-50";
  return "text-green-700 bg-green-50";
}

function getDueDateColor(dueDateStr: string, status: string): string {
  if (status === "COMPLETE" || status === "DELIVERED") return "text-slate-600";
  const now = new Date();
  const due = new Date(dueDateStr);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "text-red-600 font-semibold";
  if (diffDays <= 3) return "text-amber-600 font-medium";
  return "text-green-700";
}

function formatDateRange(): string {
  const now = new Date();
  const twoWeeks = new Date(now);
  twoWeeks.setDate(now.getDate() + 14);
  return `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${twoWeeks.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function WorkloadPage() {
  const [advisors, setAdvisors] = useState<AdvisorWorkload[]>([]);
  const [deliverables, setDeliverables] = useState<UpcomingDeliverable[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingDeliverables, setLoadingDeliverables] = useState(true);
  const [errorTeam, setErrorTeam] = useState<string | null>(null);
  const [errorDeliverables, setErrorDeliverables] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch("/api/advisory/team/workload");
        if (!res.ok) throw new Error("Failed to load team workload");
        const json = await res.json();
        setAdvisors(json.data ?? json ?? []);
      } catch (err: unknown) {
        setErrorTeam(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingTeam(false);
      }
    }

    async function fetchDeliverables() {
      try {
        const res = await fetch("/api/advisory/deliverables/upcoming");
        if (!res.ok) throw new Error("Failed to load upcoming deliverables");
        const json = await res.json();
        setDeliverables(json.data ?? json ?? []);
      } catch (err: unknown) {
        setErrorDeliverables(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingDeliverables(false);
      }
    }

    fetchTeam();
    fetchDeliverables();
  }, []);

  const capacitySummary = useMemo(() => {
    const totalEstimated = advisors.reduce((sum, a) => sum + a.estimatedHours, 0);
    const totalActual = advisors.reduce((sum, a) => sum + a.actualHours, 0);
    const utilization = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;
    const totalClients = advisors.reduce((sum, a) => sum + a.activeCases, 0);
    return { totalEstimated, totalActual, utilization, totalClients };
  }, [advisors]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Workload</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor capacity, assignments, and upcoming deadlines across the advisory team
          </p>
        </div>
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:mt-0">
          {formatDateRange()}
        </div>
      </div>

      {/* ================= Section 1: Team Overview Cards ================= */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Team Overview</h2>

        {loadingTeam && (
          <div className="flex items-center justify-center rounded-xl border bg-white py-16 text-slate-400 shadow-sm">
            <svg className="mr-2 h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading team data...</span>
          </div>
        )}

        {errorTeam && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorTeam}
          </div>
        )}

        {!loadingTeam && !errorTeam && advisors.length === 0 && (
          <div className="rounded-xl border bg-white py-16 text-center text-sm text-slate-400 shadow-sm">
            No team members found
          </div>
        )}

        {!loadingTeam && !errorTeam && advisors.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advisors.map((advisor) => {
              const utilPct = advisor.estimatedHours > 0
                ? Math.round((advisor.actualHours / advisor.estimatedHours) * 100)
                : 0;
              const barColor = getUtilizationColor(utilPct);
              const badgeColor = getUtilizationBadge(utilPct);

              return (
                <div
                  key={advisor.userId}
                  className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Name and Role */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{advisor.name || advisor.email}</h3>
                      <p className="text-sm text-slate-500">{advisor.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>
                      {utilPct}%
                    </span>
                  </div>

                  {/* Active Clients */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Active Clients</span>
                      <span className="font-semibold text-slate-700">{advisor.activeCases}</span>
                    </div>
                  </div>

                  {/* Hours Progress Bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Hours</span>
                      <span>
                        <span className="font-semibold text-slate-700">{advisor.actualHours}</span>
                        {" / "}
                        {advisor.estimatedHours}h
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${Math.min(utilPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="mb-4 flex gap-4 text-center">
                    <div className="flex-1 rounded-lg bg-slate-50 px-2 py-2">
                      <p className="text-lg font-bold text-slate-900">{advisor.openTasks}</p>
                      <p className="text-xs text-slate-500">Open Tasks</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-slate-50 px-2 py-2">
                      <p className="text-lg font-bold text-slate-900">{advisor.upcomingDeliverables}</p>
                      <p className="text-xs text-slate-500">Deliverables</p>
                    </div>
                  </div>

                  {/* Reassign Button */}
                  <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                    Reassign
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= Section 2: Capacity Summary ================= */}
      {!loadingTeam && !errorTeam && advisors.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Capacity Summary</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Capacity</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{capacitySummary.totalEstimated}h</p>
              <p className="mt-0.5 text-xs text-slate-400">Estimated hours across team</p>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Hours Used</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{capacitySummary.totalActual}h</p>
              <p className="mt-0.5 text-xs text-slate-400">Actual hours logged</p>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Overall Utilization</p>
              <p className={`mt-1 text-2xl font-bold ${
                capacitySummary.utilization > 100
                  ? "text-red-600"
                  : capacitySummary.utilization >= 80
                    ? "text-amber-600"
                    : "text-green-600"
              }`}>
                {capacitySummary.utilization}%
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${getUtilizationColor(capacitySummary.utilization)}`}
                  style={{ width: `${Math.min(capacitySummary.utilization, 100)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Clients</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {capacitySummary.totalClients}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Active cases across team</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= Section 3: Upcoming Deadlines ================= */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>

        <div className="rounded-xl border bg-white shadow-sm">
          {loadingDeliverables && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg className="mr-2 h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading deliverables...</span>
            </div>
          )}

          {errorDeliverables && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorDeliverables}
            </div>
          )}

          {!loadingDeliverables && !errorDeliverables && deliverables.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              No upcoming deliverables found
            </div>
          )}

          {!loadingDeliverables && !errorDeliverables && deliverables.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((d) => {
                    const isOverdue =
                      new Date(d.dueDate) < new Date() &&
                      d.status !== "COMPLETE" &&
                      d.status !== "DELIVERED";
                    const dueDateColor = getDueDateColor(d.dueDate, d.status);

                    return (
                      <tr
                        key={d.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${
                          isOverdue ? "bg-red-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {d.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {d.advisoryCase?.company?.name || "Client"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {d.assignedTo?.name || "Unassigned"}
                        </td>
                        <td className={`px-4 py-3 ${dueDateColor}`}>
                          <span className="flex items-center gap-1">
                            {isOverdue && (
                              <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {new Date(d.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isOverdue
                                ? STATUS_COLORS["OVERDUE"]
                                : STATUS_COLORS[d.status] ?? "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isOverdue ? "OVERDUE" : d.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
