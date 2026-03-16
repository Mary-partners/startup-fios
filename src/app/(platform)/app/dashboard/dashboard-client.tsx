"use client";

// ============================================================
// Dashboard Client - Full interactive dashboard with charts,
// metric cards, alerts, and quick actions.
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import type { DashboardData } from "@/types/domain";
import MetricCard, { RunwayCard, ScoreCard } from "@/components/dashboard/metric-card";
import AlertsList from "@/components/dashboard/alerts-list";
import type { AlertItem } from "@/components/dashboard/alerts-list";
import { RevenueExpensesChart } from "@/components/charts";
import { CashRunwayChart } from "@/components/charts";
import { BurnChart } from "@/components/charts";
import { MarginChart } from "@/components/charts";
import { formatCurrency, formatPercent } from "@/lib/utils/formatting";

interface Props {
  data: DashboardData;
  hasData: boolean;
}

type ChartTab = "revenue" | "cash" | "burn" | "margin";

export function DashboardClient({ data, hasData }: Props) {
  const [activeChart, setActiveChart] = useState<ChartTab>("revenue");

  // ── Empty State ──
  if (!hasData) {
    return (
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">{data.companyName}</p>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-slate-700">
            No Financial Data Yet
          </h2>
          <p className="mb-6 mx-auto max-w-md text-slate-500">
            Enter your first month of financial data to see your dashboard
            come to life with survival scores, trend charts, and real-time alerts.
          </p>
          <Link
            href="/app/financials"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-500 transition"
          >
            Enter Financial Data
          </Link>
        </div>

        {/* Quick Actions even in empty state */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <QuickAction
            title="Run Survival Predictor"
            description="Get a free instant score without full financial data"
            href="/survival-predictor"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
          <QuickAction
            title="Import Data"
            description="Upload a CSV or connect your accounting software"
            href="/app/financials/import"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          />
          <QuickAction
            title="Take Readiness Assessment"
            description="Check your investor readiness score"
            href="/app/investor-readiness"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
        </div>
      </div>
    );
  }

  // ── Build alert items from AlertEvaluation[] ──
  const alertItems: AlertItem[] = data.activeAlerts.map((a, i) => ({
    id: `alert-${i}`,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    metric: a.metric,
    value: a.value,
    threshold: a.threshold,
  }));

  // ── Trend direction helpers ──
  const revenueDirection =
    data.revenueGrowth !== null
      ? data.revenueGrowth > 0.01
        ? "up" as const
        : data.revenueGrowth < -0.01
        ? "down" as const
        : "flat" as const
      : undefined;

  const burnDirection =
    data.monthlyTrend.length >= 2
      ? data.monthlyTrend[data.monthlyTrend.length - 1].netBurn <
        data.monthlyTrend[data.monthlyTrend.length - 2].netBurn
        ? "down" as const
        : "up" as const
      : undefined;

  const CHART_TABS: { key: ChartTab; label: string }[] = [
    { key: "revenue", label: "Revenue & Expenses" },
    { key: "cash", label: "Cash & Runway" },
    { key: "burn", label: "Net Burn" },
    { key: "margin", label: "Gross Margin" },
  ];

  const RISK_BANNER: Record<string, { bg: string; border: string; text: string; message: string }> = {
    CRITICAL: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      message: "Immediate attention required on runway and burn management.",
    },
    HIGH: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      message: "Key financial metrics need focused improvement.",
    },
    MODERATE: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      message: "Room for improvement. Review the recommendations below.",
    },
    LOW: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      message: "Healthy financial position. Stay disciplined.",
    },
    STRONG: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      message: "Excellent financial health. Continue execution.",
    },
  };

  const riskBanner = data.riskLevel ? RISK_BANNER[data.riskLevel] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            {data.companyName}
            {data.currentPeriodLabel && (
              <span className="ml-2 text-sm text-slate-400">
                Latest: {data.currentPeriodLabel}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/app/financials"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
        >
          Update Financials
        </Link>
      </div>

      {/* Risk Level Banner */}
      {riskBanner && (
        <div className={`rounded-lg border p-4 ${riskBanner.bg} ${riskBanner.border}`}>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${riskBanner.text} ${riskBanner.bg}`}>
              {data.riskLevel}
            </span>
            <span className={`text-sm ${riskBanner.text}`}>
              {riskBanner.message}
            </span>
          </div>
        </div>
      )}

      {/* ── Primary Metric Cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Runway */}
        <RunwayCard months={data.runway} />

        {/* Monthly Burn */}
        <MetricCard
          title="Monthly Net Burn"
          value={
            data.burnRate !== null
              ? data.burnRate <= 0
                ? formatCurrency(Math.abs(data.burnRate))
                : formatCurrency(data.burnRate)
              : "-"
          }
          subtitle={data.burnRate !== null ? (data.burnRate <= 0 ? "cash-flow positive" : "per month") : undefined}
          highlight={
            data.burnRate === null
              ? "default"
              : data.burnRate <= 0
              ? "success"
              : data.burnRate > (data.revenue ?? 0) * 2
              ? "danger"
              : "warning"
          }
          trend={
            burnDirection
              ? {
                  direction: burnDirection,
                  label: burnDirection === "down" ? "Improving" : "Increasing",
                }
              : undefined
          }
        />

        {/* Revenue */}
        <MetricCard
          title="Monthly Revenue"
          value={data.revenue !== null ? formatCurrency(data.revenue) : "-"}
          trend={
            revenueDirection && data.revenueGrowth !== null
              ? {
                  direction: revenueDirection,
                  label: formatPercent(data.revenueGrowth) + " MoM",
                }
              : undefined
          }
        />

        {/* Cash Balance */}
        <MetricCard
          title="Cash Balance"
          value={data.cashBalance !== null ? formatCurrency(data.cashBalance) : "-"}
          subtitle={data.runway !== null && data.runway < 999 ? `${data.runway.toFixed(1)} months runway` : undefined}
        />
      </div>

      {/* ── Score Cards Row ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          title="Survival Score"
          score={data.survivalScore}
          grade={data.riskLevel ?? undefined}
        />
        <ScoreCard
          title="Financial Health"
          score={data.healthScore}
          grade={data.healthGrade ?? undefined}
        />
        <ScoreCard
          title="Investor Readiness"
          score={data.readinessScore}
          grade={data.readinessLevel ?? undefined}
        />
      </div>

      {/* ── Gross Margin & Expenses Row ── */}
      <div className="grid gap-3 md:grid-cols-2">
        <MetricCard
          title="Gross Margin"
          value={data.grossMargin !== null ? formatPercent(data.grossMargin) : "-"}
          subtitle={
            data.grossMargin !== null
              ? data.grossMargin >= 0.6
                ? "Healthy SaaS margin"
                : data.grossMargin >= 0.4
                ? "Below target. Aim for 60%+"
                : "Needs improvement"
              : undefined
          }
          highlight={
            data.grossMargin === null
              ? "default"
              : data.grossMargin >= 0.6
              ? "success"
              : data.grossMargin >= 0.4
              ? "warning"
              : "danger"
          }
        />
        <MetricCard
          title="Monthly Expenses"
          value={data.expenses !== null ? formatCurrency(data.expenses) : "-"}
          subtitle={
            data.revenue !== null && data.expenses !== null && data.revenue > 0
              ? `${((data.expenses / data.revenue) * 100).toFixed(0)}% of revenue`
              : undefined
          }
        />
      </div>

      {/* ── Charts Section ── */}
      {data.monthlyTrend.length >= 2 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200">
            {CHART_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveChart(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeChart === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart body */}
          <div className="p-5">
            {activeChart === "revenue" && (
              <RevenueExpensesChart data={data.monthlyTrend} />
            )}
            {activeChart === "cash" && (
              <CashRunwayChart data={data.monthlyTrend} />
            )}
            {activeChart === "burn" && (
              <BurnChart data={data.monthlyTrend} />
            )}
            {activeChart === "margin" && (
              <MarginChart data={data.monthlyTrend} />
            )}
          </div>
        </div>
      )}

      {/* ── Monthly Trend Table ── */}
      {data.monthlyTrend.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Period-over-Period
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Period</th>
                  <th className="pb-2 pr-4 text-right font-medium">Revenue</th>
                  <th className="pb-2 pr-4 text-right font-medium">Expenses</th>
                  <th className="pb-2 pr-4 text-right font-medium">Net Burn</th>
                  <th className="pb-2 pr-4 text-right font-medium">Cash</th>
                  <th className="pb-2 pr-4 text-right font-medium">Margin</th>
                  <th className="pb-2 text-right font-medium">Runway</th>
                </tr>
              </thead>
              <tbody>
                {[...data.monthlyTrend].reverse().map((m) => (
                  <tr
                    key={`${m.year}-${m.month}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-medium text-slate-700">
                      {m.label}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-green-600">
                      {formatCurrency(m.revenue)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-red-600">
                      {formatCurrency(m.expenses)}
                    </td>
                    <td
                      className={`py-2.5 pr-4 text-right ${
                        m.netBurn > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.netBurn > 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(m.netBurn))}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium text-slate-800">
                      {formatCurrency(m.cashBalance)}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      {m.grossMargin !== null
                        ? formatPercent(m.grossMargin)
                        : "-"}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={
                          m.runway >= 999
                            ? "text-green-600"
                            : m.runway < 6
                            ? "text-red-600 font-semibold"
                            : "text-slate-700"
                        }
                      >
                        {m.runway >= 999
                          ? "∞"
                          : `${m.runway.toFixed(1)}mo`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Alerts ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Active Alerts
            {alertItems.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {alertItems.length}
              </span>
            )}
          </h2>
          {alertItems.length > 0 && (
            <Link
              href="/app/alerts"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
            </Link>
          )}
        </div>
        <AlertsList
          alerts={alertItems}
          maxVisible={5}
          emptyMessage="All clear. No active alerts right now."
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickAction
          title="Enter Financial Data"
          description="Add or update monthly financials"
          href="/app/financials"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <QuickAction
          title="Generate Report"
          description="Monthly summary or board pack"
          href="/app/reports"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <QuickAction
          title="Health Score"
          description="View detailed financial health"
          href="/app/health-score"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
        <QuickAction
          title="Investor Readiness"
          description="Assessment and improvement plan"
          href="/app/investor-readiness"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ── Shared Quick Action Card ──

function QuickAction({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition group-hover:bg-blue-100">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}
