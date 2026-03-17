"use client";

// ============================================================
// Deliverables Hub - Comprehensive deliverables tracking
// Track, filter, and manage deliverables across all clients
// ============================================================

import { useState, useEffect, useMemo, useCallback } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface Deliverable {
  id: string;
  title: string;
  clientName: string;
  status: string;
  dueDate: string;
  assigneeName: string;
  checklistTotal: number;
  checklistCompleted: number;
  checklistItems?: ChecklistItem[];
}

type StatusFilter = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "IN_REVIEW" | "DELIVERED" | "OVERDUE";
type DueDateFilter = "all" | "this_week" | "this_month" | "overdue";
type SortDirection = "asc" | "desc";

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "OVERDUE", label: "Overdue" },
];

const DUE_DATE_OPTIONS: { key: DueDateFilter; label: string }[] = [
  { key: "all", label: "All Dates" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "overdue", label: "Overdue" },
];

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  NOT_STARTED: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-100 text-green-700",
  BLOCKED: "bg-amber-100 text-amber-700",
};

const STATUS_CHANGE_OPTIONS = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DELIVERED",
  "COMPLETE",
];

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

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function isOverdue(d: Deliverable): boolean {
  return (
    new Date(d.dueDate) < new Date() &&
    d.status !== "COMPLETE" &&
    d.status !== "DELIVERED"
  );
}

