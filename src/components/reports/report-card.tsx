// ============================================================
// ReportCard — Display card for a generated report
// ============================================================

"use client";

import { formatDate } from "@/lib/utils/formatting";

export interface ReportCardData {
  id: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportCardProps {
  report: ReportCardData;
  onView?: (id: string) => void;
  onRetry?: (id: string) => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  MONTHLY_SUMMARY: { label: "Monthly Summary", icon: "📊" },
  BOARD_PACK: { label: "Board Pack", icon: "📋" },
  INVESTOR_UPDATE: { label: "Investor Update", icon: "📈" },
  HEALTH_ASSESSMENT: { label: "Health Assessment", icon: "🏥" },
  CUSTOM: { label: "Custom Report", icon: "📄" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  GENERATING: { bg: "bg-blue-100", text: "text-blue-700", label: "Generating..." },
  COMPLETE: { bg: "bg-green-100", text: "text-green-700", label: "Complete" },
  FAILED: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
};

export default function ReportCard({ report, onView, onRetry }: ReportCardProps) {
  const typeInfo = TYPE_LABELS[report.type] ?? TYPE_LABELS.CUSTOM;
  const statusInfo = STATUS_STYLES[report.status] ?? STATUS_STYLES.DRAFT;

  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeInfo.icon}</span>
        <div>
          <h3 className="font-medium text-slate-900">{report.title || typeInfo.label}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {typeInfo.label} — Created {formatDate(report.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
        >
          {statusInfo.label}
        </span>

        {report.status === "COMPLETE" && onView && (
          <button
            onClick={() => onView(report.id)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            View
          </button>
        )}

        {report.status === "FAILED" && onRetry && (
          <button
            onClick={() => onRetry(report.id)}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
