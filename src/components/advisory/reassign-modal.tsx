"use client";

// ============================================================
// ReassignModal - Modal dialog for reassigning a case to a new advisor
// Fetches team members and allows selection
// ============================================================

import { useState, useEffect } from "react";
import { X, Loader2, UserCog, AlertCircle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface ReassignModalProps {
  caseId: string;
  currentAdvisor?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onReassigned: () => void;
}

export function ReassignModal({
  caseId,
  currentAdvisor,
  isOpen,
  onClose,
  onReassigned,
}: ReassignModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setSelectedAdvisorId("");

    async function fetchTeam() {
      try {
        const res = await fetch("/api/advisory/team");
        if (!res.ok) throw new Error("Failed to load team members");
        const data = await res.json();
        setTeamMembers(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [isOpen]);

  async function handleReassign() {
    if (!selectedAdvisorId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/advisory/cases/${caseId}/reassign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorId: selectedAdvisorId }),
      });
      if (!res.ok) throw new Error("Failed to reassign case");
      onReassigned();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl border bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <UserCog className="h-5 w-5" />
            Reassign Case
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current advisor */}
        {currentAdvisor && (
          <p className="mt-3 text-sm text-gray-600">
            Currently assigned to:{" "}
            <span className="font-medium text-gray-900">{currentAdvisor}</span>
          </p>
        )}

        {/* Content */}
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2 text-sm">Loading team...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          ) : (
            <>
              <label
                htmlFor="advisor-select"
                className="block text-sm font-medium text-gray-700"
              >
                Select new advisor
              </label>
              <select
                id="advisor-select"
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose an advisor...</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {currentAdvisor && m.name === currentAdvisor
                      ? " (current)"
                      : ""}
                    {" "}
                    ({m.email})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            disabled={!selectedAdvisorId || submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Reassigning...
              </span>
            ) : (
              "Reassign"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
