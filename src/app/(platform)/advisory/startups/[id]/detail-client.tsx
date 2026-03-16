"use client";

// ============================================================
// Startup Detail — Client interactive sections
// Enhanced with task creation, assignee display, private notes
// ============================================================

"use client";

import { useState } from "react";
import AlertsList, {
  type AlertItem,
} from "@/components/dashboard/alerts-list";
import AdvisoryTaskList, {
  type AdvisoryTaskItem,
} from "@/components/advisory/advisory-task-list";

interface NoteItem {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Props {
  caseId: string;
  companyId: string;
  alerts: AlertItem[];
  tasks: AdvisoryTaskItem[];
  notes: NoteItem[];
}

export default function StartupDetailClient({
  caseId,
  companyId,
  alerts,
  tasks: initialTasks,
  notes,
}: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [noteText, setNoteText] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [notesList, setNotesList] = useState(notes);

  // Quick task creation
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState("MEDIUM");
  const [quickDueDate, setQuickDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<"alerts" | "tasks">("tasks");

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

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/advisory/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteText,
          isPrivate: isPrivateNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotesList((prev) => [
          {
            id: data.data.id,
            content: data.data.content,
            authorName: data.data.authorName ?? "You",
            createdAt: data.data.createdAt,
          },
          ...prev,
        ]);
        setNoteText("");
        setIsPrivateNote(false);
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleQuickTask = async () => {
    if (!quickTitle.trim()) return;
    setCreatingTask(true);
    try {
      const res = await fetch("/api/advisory/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle,
          priority: quickPriority,
          dueDate: quickDueDate || null,
          advisoryCaseId: caseId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [
          {
            id: data.data.id,
            title: data.data.title,
            description: data.data.description,
            status: "OPEN",
            priority: quickPriority,
            dueDate: quickDueDate || null,
            assignedTo:
              data.data.assignedTo?.name ??
              data.data.assignedTo?.email ??
              null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setQuickTitle("");
        setQuickPriority("MEDIUM");
        setQuickDueDate("");
        setShowQuickTask(false);
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setCreatingTask(false);
    }
  };

  const openTaskCount = tasks.filter((t) => t.status !== "COMPLETE").length;
  const alertCount = alerts.length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Alerts + Tasks */}
      <div className="space-y-6 lg:col-span-2">
        {/* Tab Header */}
        <div className="flex items-center gap-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === "tasks"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Tasks
            {openTaskCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-bold text-blue-700">
                {openTaskCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === "alerts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Alerts
            {alertCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-bold text-red-700">
                {alertCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "tasks" && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Tasks ({openTaskCount} open)
              </h2>
              <button
                onClick={() => setShowQuickTask(!showQuickTask)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                + Quick Task
              </button>
            </div>

            {/* Quick Task Form */}
            {showQuickTask && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Task title..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleQuickTask()
                    }
                  />
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <input
                    type="date"
                    value={quickDueDate}
                    onChange={(e) => setQuickDueDate(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={handleQuickTask}
                    disabled={creatingTask || !quickTitle.trim()}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {creatingTask ? "..." : "Add"}
                  </button>
                </div>
              </div>
            )}

            <AdvisoryTaskList
              tasks={tasks}
              showCompany={false}
              onStatusChange={handleStatusChange}
              filterable={false}
              compact={tasks.length <= 6}
              emptyMessage="No tasks yet — use Quick Task above to create one."
            />
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Active Alerts ({alertCount})
            </h2>
            <AlertsList
              alerts={alerts}
              dismissable={false}
              emptyMessage="No active alerts — this startup's metrics look healthy."
            />
          </div>
        )}
      </div>

      {/* Right: Notes */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Advisory Notes
        </h2>

        {/* Add Note */}
        <div className="mb-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note about this startup..."
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivateNote}
                onChange={(e) => setIsPrivateNote(e.target.checked)}
                className="rounded border-slate-300"
              />
              Private note (advisors only)
            </label>
            <button
              onClick={handleAddNote}
              disabled={addingNote || !noteText.trim()}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {addingNote ? "Adding..." : "Add Note"}
            </button>
          </div>
        </div>

        {/* Notes List */}
        {notesList.length === 0 ? (
          <p className="text-sm text-slate-400">No notes yet.</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {notesList.map((note) => {
              const date = new Date(note.createdAt);
              const isToday =
                date.toDateString() === new Date().toDateString();
              const timeStr = isToday
                ? `Today at ${date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year:
                      date.getFullYear() !== new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                  }) +
                  ` at ${date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`;

              return (
                <div
                  key={note.id}
                  className="border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      {note.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {timeStr}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
