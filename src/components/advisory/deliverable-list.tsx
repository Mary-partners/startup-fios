"use client";

// ============================================================
// DeliverableList - Fetches and displays deliverables for a case
// Supports inline status updates and adding new deliverables
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  CalendarDays,
  User,
  CheckSquare,
} from "lucide-react";

interface Deliverable {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
  assignee?: { name: string | null } | null;
  checklistTotal?: number;
  checklistCompleted?: number;
  caseId?: string;
  companyName?: string;
}

interface DeliverableListProps {
  caseId: string;
  showClientColumn?: boolean;
}

const STATUS_OPTIONS = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  NOT_STARTED: { bg: "bg-gray-100", text: "text-gray-700" },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700" },
  IN_REVIEW: { bg: "bg-amber-100", text: "text-amber-700" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DeliverableList({ caseId, showClientColumn }: DeliverableListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", dueDate: "", description: "" });

  const fetchDeliverables = useCallback(async () => {
    try {
      setError(null);
      const url = caseId
        ? `/api/advisory/cases/${caseId}/deliverables`
        : `/api/advisory/deliverables/upcoming`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load deliverables");
      const data = await res.json();
      setDeliverables(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  async function handleStatusChange(deliverableId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/advisory/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? { ...d, status: newStatus } : d))
      );
    } catch {
      alert("Could not update deliverable status. Please try again.");
    }
  }

  async function handleAddDeliverable(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/advisory/cases/${caseId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          dueDate: formData.dueDate || null,
          description: formData.description || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create deliverable");
      setFormData({ title: "", dueDate: "", description: "" });
      setShowForm(false);
      await fetchDeliverables();
    } catch {
      alert("Could not create deliverable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">Loading deliverables...</span>
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Deliverables ({deliverables.length})
        </h3>
        {caseId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Deliverable
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAddDeliverable}
          className="space-y-3 rounded-xl border bg-gray-50 p-4"
        >
          <input
            type="text"
            placeholder="Deliverable title"
            value={formData.title}
            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              {submitting ? "Saving..." : "Save"}
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
      {deliverables.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          No deliverables yet.
        </p>
      )}

      {/* List */}
      <div className="divide-y rounded-xl border bg-white">
        {deliverables.map((d) => {
          const overdue = d.status !== "COMPLETED" && d.status !== "CANCELLED" && isOverdue(d.dueDate);
          const style = STATUS_STYLES[d.status] ?? { bg: "bg-gray-100", text: "text-gray-700" };

          return (
            <div key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              {/* Title and optional client */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{d.title}</p>
                {showClientColumn && d.companyName && (
                  <p className="text-xs text-gray-500">{d.companyName}</p>
                )}
              </div>

              {/* Status dropdown */}
              <select
                value={d.status}
                onChange={(e) => handleStatusChange(d.id, e.target.value)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text} border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              {/* Due date */}
              {d.dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    overdue ? "font-semibold text-red-600" : "text-gray-500"
                  }`}
                >
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(d.dueDate)}
                </span>
              )}

              {/* Assignee */}
              {d.assignee?.name && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  {d.assignee.name}
                </span>
              )}

              {/* Checklist progress */}
              {d.checklistTotal != null && d.checklistTotal > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <CheckSquare className="h-3 w-3" />
                  {d.checklistCompleted ?? 0}/{d.checklistTotal} items
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
