"use client";

// ============================================================
// Deliverables Hub - Cross-client deliverables tracking
// Track deliverables and checklists across all clients
// ============================================================

import { useState, useEffect, useMemo } from "react";

interface Deliverable {
  id: string;
  title: string;
  clientName: string;
  status: string;
  dueDate: string;
  assigneeName: string;
  checklistTotal: number;
  checklistCompleted: number;
}

type TabFilter = "all" | "due_this_week" | "overdue" | "by_client";

const TAB_OPTIONS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due_this_week", label: "Due This Week" },
  { key: "overdue", label: "Overdue" },
  { key: "by_client", label: "By Client" },
];

const STATUS_OPTIONS = [
  "ALL",
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETE",
  "BLOCKED",
  "OVERDUE",
];

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  NOT_STARTED: "bg-slate-100 text-slate-700",
  COMPLETE: "bg-green-100 text-green-700",
  BLOCKED: "bg-amber-100 text-amber-700",
};

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

function isOverdue(d: Deliverable): boolean {
  return new Date(d.dueDate) < new Date() && d.status !== "COMPLETE";
}

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function fetchDeliverables() {
      try {
        const res = await fetch("/api/advisory/deliverables/upcoming");
        if (!res.ok) throw new Error("Failed to load deliverables");
        const data = await res.json();
        setDeliverables(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchDeliverables();
  }, []);

  const filtered = useMemo(() => {
    let result = [...deliverables];

    // Tab filter
    if (activeTab === "due_this_week") {
      result = result.filter((d) => isThisWeek(d.dueDate));
    } else if (activeTab === "overdue") {
      result = result.filter((d) => isOverdue(d));
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((d) => d.status === statusFilter);
    }

    return result;
  }, [deliverables, activeTab, statusFilter]);

  // Group by client for the "By Client" tab
  const groupedByClient = useMemo(() => {
    if (activeTab !== "by_client") return null;
    const groups: Record<string, Deliverable[]> = {};
    filtered.forEach((d) => {
      if (!groups[d.clientName]) groups[d.clientName] = [];
      groups[d.clientName].push(d);
    });
    return groups;
  }, [activeTab, filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deliverables</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track deliverables and checklists across all clients
        </p>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border bg-slate-50 p-1">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <span className="text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
          No deliverables match the current filters
        </div>
      )}

      {!loading && !error && filtered.length > 0 && activeTab !== "by_client" && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Checklist</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const overdue = isOverdue(d);
                  const checklistPct =
                    d.checklistTotal > 0
                      ? Math.round(
                          (d.checklistCompleted / d.checklistTotal) * 100
                        )
                      : null;
                  return (
                    <tr
                      key={d.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${
                        overdue ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {d.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.clientName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            overdue
                              ? STATUS_COLORS["OVERDUE"]
                              : STATUS_COLORS[d.status] ??
                                "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {overdue ? "OVERDUE" : d.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          overdue
                            ? "font-medium text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        {new Date(d.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.assigneeName}
                      </td>
                      <td className="px-4 py-3">
                        {checklistPct !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  checklistPct === 100
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${checklistPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">
                              {d.checklistCompleted}/{d.checklistTotal}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By Client grouped view */}
      {!loading && !error && activeTab === "by_client" && groupedByClient && (
        <div className="space-y-4">
          {Object.entries(groupedByClient).map(([clientName, items]) => (
            <div
              key={clientName}
              className="rounded-xl border bg-white shadow-sm"
            >
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {clientName}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {items.length} deliverable{items.length !== 1 ? "s" : ""}
                  </span>
                </h3>
              </div>
              <div className="divide-y">
                {items.map((d) => {
                  const overdue = isOverdue(d);
                  const checklistPct =
                    d.checklistTotal > 0
                      ? Math.round(
                          (d.checklistCompleted / d.checklistTotal) * 100
                        )
                      : null;
                  return (
                    <div
                      key={d.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        overdue ? "bg-red-50/50" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {d.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {d.assigneeName} - Due{" "}
                          {new Date(d.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-3">
                        {checklistPct !== null && (
                          <span className="text-xs text-slate-500">
                            {d.checklistCompleted}/{d.checklistTotal}
                          </span>
                        )}
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            overdue
                              ? STATUS_COLORS["OVERDUE"]
                              : STATUS_COLORS[d.status] ??
                                "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {overdue ? "OVERDUE" : d.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(groupedByClient).length === 0 && (
            <div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
              No deliverables match the current filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}
