// ============================================================
// Alerts Page — Refactored with AlertsList component + MetricCard
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import AlertsList, { type AlertItem } from "@/components/dashboard/alerts-list";
import MetricCard from "@/components/dashboard/metric-card";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "dismissed" | "all">("active");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) setAlerts(data.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId: string) => {
    const res = await fetch(`/api/alerts/${alertId}/dismiss`, { method: "PATCH" });
    const data = await res.json();
    if (data.success) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isDismissed: true } : a))
      );
    }
  };

  const handleDismissAll = async () => {
    const res = await fetch("/api/alerts/dismiss-all", { method: "PATCH" });
    const data = await res.json();
    if (data.success) {
      setAlerts((prev) => prev.map((a) => ({ ...a, isDismissed: true })));
    }
  };

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (filter === "active") return !a.isDismissed;
      if (filter === "dismissed") return a.isDismissed;
      return true;
    });
  }, [alerts, filter]);

  const activeCount = alerts.filter((a) => !a.isDismissed).length;
  const criticalCount = alerts.filter(
    (a) => !a.isDismissed && a.severity === "CRITICAL"
  ).length;
  const warningCount = alerts.filter(
    (a) => !a.isDismissed && (a.severity === "WARNING" || a.severity === "HIGH")
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Automated alerts based on your financial metrics and thresholds
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Active Alerts"
          value={activeCount}
          highlight={activeCount === 0 ? "success" : "default"}
        />
        <MetricCard
          title="Critical"
          value={criticalCount}
          highlight={criticalCount > 0 ? "danger" : "default"}
        />
        <MetricCard
          title="Warnings"
          value={warningCount}
          highlight={warningCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(["active", "dismissed", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
              filter === f
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f}
            {f === "active" && activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        ))}
      </div>

      {/* Shared AlertsList Component */}
      <AlertsList
        alerts={filtered}
        dismissable={filter === "active"}
        onDismiss={handleDismiss}
        onDismissAll={handleDismissAll}
        emptyMessage={
          filter === "active"
            ? "No active alerts — your financials look healthy!"
            : "No alerts to show"
        }
      />
    </div>
  );
}
