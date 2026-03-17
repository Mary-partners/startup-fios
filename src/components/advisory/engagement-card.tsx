"use client";

// ============================================================
// EngagementCard - Summary card for an advisory engagement
// Used on dashboard grids and engagement list views
// ============================================================

import { Briefcase, Clock, ListTodo, CalendarCheck } from "lucide-react";
import { EngagementStatusBadge } from "./engagement-status-badge";

interface EngagementCardProps {
  caseId: string;
  companyName: string;
  engagementStatus: string;
  retainerAmount?: number | null;
  billingCadence?: string | null;
  servicePackageName?: string | null;
  assignedAdvisor?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  openTasks: number;
  upcomingDeliverables: number;
  onClick?: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function EngagementCard({
  caseId,
  companyName,
  engagementStatus,
  retainerAmount,
  billingCadence,
  servicePackageName,
  assignedAdvisor,
  contractStartDate,
  contractEndDate,
  estimatedHours,
  actualHours,
  openTasks,
  upcomingDeliverables,
  onClick,
}: EngagementCardProps) {
  const utilization =
    estimatedHours && estimatedHours > 0
      ? Math.round(((actualHours ?? 0) / estimatedHours) * 100)
      : null;

  const utilizationColor =
    utilization === null
      ? "bg-gray-200"
      : utilization > 100
        ? "bg-red-500"
        : utilization >= 80
          ? "bg-amber-500"
          : "bg-green-500";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-xl border bg-white p-6 shadow-sm transition-shadow ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {companyName}
          </h3>
          {servicePackageName && (
            <p className="mt-0.5 text-sm text-gray-500">{servicePackageName}</p>
          )}
        </div>
        <EngagementStatusBadge status={engagementStatus} />
      </div>

      {/* Retainer and advisor */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        {retainerAmount != null && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {formatCurrency(retainerAmount)}
            {billingCadence ? ` / ${billingCadence.toLowerCase()}` : ""}
          </span>
        )}
        {assignedAdvisor && (
          <span className="text-gray-500">Advisor: {assignedAdvisor}</span>
        )}
      </div>

      {/* Hours utilization */}
      {estimatedHours != null && estimatedHours > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Hours
            </span>
            <span>
              {actualHours ?? 0} / {estimatedHours}h
              {utilization !== null && ` (${utilization}%)`}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${utilizationColor}`}
              style={{ width: `${Math.min(utilization ?? 0, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer stats */}
      <div className="mt-4 flex items-center gap-4 border-t pt-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <ListTodo className="h-3.5 w-3.5" />
          {openTasks} open task{openTasks !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <CalendarCheck className="h-3.5 w-3.5" />
          {upcomingDeliverables} upcoming
        </span>
      </div>
    </div>
  );
}
