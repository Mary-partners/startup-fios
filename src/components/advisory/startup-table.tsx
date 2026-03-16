"use client";

// ============================================================
// StartupTable - Sortable, filterable advisory startup list
// Used on Advisory startups page and advisory dashboard
// ============================================================

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface StartupRow {
  caseId: string;
  companyName: string;
  stage: string | null;
  priority: string;
  survivalScore: number | null;
  healthScore: number | null;
  runway: number | null;
  activeAlerts: number;
  openTasks: number;
  lastReviewedAt: string | null;
  nextReviewDate: string | null;
}

export interface StartupTableProps {
  startups: StartupRow[];
  /** Link prefix for startup detail pages */
  basePath?: string;
  /** Show filter controls */
  filterable?: boolean;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-700" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700" },
  LOW: { bg: "bg-green-100", text: "text-green-700" },
  STABLE: { bg: "bg-slate-100", text: "text-slate-600" },
};

type SortField = "companyName" | "priority" | "survivalScore" | "healthScore" | "runway" | "activeAlerts";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  STABLE: 4,
};

export default function StartupTable({
  startups,
  basePath = "/advisory/startups",
  filterable = true,
}: StartupTableProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    let list = [...startups];

    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.companyName.toLowerCase().includes(q));
    }
    if (priorityFilter !== "ALL") {
      list = list.filter((s) => s.priority === priorityFilter);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "companyName":
          cmp = a.companyName.localeCompare(b.companyName);
          break;
        case "priority":
          cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
          break;
        case "survivalScore":
          cmp = (a.survivalScore ?? -1) - (b.survivalScore ?? -1);
          break;
        case "healthScore":
          cmp = (a.healthScore ?? -1) - (b.healthScore ?? -1);
          break;
        case "runway":
          cmp = (a.runway ?? -1) - (b.runway ?? -1);
          break;
        case "activeAlerts":
          cmp = a.activeAlerts - b.activeAlerts;
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return list;
  }, [startups, search, priorityFilter, sortField, sortDir]);

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 cursor-pointer select-none hover:text-slate-700"
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-blue-500">{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="space-y-3">
      {/* Filters */}
      {filterable && (
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-64"
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="STABLE">Stable</option>
          </select>
          <span className="self-center text-xs text-slate-400">
            {sorted.length} of {startups.length} companies
          </span>
        </div>
      )}

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-400 shadow-sm">
          No startups match your filters
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
                <SortHeader field="companyName">Company</SortHeader>
                <th className="px-4 py-3">Stage</th>
                <SortHeader field="priority">Priority</SortHeader>
                <SortHeader field="survivalScore">Survival</SortHeader>
                <SortHeader field="healthScore">Health</SortHeader>
                <SortHeader field="runway">Runway</SortHeader>
                <SortHeader field="activeAlerts">Alerts</SortHeader>
                <th className="px-4 py-3">Tasks</th>
                <th className="px-4 py-3">Last Review</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const priStyle = PRIORITY_STYLES[s.priority] ?? PRIORITY_STYLES.STABLE;
                const overdue =
                  s.nextReviewDate && new Date(s.nextReviewDate) < new Date();

                return (
                  <tr
                    key={s.caseId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`${basePath}/${s.caseId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {s.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {s.stage?.replace("_", " ") ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${priStyle.bg} ${priStyle.text}`}
                      >
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.survivalScore != null ? (
                        <ScoreCell value={s.survivalScore} />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.healthScore != null ? (
                        <ScoreCell value={s.healthScore} />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.runway != null ? (
                        <span
                          className={
                            s.runway < 6
                              ? "font-medium text-red-600"
                              : s.runway < 12
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                        >
                          {s.runway >= 999
                            ? "∞"
                            : `${s.runway.toFixed(1)}mo`}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.activeAlerts > 0 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                          {s.activeAlerts}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.openTasks}</td>
                    <td className="px-4 py-3 text-xs">
                      {s.lastReviewedAt ? (
                        <span
                          className={overdue ? "text-red-600 font-medium" : "text-slate-500"}
                        >
                          {new Date(s.lastReviewedAt).toLocaleDateString()}
                          {overdue && " (overdue)"}
                        </span>
                      ) : (
                        <span className="text-slate-400">Never</span>
                      )}
                    </td>
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

// ── Score cell with color-coded bar ─────────────────────────
function ScoreCell({ value }: { value: number }) {
  const color =
    value >= 70
      ? "bg-green-500 text-green-700"
      : value >= 40
      ? "bg-yellow-500 text-yellow-700"
      : "bg-red-500 text-red-700";

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold ${color.split(" ")[1]}`}>
        {Math.round(value)}
      </span>
      <div className="h-1.5 w-12 rounded-full bg-slate-200">
        <div
          className={`h-1.5 rounded-full ${color.split(" ")[0]}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
