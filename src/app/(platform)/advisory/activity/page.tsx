"use client";

// ============================================================
// Activity Feed - Cross-client activity timeline
// Recent activity across all advisory clients
// ============================================================

import { useState } from "react";
import { ActivityFeed } from "@/components/advisory/activity-feed";

const ACTIVITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "CALL", label: "Calls" },
  { key: "EMAIL", label: "Emails" },
  { key: "MEETING", label: "Meetings" },
  { key: "NOTE", label: "Notes" },
  { key: "ISSUE_FLAGGED", label: "Issues" },
];

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Feed</h1>
        <p className="mt-1 text-sm text-slate-500">
          Recent activity across all advisory clients
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Activity Feed (global - no caseId) */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ActivityFeed />
      </div>
    </div>
  );
}
