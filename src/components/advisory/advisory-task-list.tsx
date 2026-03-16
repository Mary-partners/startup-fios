"use client";

// ============================================================
// AdvisoryTaskList - Filterable, sortable task list
// Used on Advisory tasks page and startup detail pages
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";

export interface AdvisoryTaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  companyName?: string;
  caseId?: string;
  assignedTo?: string | null;
  createdAt?: string;
}

export interface AdvisoryTaskListProps {
  tasks: AdvisoryTaskItem[];
  /** Show company column (set false on detail pages) */
  showCompany?: boolean;
  /** Allow status changes */
  onStatusChange?: (taskId: string, newStatus: string) => void | Promise<void>;
  /** Show filter controls */
  filterable?: boolean;
  /** Compact layout for sidebar usage */
  compact?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; order: number }> = {
  OPEN: { label: "Open", bg: "bg-slate-100", text: "text-slate-700", order: 0 },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", order: 1 },
  BLOCKED: { label: "Blocked", bg: "bg-red-100", text: "text-red-700", order: 2 },
  COMPLETE: { label: "Complete", bg: "bg-green-100", text: "text-green-700", order: 3 },
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string; order: number }> = {
  URGENT: { label: "Urgent", bg: "bg-red-100", text: "text-red-700", order: 0 },
  HIGH: { label: "High", bg: "bg-orange-100", text: "text-orange-700", order: 1 },
  MEDIUM: { label: "Medium", bg: "bg-yellow-100", text: "text-yellow-700", order: 2 },
  LOW: { label: "Low", bg: "bg-slate-100", text: "text-slate-600", order: 3 },
};

export default function AdvisoryTaskList({
  tasks,
  showCompany = true,
  onStatusChange,
  filterable = true,
  compact = false,
  emptyMessage = "No tasks",
}: AdvisoryTaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  // Filter
  const filtered = tasks.filter((t) => {
    if (statusFilter === "OPEN" && t.status === "COMPLETE") return false;
    if (statusFilter !== "ALL" && statusFilter !== "OPEN" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  // Sort: by priority then by due date
  const sorted = [...filtered].sort((a, b) => {
    const pa = PRIORITY_CONFIG[a.priority]?.order ?? 99;
    const pb = PRIORITY_CONFIG[b.priority]?.order ?? 99;
    if (pa !== pb) return pa - pb;
    // Then by due date (soonest first, nulls last)
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const handleStatus = async (taskId: string, newStatus: string) => {
    if (!onStatusChange) return;
    setUpdating(taskId);
    try {
      await onStatusChange(taskId, newStatus);
    } finally {
      setUpdating(null);
    }
  };

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETE"
  );

  if (tasks.length === 0) {
    return (
      <div className={`text-center ${compact ? "py-4 text-sm" : "py-8"} text-slate-400`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Overdue banner */}
      {overdueTasks.length > 0 && !compact && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Filters */}
      {filterable && !compact && (
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="OPEN">Open Tasks</option>
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
          <span className="self-center text-xs text-slate-400">
            {sorted.length} task{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">
          No tasks match your filters
        </div>
      ) : compact ? (
        // Compact list view
        <div className="divide-y divide-slate-100">
          {sorted.map((task) => {
            const priCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;
            const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.OPEN;
            const overdue =
              task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETE";

            return (
              <div key={task.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      task.status === "COMPLETE" ? "line-through text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold ${priCfg.text}`}>
                      {priCfg.label}
                    </span>
                    {task.assignedTo && (
                      <span className="text-[10px] text-slate-400">
                        → {task.assignedTo}
                      </span>
                    )}
                    {overdue && (
                      <span className="text-[10px] font-medium text-red-600">Overdue</span>
                    )}
                  </div>
                </div>
                {onStatusChange && (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatus(task.id, e.target.value)}
                    disabled={updating === task.id}
                    className="rounded border border-slate-200 px-1.5 py-1 text-[11px] disabled:opacity-50"
                  >
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Full table view
        <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Task</th>
                {showCompany && <th className="px-4 py-3">Company</th>}
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Due Date</th>
                {onStatusChange && <th className="px-4 py-3">Update</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((task) => {
                const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.OPEN;
                const priCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;
                const overdue =
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETE";

                return (
                  <tr key={task.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p
                        className={`font-medium ${
                          task.status === "COMPLETE"
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </td>
                    {showCompany && (
                      <td className="px-4 py-3">
                        {task.caseId ? (
                          <Link
                            href={`/advisory/startups/${task.caseId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {task.companyName ?? "-"}
                          </Link>
                        ) : (
                          <span className="text-slate-500">{task.companyName ?? "-"}</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${priCfg.bg} ${priCfg.text}`}
                      >
                        {priCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {task.assignedTo ?? <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <span
                          className={
                            overdue ? "font-medium text-red-600" : "text-slate-600"
                          }
                        >
                          {new Date(task.dueDate).toLocaleDateString()}
                          {overdue && " (overdue)"}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    {onStatusChange && (
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatus(task.id, e.target.value)}
                          disabled={updating === task.id}
                          className="rounded border border-slate-200 px-2 py-1 text-xs disabled:opacity-50"
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val}>
                              {cfg.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
