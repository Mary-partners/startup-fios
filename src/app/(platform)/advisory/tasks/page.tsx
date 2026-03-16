// ============================================================
// Advisory Tasks Page - Full task management with assignments
// ============================================================

"use client";

import { useState, useEffect } from "react";
import MetricCard from "@/components/dashboard/metric-card";
import AdvisoryTaskList, {
  type AdvisoryTaskItem,
} from "@/components/advisory/advisory-task-list";

interface AdvisoryCase {
  id: string;
  companyName: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

const PRIORITY_CONFIG: Record<string, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export default function AdvisoryTasksPage() {
  const [tasks, setTasks] = useState<AdvisoryTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCaseId, setNewCaseId] = useState("");
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const [cases, setCases] = useState<AdvisoryCase[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchCases();
    fetchTeam();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/advisory/tasks");
      const data = await res.json();
      if (data.success) {
        const mapped: AdvisoryTaskItem[] = data.data.map(
          (t: {
            id: string;
            title: string;
            description: string | null;
            status: string;
            priority: string;
            dueDate: string | null;
            advisoryCase: { id: string; company: { name: string } };
            assignedTo?: { id: string; name: string | null; email: string } | null;
            createdAt: string;
          }) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            companyName: t.advisoryCase.company.name,
            caseId: t.advisoryCase.id,
            assignedTo: t.assignedTo?.name ?? t.assignedTo?.email ?? null,
            createdAt: t.createdAt,
          })
        );
        setTasks(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/advisory/cases");
      const data = await res.json();
      if (data.success) {
        setCases(
          data.data.map((c: { id: string; company: { name: string } }) => ({
            id: c.id,
            companyName: c.company.name,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/advisory/team");
      const data = await res.json();
      if (data.success) {
        setTeam(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/advisory/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newCaseId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/advisory/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          priority: newPriority,
          dueDate: newDueDate || null,
          advisoryCaseId: newCaseId,
          assignedToId: newAssigneeId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewPriority("MEDIUM");
    setNewDueDate("");
    setNewCaseId("");
    setNewAssigneeId("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading tasks...</div>
      </div>
    );
  }

  const openCount = tasks.filter((t) => t.status !== "COMPLETE").length;
  const urgentCount = tasks.filter(
    (t) => t.priority === "URGENT" && t.status !== "COMPLETE"
  ).length;
  const overdueCount = tasks.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETE"
  ).length;
  const companiesCount = new Set(tasks.map((t) => t.caseId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Advisory Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cross-company task management for your advisory portfolio
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          + New Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Open Tasks"
          value={openCount}
          highlight={openCount > 0 ? "default" : "success"}
        />
        <MetricCard
          title="Urgent"
          value={urgentCount}
          highlight={urgentCount > 0 ? "danger" : "default"}
        />
        <MetricCard
          title="Overdue"
          value={overdueCount}
          highlight={overdueCount > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Companies"
          value={companiesCount}
          highlight="default"
        />
      </div>

      {/* Shared AdvisoryTaskList Component */}
      <AdvisoryTaskList
        tasks={tasks}
        showCompany
        onStatusChange={handleStatusChange}
        filterable
        emptyMessage="No advisory tasks yet. Create one to get started."
      />

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Advisory Task
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Company / Case
                </label>
                <select
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select a case</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Review Q1 financials"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Assign To
                </label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Auto-assign to me</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name ?? m.email} ({m.role.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim() || !newCaseId}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
