"use client";

// ============================================================
// Clients Page - Advisory portfolio management
// Grid/table view with filters, stats, and client cards
// ============================================================

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  AlertCircle,
  Briefcase,
  ListTodo,
  CalendarCheck,
  Plus,
  ChevronRight,
} from "lucide-react";

interface CaseData {
  id: string;
  company: { id: string; name: string; stage: string | null };
  priority: string | null;
  status: string | null;
  engagementStatus?: string | null;
  retainerAmount?: number | null;
  billingCadence?: string | null;
  servicePackageName?: string | null;
  servicePackage?: { name: string } | null;
  assignedAdvisor?: string | null;
  assignedTo?: { name: string | null } | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  estimatedHoursPerMonth?: number | null;
  actualHours?: number | null;
  openTasks: number;
  upcomingDeliverables?: number;
  nextReviewDate: string | null;
  lastReviewedAt: string | null;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "ONBOARDING", label: "Onboarding" },
  { key: "PROSPECT", label: "Prospect" },
  { key: "PAUSED", label: "Paused" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CHURNED", label: "Churned" },
];

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "retainer", label: "Retainer Amount" },
  { key: "nextDue", label: "Next Due Date" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PROSPECT: { bg: "bg-gray-100", text: "text-gray-700", label: "Prospect" },
  ONBOARDING: { bg: "bg-amber-100", text: "text-amber-700", label: "Onboarding" },
  ACTIVE: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  PAUSED: { bg: "bg-orange-100", text: "text-orange-700", label: "Paused" },
  COMPLETED: { bg: "bg-blue-100", text: "text-blue-700", label: "Completed" },
  CHURNED: { bg: "bg-red-100", text: "text-red-700", label: "Churned" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-700" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getEngagementStatus(c: CaseData): string {
  return c.engagementStatus ?? c.status ?? "ACTIVE";
}

function getAdvisorName(c: CaseData): string | null {
  if (c.assignedAdvisor) return c.assignedAdvisor;
  if (c.assignedTo?.name) return c.assignedTo.name;
  return null;
}

function getServicePackage(c: CaseData): string | null {
  if (c.servicePackageName) return c.servicePackageName;
  if (c.servicePackage?.name) return c.servicePackage.name;
  return null;
}

export default function ClientsPage() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchCases = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/advisory/cases");
      if (!res.ok) throw new Error("Failed to load clients");
      const json = await res.json();
      setCases(json.data ?? json ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Filter
  const filtered = cases.filter((c) => {
    if (statusFilter === "all") return true;
    return getEngagementStatus(c) === statusFilter;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.company.name.localeCompare(b.company.name);
      case "status":
        return (getEngagementStatus(a)).localeCompare(getEngagementStatus(b));
      case "retainer":
        return (b.retainerAmount ?? 0) - (a.retainerAmount ?? 0);
      case "nextDue":
        if (!a.nextReviewDate) return 1;
        if (!b.nextReviewDate) return -1;
        return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
      default:
        return 0;
    }
  });

  // Stats
  const totalClients = cases.length;
  const activeCount = cases.filter((c) => getEngagementStatus(c) === "ACTIVE").length;
  const monthlyRetainer = cases
    .filter((c) => getEngagementStatus(c) === "ACTIVE")
    .reduce((sum, c) => sum + (c.retainerAmount ?? 0), 0);
  const casesWithHours = cases.filter(
    (c) => c.estimatedHoursPerMonth && c.estimatedHoursPerMonth > 0
  );
  const avgUtilization =
    casesWithHours.length > 0
      ? Math.round(
          casesWithHours.reduce((sum, c) => {
            const util =
              ((c.actualHours ?? 0) / (c.estimatedHoursPerMonth ?? 1)) * 100;
            return sum + util;
          }, 0) / casesWithHours.length
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your advisory portfolio
          </p>
        </div>
        <Link
          href="/advisory/onboard"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Onboard New Client
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{totalClients}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Engagements</p>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Retainer</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(monthlyRetainer)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Utilization</p>
              <p className="text-2xl font-bold text-slate-900">
                {avgUtilization !== null ? `${avgUtilization}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.key
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === "table"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Table view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2 text-sm">Loading clients...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Grid View */}
      {!loading && !error && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-slate-400">
              No clients match your filters.
            </div>
          ) : (
            sorted.map((c) => {
              const engStatus = getEngagementStatus(c);
              const statusStyle = STATUS_STYLES[engStatus] ?? {
                bg: "bg-gray-100",
                text: "text-gray-600",
                label: engStatus,
              };
              const priorityStyle =
                c.priority && PRIORITY_STYLES[c.priority]
                  ? PRIORITY_STYLES[c.priority]
                  : null;
              const advisor = getAdvisorName(c);
              const pkg = getServicePackage(c);

              return (
                <div
                  key={c.id}
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/advisory/startups/${c.id}`}
                        className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {c.company.name}
                      </Link>
                      {pkg && (
                        <p className="mt-0.5 text-sm text-slate-500">{pkg}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                      {priorityStyle && (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyle.bg} ${priorityStyle.text}`}
                        >
                          {c.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {advisor && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Advisor:</span>
                        <span>{advisor}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">
                        {c.retainerAmount
                          ? `${formatCurrency(c.retainerAmount)}/mo`
                          : "No retainer set"}
                      </span>
                    </div>
                    {(c.contractStartDate || c.contractEndDate) && (
                      <div className="text-xs text-slate-400">
                        {formatDate(c.contractStartDate ?? null)} -{" "}
                        {formatDate(c.contractEndDate ?? null)}
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <ListTodo className="h-3.5 w-3.5" />
                      {c.openTasks} Tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {c.upcomingDeliverables ?? 0} Due
                    </span>
                    {c.estimatedHoursPerMonth != null &&
                      c.estimatedHoursPerMonth > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {c.actualHours ?? 0}/{c.estimatedHoursPerMonth}h
                        </span>
                      )}
                  </div>

                  {/* View Details link */}
                  <Link
                    href={`/advisory/startups/${c.id}`}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View Details
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && !error && viewMode === "table" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {sorted.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No clients match your filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Client
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Advisor
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Package
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">
                    Retainer
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-center">
                    Tasks
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Priority
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Next Review
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((c) => {
                  const engStatus = getEngagementStatus(c);
                  const statusStyle = STATUS_STYLES[engStatus] ?? {
                    bg: "bg-gray-100",
                    text: "text-gray-600",
                    label: engStatus,
                  };
                  const advisor = getAdvisorName(c);
                  const pkg = getServicePackage(c);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/advisory/startups/${c.id}`}
                          className="font-medium text-slate-900 hover:text-blue-600"
                        >
                          {c.company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {advisor ?? "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {pkg ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {c.retainerAmount
                          ? `${formatCurrency(c.retainerAmount)}/mo`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {c.openTasks}
                      </td>
                      <td className="px-4 py-3">
                        {c.priority &&
                        PRIORITY_STYLES[c.priority] ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[c.priority].bg} ${PRIORITY_STYLES[c.priority].text}`}
                          >
                            {c.priority}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(c.nextReviewDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/advisory/startups/${c.id}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
