"use client";

// ============================================================
// ChecklistPanel - Interactive checklist for a single deliverable
// Supports toggling items, showing completion info, adding items
// ============================================================

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
  completedBy?: { name: string | null } | null;
}

interface ChecklistPanelProps {
  deliverableId: string;
  items: ChecklistItem[];
  onUpdate: () => void;
}

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
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChecklistPanel({ deliverableId, items, onUpdate }: ChecklistPanelProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  async function handleToggle(item: ChecklistItem) {
    setToggling(item.id);
    try {
      const res = await fetch(
        `/api/advisory/deliverables/${deliverableId}/checklist/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: !item.isCompleted }),
        }
      );
      if (!res.ok) throw new Error("Failed to update checklist item");
      onUpdate();
    } catch {
      alert("Could not update checklist item. Please try again.");
    } finally {
      setToggling(null);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(
        `/api/advisory/deliverables/${deliverableId}/checklist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newItemTitle.trim() }),
        }
      );
      if (!res.ok) throw new Error("Failed to add checklist item");
      setNewItemTitle("");
      onUpdate();
    } catch {
      alert("Could not add checklist item. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Checklist progress</span>
          <span>
            {completedCount}/{totalCount} completed ({progressPct}%)
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
          >
            <button
              onClick={() => handleToggle(item)}
              disabled={toggling === item.id}
              className="mt-0.5 flex-shrink-0"
              aria-label={item.isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              {toggling === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    item.isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {item.isCompleted && (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  item.isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                }`}
              >
                {item.title}
              </p>
              {item.isCompleted && item.completedAt && (
                <p className="text-xs text-gray-400">
                  Completed {timeAgo(item.completedAt)}
                  {item.completedBy?.name ? ` by ${item.completedBy.name}` : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400">
          No checklist items yet.
        </p>
      )}

      {/* Add item */}
      <form onSubmit={handleAddItem} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add checklist item..."
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={adding || !newItemTitle.trim()}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          {adding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add
        </button>
      </form>
    </div>
  );
}
