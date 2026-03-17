"use client";

// ============================================================
// WorkloadGrid - Team workload overview with utilization cards
// Fetches team data and renders a grid of member cards
// ============================================================

import { useState, useEffect } from "react";
import { Users, Briefcase, ListTodo, CalendarCheck, Loader2, AlertCircle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  activeClients: number;
  openTasks: number;
  upcomingDeliverables: number;
  actualHours: number;
  estimatedHours: number;
}

export function WorkloadGrid() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkload() {
      try {
        const res = await fetch("/api/advisory/team/workload");
        if (!res.ok) throw new Error("Failed to load team workload");
        const data = await res.json();
        setMembers(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchWorkload();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">Loading team workload...</span>
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

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Users className="h-8 w-8" />
        <p className="mt-2 text-sm">No team members found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <Users className="h-4 w-4" />
        Team Workload
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const utilization =
            member.estimatedHours > 0
              ? Math.round((member.actualHours / member.estimatedHours) * 100)
              : 0;

          const barColor =
            utilization > 100
              ? "bg-red-500"
              : utilization >= 80
                ? "bg-amber-500"
                : "bg-green-500";

          const badgeColor =
            utilization > 100
              ? "text-red-700 bg-red-100"
              : utilization >= 80
                ? "text-amber-700 bg-amber-100"
                : "text-green-700 bg-green-100";

          return (
            <div
              key={member.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              {/* Name and email */}
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  {member.name}
                </h4>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>

              {/* Stats */}
              <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Briefcase className="h-3 w-3" />
                    Clients
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {member.activeClients}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <ListTodo className="h-3 w-3" />
                    Tasks
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {member.openTasks}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <CalendarCheck className="h-3 w-3" />
                    Due
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {member.upcomingDeliverables}
                  </p>
                </div>
              </div>

              {/* Utilization bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Utilization</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${badgeColor}`}>
                    {utilization}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-gray-400">
                  {member.actualHours}h / {member.estimatedHours}h
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
