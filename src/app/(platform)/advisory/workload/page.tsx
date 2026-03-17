"use client";

// ============================================================
// Team Workload Dashboard
// Monitor capacity and assignments across the advisory team
// ============================================================

import { useState, useEffect } from "react";
import { WorkloadGrid } from "@/components/advisory/workload-grid";

interface UpcomingDeliverable {
  id: string;
  title: string;
  clientName: string;
  assigneeName: string;
  dueDate: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  OVERDUE: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  NOT_STARTED: "bg-slate-100 text-slate-700",
  COMPLETE: "bg-green-100 text-green-700",
  BLOCKED: "bg-amber-100 text-amber-700",
};

export default function WorkloadPage() {
  const [deliverables, setDeliverables] = useState<UpcomingDeliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch("/api/advisory/deliverables/upcoming");
        if (!res.ok) throw new Error("Failed to load upcoming deliverables");
        const data = await res.json();
        setDeliverables(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team Workload</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor capacity and assignments across the advisory team
        </p>
      </div>

      {/* Workload Grid */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <WorkloadGrid />
      </div>

      {/* Upcoming Deliverables */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Upcoming Deliverables
          </h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && deliverables.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No upcoming deliverables found
          </div>
        )}

        {!loading && !error && deliverables.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((d) => {
                  const isOverdue =
                    new Date(d.dueDate) < new Date() &&
                    d.status !== "COMPLETE";
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {d.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.clientName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.assigneeName}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          isOverdue ? "font-medium text-red-600" : "text-slate-600"
                        }`}
                      >
                        {new Date(d.dueDate).toLocaleDateString()}
                        {isOverdue && " (overdue)"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            STATUS_COLORS[d.status] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {d.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
