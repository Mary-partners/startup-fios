// ============================================================
// MetricCard — Reusable metric display card for dashboards
// ============================================================

"use client";

import { ReactNode } from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
  badge?: {
    text: string;
    color: "green" | "yellow" | "orange" | "red" | "blue" | "slate";
  };
  icon?: ReactNode;
  highlight?: "success" | "warning" | "danger" | "info" | "default";
  footer?: ReactNode;
  onClick?: () => void;
}

const HIGHLIGHT_STYLES: Record<string, string> = {
  success: "border-green-200 bg-green-50",
  warning: "border-yellow-200 bg-yellow-50",
  danger: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
  default: "border-slate-200 bg-white",
};

const BADGE_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-700",
};

const TREND_ICONS: Record<string, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const TREND_COLORS: Record<string, string> = {
  up: "text-green-600",
  down: "text-red-600",
  flat: "text-slate-500",
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  badge,
  icon,
  highlight = "default",
  footer,
  onClick,
}: MetricCardProps) {
  const baseClasses = `rounded-xl border p-5 shadow-sm transition ${
    HIGHLIGHT_STYLES[highlight]
  } ${onClick ? "cursor-pointer hover:shadow-md" : ""}`;

  return (
    <div className={baseClasses} onClick={onClick} role={onClick ? "button" : undefined}>
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
        {badge && (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              BADGE_COLORS[badge.color]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

      {/* Subtitle + Trend */}
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={`text-sm font-medium ${TREND_COLORS[trend.direction]}`}>
              {TREND_ICONS[trend.direction]} {trend.label}
            </span>
          )}
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>
      )}

      {/* Footer */}
      {footer && <div className="mt-3 border-t border-slate-100 pt-3">{footer}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Convenience presets for common metric cards
// ──────────────────────────────────────────────

export function RunwayCard({ months }: { months: number | null }) {
  const val =
    months === null
      ? "—"
      : months >= 999 || months === Infinity
      ? "∞"
      : `${months.toFixed(1)}mo`;
  const hl =
    months === null
      ? "default"
      : months >= 18
      ? "success"
      : months >= 6
      ? "warning"
      : "danger";

  return (
    <MetricCard
      title="Runway"
      value={val}
      subtitle={months !== null && months < Infinity ? "months of cash remaining" : undefined}
      highlight={hl as MetricCardProps["highlight"]}
    />
  );
}

export function ScoreCard({
  title,
  score,
  grade,
  maxScore = 100,
}: {
  title: string;
  score: number | null;
  grade?: string;
  maxScore?: number;
}) {
  const pct = score !== null ? Math.round((score / maxScore) * 100) : 0;
  const hl =
    score === null
      ? "default"
      : pct >= 70
      ? "success"
      : pct >= 40
      ? "warning"
      : "danger";

  return (
    <MetricCard
      title={title}
      value={score !== null ? `${Math.round(score)}` : "—"}
      subtitle={`out of ${maxScore}`}
      badge={grade ? { text: grade, color: pct >= 70 ? "green" : pct >= 40 ? "yellow" : "red" } : undefined}
      highlight={hl as MetricCardProps["highlight"]}
      footer={
        score !== null ? (
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full transition-all ${
                pct >= 70
                  ? "bg-green-500"
                  : pct >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : undefined
      }
    />
  );
}
