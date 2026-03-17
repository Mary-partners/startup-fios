"use client";

// ============================================================
// Activity Feed - Enhanced cross-client activity timeline
// Quick logging, filtering, and full timeline view
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Phone,
  Mail,
  Video,
  Send,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  UserCog,
  ListChecks,
  Loader2,
  AlertCircle,
  StickyNote,
} from "lucide-react";

interface Client {
  id: string;
  company: { id: string; name: string };
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  performedBy?: { id: string; name: string | null; email: string } | null;
  advisoryCase?: {
    company: { id: string; name: string; stage: string | null };
  } | null;
  createdAt: string;
}

const QUICK_LOG_TYPES = [
  { key: "CALL", label: "Call", icon: Phone },
  { key: "EMAIL", label: "Email", icon: Mail },
  { key: "MEETING", label: "Meeting", icon: Video },
  { key: "NOTE", label: "Note", icon: StickyNote },
  { key: "ISSUE_FLAGGED", label: "Issue", icon: AlertTriangle },
] as const;

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "CALL", label: "Calls" },
  { key: "EMAIL", label: "Emails" },
  { key: "MEETING", label: "Meetings" },
  { key: "NOTE", label: "Notes" },
  { key: "DELIVERABLE_SENT", label: "Deliverables" },
  { key: "STATUS_CHANGE", label: "Status Changes" },
  { key: "ISSUE_FLAGGED", label: "Issues" },
];

const DATE_FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Video,
  NOTE: FileText,
  DELIVERABLE_SENT: Send,
  STATUS_CHANGE: ArrowRightLeft,
  TASK_COMPLETED: CheckCircle2,
  ISSUE_FLAGGED: AlertTriangle,
  ASSIGNMENT_CHANGE: UserCog,
  CHECKLIST_COMPLETED: ListChecks,
};

const ICON_COLOR: Record<string, string> = {
  CALL: "text-green-600 bg-green-100",
  EMAIL: "text-blue-600 bg-blue-100",
  MEETING: "text-purple-600 bg-purple-100",
  NOTE: "text-gray-500 bg-gray-100",
  DELIVERABLE_SENT: "text-emerald-600 bg-emerald-100",
  STATUS_CHANGE: "text-amber-600 bg-amber-100",
  TASK_COMPLETED: "text-green-600 bg-green-100",
  ISSUE_FLAGGED: "text-red-600 bg-red-100",
  ASSIGNMENT_CHANGE: "text-blue-600 bg-blue-100",
  CHECKLIST_COMPLETED: "text-emerald-600 bg-emerald-100",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isInDateRange(dateStr: string, range: string): boolean {
  if (range === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (range === "today") {
    return date.toDateString() === now.toDateString();
  }
  if (range === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }
  if (range === "month") {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  }
  return true;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Quick log form
  const [logType, setLogType] = useState("CALL");
  const [logClient, setLogClient] = useState("");
  const [logTitle, setLogTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/advisory/activity/feed");
      if (!res.ok) throw new Error("Failed to load activity feed");
      const json = await res.json();
      setActivities(json.data ?? json ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/advisory/cases");
      if (!res.ok) return;
      const json = await res.json();
      setClients(json.data ?? json ?? []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchClients();
  }, [fetchActivities, fetchClients]);

  async function handleQuickLog(e: React.FormEvent) {
    e.preventDefault();
    if (!logTitle.trim() || !logClient) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/advisory/cases/${logClient}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: logType,
          title: logTitle.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to log activity");
      setLogTitle("");
      await fetchActivities();
    } catch {
      alert("Could not log activity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Build unique team members from activity data
  const teamMembers = Array.from(
    new Map(
      activities
        .filter((a) => a.performedBy?.name)
        .map((a) => [a.performedBy!.id, a.performedBy!.name!])
    )
  );

  // Filter activities
  const filtered = activities.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (clientFilter !== "all" && a.advisoryCase?.company?.id !== clientFilter)
      return false;
    if (teamFilter !== "all" && a.performedBy?.id !== teamFilter) return false;
    if (!isInDateRange(a.createdAt, dateFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Feed</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all interactions and events across clients
        </p>
      </div>

      {/* Quick Log Bar */}
      <form
        onSubmit={handleQuickLog}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        {/* Type icon buttons */}
        <div className="flex gap-1">
          {QUICK_LOG_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = logType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                title={t.label}
                onClick={() => setLogType(t.key)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Client selector */}
        <select
          value={logClient}
          onChange={(e) => setLogClient(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">Select client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company.name}
            </option>
          ))}
        </select>

        {/* Title input */}
        <input
          type="text"
          placeholder="Activity title..."
          value={logTitle}
          onChange={(e) => setLogTitle(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />

        {/* Log button */}
        <button
          type="submit"
          disabled={submitting || !logTitle.trim() || !logClient}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Logging..." : "Log"}
        </button>
      </form>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Type filter */}
        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === f.key
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Client filter */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.company.id}>
              {c.company.name}
            </option>
          ))}
        </select>

        {/* Team member filter */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Team</option>
          {teamMembers.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        {/* Date range filter */}
        <div className="flex gap-1.5">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                dateFilter === f.key
                  ? "bg-slate-800 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2 text-sm">Loading activity...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Activity Timeline */}
      {!loading && !error && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              No activity found matching your filters.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const IconComponent = ICON_MAP[item.type] ?? FileText;
                const colorClass =
                  ICON_COLOR[item.type] ?? "text-gray-500 bg-gray-100";
                const isLast = idx === filtered.length - 1;

                return (
                  <div key={item.id} className="relative flex gap-4 px-6 py-4">
                    {/* Connecting line */}
                    {!isLast && (
                      <div className="absolute bottom-0 left-[39px] top-[52px] w-px bg-slate-200" />
                    )}

                    {/* Time column */}
                    <div className="w-20 flex-shrink-0 pt-1 text-right">
                      <span className="text-xs font-medium text-slate-400">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-slate-600">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {item.advisoryCase?.company?.name && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {item.advisoryCase.company.name}
                          </span>
                        )}
                        {item.performedBy?.name && (
                          <span className="text-xs text-slate-400">
                            by {item.performedBy.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
