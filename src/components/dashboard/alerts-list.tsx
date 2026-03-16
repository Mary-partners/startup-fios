"use client";

// ============================================================
// AlertsList — Reusable alert display component
// Used on Dashboard, Alerts page, and Advisory detail pages
// ============================================================

"use client";

import { useState } from "react";

export interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  metric?: string | null;
  value?: number | null;
  threshold?: number | null;
  isDismissed?: boolean;
  createdAt?: string;
}

export interface AlertsListProps {
  alerts: AlertItem[];
  /** Show dismiss buttons */
  dismissable?: boolean;
  /** Called when a single alert is dismissed */
  onDismiss?: (alertId: string) => void | Promise<void>;
  /** Called when "Dismiss All" is clicked */
  onDismissAll?: () => void | Promise<void>;
  /** Max alerts to show before "show more" */
  maxVisible?: number;
  /** Compact mode for sidebar/card usage */
  compact?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

const SEVERITY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; icon: string; sortOrder: number }
> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "🔴", sortOrder: 0 },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "🟠", sortOrder: 1 },
  WARNING: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "🟡", sortOrder: 2 },
  MEDIUM: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "🟡", sortOrder: 2 },
  LOW: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "🔵", sortOrder: 3 },
  INFO: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: "ℹ️", sortOrder: 4 },
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  LOW_RUNWAY: "Low Runway",
  HIGH_BURN: "High Burn Rate",
  LOW_MARGIN: "Low Gross Margin",
  POOR_GROWTH: "Negative Growth",
  HIGH_CONCENTRATION: "Concentration Risk",
  MISSING_DATA: "Missing Data",
  INCOMPLETE_READINESS: "Incomplete Readiness",
  CASH_DECLINING: "Cash Declining",
};

export default function AlertsList({
  alerts,
  dismissable = false,
  onDismiss,
  onDismissAll,
  maxVisible,
  compact = false,
  emptyMessage = "No alerts — your financials look healthy!",
}: AlertsListProps) {
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Sort by severity
  const sorted = [...alerts].sort((a, b) => {
    const aSev = SEVERITY_CONFIG[a.severity]?.sortOrder ?? 99;
    const bSev = SEVERITY_CONFIG[b.severity]?.sortOrder ?? 99;
    return aSev - bSev;
  });

  const visible =
    maxVisible && !showAll ? sorted.slice(0, maxVisible) : sorted;
  const hasMore = maxVisible ? sorted.length > maxVisible : false;

  const handleDismiss = async (alertId: string) => {
    if (!onDismiss) return;
    setDismissing(alertId);
    try {
      await onDismiss(alertId);
    } finally {
      setDismissing(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <div
        className={`text-center ${
          compact ? "py-4 text-sm" : "py-8 text-base"
        } text-slate-400`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Dismiss All Header */}
      {dismissable && onDismissAll && alerts.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={onDismissAll}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Dismiss All
          </button>
        </div>
      )}

      {/* Alert Items */}
      {visible.map((alert) => {
        const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.INFO;
        const dismissed = alert.isDismissed;

        return (
          <div
            key={alert.id}
            className={`rounded-lg border ${compact ? "p-3" : "p-4"} ${
              dismissed
                ? "border-slate-100 bg-slate-50 opacity-50"
                : `${config.border} ${config.bg}`
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {!compact && <span className="text-sm">{config.icon}</span>}
                  <span
                    className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${config.text} ${config.bg}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {ALERT_TYPE_LABELS[alert.type] ?? alert.type}
                  </span>
                </div>
                <p
                  className={`mt-1 font-semibold text-slate-900 ${
                    compact ? "text-sm" : "text-base"
                  }`}
                >
                  {alert.title}
                </p>
                {!compact && (
                  <p className="mt-0.5 text-sm text-slate-600">{alert.message}</p>
                )}
                {!compact && alert.metric && (
                  <div className="mt-1.5 flex gap-4 text-xs text-slate-500">
                    <span>
                      Metric: <strong>{alert.metric}</strong>
                    </span>
                    {alert.value != null && (
                      <span>
                        Value: <strong>{alert.value.toFixed(2)}</strong>
                      </span>
                    )}
                    {alert.threshold != null && (
                      <span>
                        Threshold: <strong>{alert.threshold.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                )}
                {alert.createdAt && !compact && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              {dismissable && !dismissed && onDismiss && (
                <button
                  onClick={() => handleDismiss(alert.id)}
                  disabled={dismissing === alert.id}
                  className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {dismissing === alert.id ? "..." : "Dismiss"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Show More */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-center text-xs font-medium text-slate-500 hover:bg-slate-50"
        >
          Show {sorted.length - (maxVisible ?? 0)} more alerts
        </button>
      )}
    </div>
  );
}