function isCompletedThisMonth(d: Deliverable): boolean {
  return (d.status === "COMPLETE" || d.status === "DELIVERED") && isThisMonth(d.dueDate);
}

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

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

  // Unique clients and assignees for filter dropdowns
  const uniqueClients = useMemo(() => {
    const names = new Set(deliverables.map((d) => d.clientName));
    return Array.from(names).sort();
  }, [deliverables]);

  const uniqueAssignees = useMemo(() => {
    const names = new Set(deliverables.map((d) => d.assigneeName));
    return Array.from(names).sort();
  }, [deliverables]);

  // Summary stats
  const stats = useMemo(() => {
    const total = deliverables.length;
    const overdueCount = deliverables.filter((d) => isOverdue(d)).length;
    const dueThisWeek = deliverables.filter(
      (d) => isThisWeek(d.dueDate) && !isOverdue(d) && d.status !== "COMPLETE" && d.status !== "DELIVERED"
    ).length;
    const completedThisMonth = deliverables.filter((d) => isCompletedThisMonth(d)).length;
    return { total, overdueCount, dueThisWeek, completedThisMonth };
  }, [deliverables]);

  // Filtered and sorted list
  const filtered = useMemo(() => {
    let result = [...deliverables];

    // Status
    if (statusFilter === "OVERDUE") {
      result = result.filter((d) => isOverdue(d));
    } else if (statusFilter !== "ALL") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Client
    if (clientFilter !== "ALL") {
      result = result.filter((d) => d.clientName === clientFilter);
    }

    // Assignee
    if (assigneeFilter !== "ALL") {
      result = result.filter((d) => d.assigneeName === assigneeFilter);
    }

    // Due date
    if (dueDateFilter === "this_week") {
      result = result.filter((d) => isThisWeek(d.dueDate));
    } else if (dueDateFilter === "this_month") {
      result = result.filter((d) => isThisMonth(d.dueDate));
    } else if (dueDateFilter === "overdue") {
      result = result.filter((d) => isOverdue(d));
    }

    // Sort by due date
    result.sort((a, b) => {
      const da = new Date(a.dueDate).getTime();
      const db = new Date(b.dueDate).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });

    return result;
  }, [deliverables, statusFilter, clientFilter, assigneeFilter, dueDateFilter, sortDir]);

  const toggleSort = useCallback(() => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const toggleRow = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const toggleChecklistItem = useCallback(
    (deliverableId: string, itemId: string) => {
      setDeliverables((prev) =>
        prev.map((d) => {
          if (d.id !== deliverableId || !d.checklistItems) return d;
          const updatedItems = d.checklistItems.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          const completed = updatedItems.filter((i) => i.completed).length;
          return {
            ...d,
            checklistItems: updatedItems,
            checklistCompleted: completed,
          };
        })
      );
    },
    []
  );

  const handleStatusChange = useCallback(
    (deliverableId: string, newStatus: string) => {
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? { ...d, status: newStatus } : d))
      );
      setStatusDropdownOpen(null);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deliverables</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage deliverables across all startup clients
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Deliverable
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-red-600">Overdue</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{stats.overdueCount}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-600">Due This Week</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.dueThisWeek}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-green-600">Completed This Month</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{stats.completedThisMonth}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Client Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Client</label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Clients</option>
            {uniqueClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Assignee</label>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Team Members</option>
            {uniqueAssignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Due Date</label>
          <select
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value as DueDateFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DUE_DATE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters */}
        {(statusFilter !== "ALL" || clientFilter !== "ALL" || assigneeFilter !== "ALL" || dueDateFilter !== "all") && (
          <div className="flex flex-col justify-end gap-1">
            <label className="text-xs text-transparent">Clear</label>
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setClientFilter("ALL");
                setAssigneeFilter("ALL");
                setDueDateFilter("all");
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {loading && (
        <div className="flex items-center justify-center rounded-xl border bg-white py-16 text-slate-400 shadow-sm">
          <svg className="mr-2 h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading deliverables...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border bg-white py-16 text-center text-sm text-slate-400 shadow-sm">
          No deliverables match the current filters
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="w-8 px-2 py-3" />
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th
                    className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-slate-700"
                    onClick={toggleSort}
                  >
                    <span className="flex items-center gap-1">
                      Due Date
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {sortDir === "asc" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    </span>
                  </th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Checklist</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const overdue = isOverdue(d);
                  const isExpanded = expandedRow === d.id;
                  const checklistPct =
                    d.checklistTotal > 0
                      ? Math.round((d.checklistCompleted / d.checklistTotal) * 100)
                      : null;

                  // Due date styling
                  const now = new Date();
                  const due = new Date(d.dueDate);
                  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                  let dueDateClass = "text-slate-600";
                  if (d.status !== "COMPLETE" && d.status !== "DELIVERED") {
                    if (diffDays < 0) dueDateClass = "text-red-600 font-semibold";
                    else if (diffDays <= 3) dueDateClass = "text-amber-600 font-medium";
                  }

                  return (
                    <>
                      <tr
                        key={d.id}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                          overdue ? "bg-red-50/40" : ""
                        } ${isExpanded ? "bg-blue-50/30" : ""}`}
                      >
                        {/* Expand arrow */}
                        <td className="px-2 py-3">
                          <button
                            onClick={() => toggleRow(d.id)}
                            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          >
                            <svg
                              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>

                        {/* Title */}
                        <td
                          className="cursor-pointer px-4 py-3 font-medium text-slate-900"
                          onClick={() => toggleRow(d.id)}
                        >
                          {d.title}
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3 text-slate-600">{d.clientName}</td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              overdue
                                ? STATUS_COLORS["OVERDUE"]
                                : STATUS_COLORS[d.status] ?? "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {overdue ? "OVERDUE" : d.status.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className={`px-4 py-3 ${dueDateClass}`}>
                          <span className="flex items-center gap-1">
                            {overdue && (
                              <svg className="h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

                        {/* Assigned To */}
                        <td className="px-4 py-3 text-slate-600">{d.assigneeName}</td>

                        {/* Checklist */}
                        <td className="px-4 py-3">
                          {checklistPct !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    checklistPct === 100 ? "bg-green-500" : "bg-blue-500"
                                  }`}
                                  style={{ width: `${checklistPct}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">
                                {d.checklistCompleted}/{d.checklistTotal}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">--</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRow(d.id)}
                              className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            >
                              View
                            </button>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setStatusDropdownOpen(statusDropdownOpen === d.id ? null : d.id)
                                }
                                className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                              >
                                Edit Status
                              </button>
                              {statusDropdownOpen === d.id && (
                                <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
                                  {STATUS_CHANGE_OPTIONS.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => handleStatusChange(d.id, s)}
                                      className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 ${
                                        d.status === s
                                          ? "font-semibold text-blue-700"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      {s.replace(/_/g, " ")}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row: Checklist Items */}
                      {isExpanded && (
                        <tr key={`${d.id}-expanded`} className="border-b border-slate-100">
                          <td colSpan={8} className="bg-slate-50/70 px-6 py-4">
                            <div className="max-w-xl">
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Checklist Items
                              </h4>
                              {d.checklistItems && d.checklistItems.length > 0 ? (
                                <div className="space-y-2">
                                  {d.checklistItems.map((item) => (
                                    <label
                                      key={item.id}
                                      className="flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-3 py-2 transition-colors hover:bg-slate-50"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => toggleChecklistItem(d.id, item.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span
                                        className={`text-sm ${
                                          item.completed
                                            ? "text-slate-400 line-through"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400">
                                  No checklist items available for this deliverable.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          <div className="border-t px-4 py-3 text-xs text-slate-500">
            Showing {filtered.length} of {deliverables.length} deliverables
          </div>
        </div>
      )}
    </div>
  );
}
