"use client";

// ============================================================
// PeriodForm — Quick financial period entry form
// Used in the financials page for adding a new month
// ============================================================

"use client";

import { useState } from "react";
import { MONTHS } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/formatting";

export interface PeriodFormData {
  year: number;
  month: number;
  totalRevenue: number;
  totalExpenses: number;
  cashBalance: number;
  cogs: number;
  largestCustomerShare: number; // 0-100 (percentage)
}

interface PeriodFormProps {
  onSubmit: (data: PeriodFormData) => Promise<void>;
  loading?: boolean;
  initialYear?: number;
  initialMonth?: number;
}

export default function PeriodForm({
  onSubmit,
  loading = false,
  initialYear,
  initialMonth,
}: PeriodFormProps) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [cogs, setCogs] = useState(0);
  const [largestCustomerShare, setLargestCustomerShare] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totalRevenue === 0 && totalExpenses === 0 && cashBalance === 0) {
      setError("Please enter at least one financial figure");
      return;
    }

    try {
      await onSubmit({
        year,
        month,
        totalRevenue,
        totalExpenses,
        cashBalance,
        cogs,
        largestCustomerShare,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save period");
    }
  };

  const netBurn = totalExpenses - totalRevenue;
  const runway =
    netBurn > 0 ? cashBalance / netBurn : cashBalance > 0 ? Infinity : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Period selector */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={2000}
            max={2100}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Financial figures */}
      <div className="grid gap-4 md:grid-cols-2">
        <NumberField label="Total Revenue" value={totalRevenue} onChange={setTotalRevenue} prefix="$" />
        <NumberField label="Total Expenses" value={totalExpenses} onChange={setTotalExpenses} prefix="$" />
        <NumberField label="Cash Balance" value={cashBalance} onChange={setCashBalance} prefix="$" />
        <NumberField label="Cost of Goods Sold" value={cogs} onChange={setCogs} prefix="$" />
        <NumberField
          label="Largest Customer %"
          value={largestCustomerShare}
          onChange={setLargestCustomerShare}
          suffix="%"
          max={100}
        />
      </div>

      {/* Quick preview */}
      {(totalRevenue > 0 || totalExpenses > 0) && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Quick Preview</p>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Net Burn:</span>{" "}
              <span className={netBurn > 0 ? "font-medium text-red-600" : "font-medium text-green-600"}>
                {formatCurrency(Math.abs(netBurn))}
                {netBurn <= 0 ? " (profitable)" : "/mo"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Runway:</span>{" "}
              <span className="font-medium">
                {runway === Infinity ? "∞" : `${runway.toFixed(1)} months`}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Gross Margin:</span>{" "}
              <span className="font-medium">
                {totalRevenue > 0
                  ? `${(((totalRevenue - cogs) / totalRevenue) * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Saving..." : `Save ${MONTHS[month - 1]} ${year}`}
      </button>
    </form>
  );
}

// ── Helper number input ────────────────────────────────────
function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative mt-1">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={0}
          max={max}
          className={`w-full rounded-lg border border-slate-200 py-2 text-sm ${
            prefix ? "pl-7 pr-3" : suffix ? "pl-3 pr-7" : "px-3"
          }`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
