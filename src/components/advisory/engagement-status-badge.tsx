"use client";

// ============================================================
// EngagementStatusBadge - Colored pill badge for engagement status
// Used across advisory engagement views
// ============================================================

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PROSPECT: { bg: "bg-gray-100", text: "text-gray-700", label: "Prospect" },
  ONBOARDING: { bg: "bg-amber-100", text: "text-amber-700", label: "Onboarding" },
  ACTIVE: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  PAUSED: { bg: "bg-orange-100", text: "text-orange-700", label: "Paused" },
  COMPLETED: { bg: "bg-blue-100", text: "text-blue-700", label: "Completed" },
  CHURNED: { bg: "bg-red-100", text: "text-red-700", label: "Churned" },
};

export function EngagementStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
