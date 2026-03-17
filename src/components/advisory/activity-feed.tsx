"use client";

// ============================================================
// ActivityFeed - Timeline of activities for a case or global feed
// Supports logging new activities and displaying typed icons
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
  Plus,
  Loader2,
  AlertCircle,
  Activity,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  performedBy?: { name: string | null } | null;
  createdAt: string;
}

interface ActivityFeedProps {
  caseId?: string;
  limit?: number;
}

const ACTIVITY_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "DELIVERABLE_SENT",
  "STATUS_CHANGE",
  "TASK_COMPLETED",
  "ISSUE_FLAGGED",
  "ASSIGNMENT_CHANGE",
  "CHECKLIST_COMPLETED",
] as const;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  NOTE: FileText,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Video,
  DELIVERABLE_SENT: Send,
  STATUS_CHANGE: ArrowRightLeft,
  TASK_COMPLETED: CheckCircle2,
  ISSUE_FLAGGED: AlertTriangle,
  ASSIGNMENT_CHANGE: UserCog,
  CHECKLIST_COMPLETED: ListChecks,
};

const ICON_COLOR: Record<string, string> = {
  NOTE: "text-gray-500 bg-gray-100",
  CALL: "text-blue-500 bg-blue-100",
  EMAIL: "text-indigo-500 bg-indigo-100",
  MEETING: "text-purple-500 bg-purple-100",
  DELIVERABLE_SENT: "text-green-500 bg-green-100",
  STATUS_CHANGE: "text-amber-500 bg-amber-100",
  TASK_COMPLETED: "text-green-600 bg-green-100",
  ISSUE_FLAGGED: "text-red-500 bg-red-100",
  ASSIGNMENT_CHANGE: "text-cyan-500 bg-cyan-100",
  CHECKLIST_COMPLETED: "text-emerald-500 bg-emerald-100",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTypeLabel(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function ActivityFeed({ caseId, limit }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "NOTE" as string,
    title: "",
    description: "",
  });

  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      const url = caseId
        ? `/api/advisory/cases/${caseId}/activity`
        : `/api/advisory/activity/feed`;
      const params = limit ? `?limit=${limit}` : "";
      const res = await fetch(`${url}${params}`);
      if (!res.ok) throw new Error("Failed to load activity feed");
      const data = await res.json();
      setActivities(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [caseId, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  async function handleLogActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      const url = caseId
        ? `/api/advisory/cases/${caseId}/activity`
        : `/api/advisory/activity/feed`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to log activity");
      setFormData({ type: "NOTE", title: "", description: "" });
      setShowForm(false);
      await fetchActivities();
    } catch {
      alert("Could not log activity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <Activity className="h-4 w-4" />
          Activity
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Log Activity
        </button>
      </div>

      {/* Log activity form */}
      {showForm && (
        <form
          onSubmit={handleLogActivity}
          className="space-y-3 rounded-xl border bg-gray-50 p-4"
        >
          <select
            value={formData.type}
            onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatTypeLabel(t)}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Activity title"
            value={formData.title}
            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Log"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {activities.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          No activity recorded yet.
        </p>
      )}

      {/* Timeline */}
      <div className="relative space-y-0">
        {activities.map((item, idx) => {
          const IconComponent = ICON_MAP[item.type] ?? FileText;
          const colorClass = ICON_COLOR[item.type] ?? "text-gray-500 bg-gray-100";
          const isLast = idx === activities.length - 1;

          return (
            <div key={item.id} className="relative flex gap-3 pb-4">
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute left-[15px] top-8 h-full w-px bg-gray-200" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
              >
                <IconComponent className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-sm text-gray-600">{item.description}</p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  {item.performedBy?.name && <span>{item.performedBy.name}</span>}
                  {item.performedBy?.name && <span>·</span>}
                  <span>{timeAgo(item.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
