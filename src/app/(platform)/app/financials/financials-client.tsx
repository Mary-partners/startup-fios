// ============================================================
// Financials Client  -  Data entry forms and period table
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES, REVENUE_SOURCES, MONTHS } from "@/lib/utils/constants";

interface Period {
  id: string;
  year: number;
  month: number;
  totalRevenue: string | null;
  totalExpenses: string | null;
  totalCogs: string | null;
  netIncome: string | null;
  isFinalized: boolean;
  cashBalance: { closingBalance: string } | null;
}

interface QuickEntryForm {
  year: string;
  month: string;
  totalRevenue: string;
  totalExpenses: string;
  cashBalance: string;
  cogs: string;
  largestCustomerShare: string;
}

interface DetailedRevenueRow {
  source: string;
  amount: string;
  isRecurring: boolean;
  customerName: string;
}

interface DetailedExpenseRow {
  category: string;
  description: string;
  amount: string;
  isFixed: boolean;
}

export function FinancialsClient({
  periods,
  companyId,
}: {
  periods: Period[];
  companyId: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"quick" | "detailed">("quick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const now = new Date();
  const [quickForm, setQuickForm] = useState<QuickEntryForm>({
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
    totalRevenue: "",
    totalExpenses: "",
    cashBalance: "",
    cogs: "",
    largestCustomerShare: "",
  });

  const [revenueRows, setRevenueRows] = useState<DetailedRevenueRow[]>([
    { source: "SaaS MRR", amount: "", isRecurring: true, customerName: "" },
  ]);
  const [expenseRows, setExpenseRows] = useState<DetailedExpenseRow[]>([
    { category: "Payroll & Benefits", description: "", amount: "", isFixed: true },
  ]);
  const [detailedCash, setDetailedCash] = useState({ opening: "", closing: "" });

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const totalRevenue = Number(quickForm.totalRevenue) || 0;
      const totalExpenses = Number(quickForm.totalExpenses) || 0;
      const cashBalance = Number(quickForm.cashBalance) || 0;
      const cogs = Number(quickForm.cogs) || 0;
      const concentration = (Number(quickForm.largestCustomerShare) || 0) / 100;

      const payload = {
        year: Number(quickForm.year),
        month: Number(quickForm.month),
        revenues: [
          { source: "Total Revenue", amount: totalRevenue, isRecurring: false },
        ],
        expenses: [
          { category: "Total Expenses", amount: totalExpenses, isFixed: false },
        ],
        cashBalance: {
          opening: cashBalance + (totalExpenses - totalRevenue),
          closing: cashBalance,
        },
        cogs: cogs > 0 ? cogs : undefined,
        largestCustomerShare: concentration > 0 ? concentration : undefined,
      };

      const res = await fetch("/api/financials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to save financial data");
        return;
      }

      setSuccess(
        `Financial data for ${MONTHS[Number(quickForm.month) - 1]} ${quickForm.year} saved successfully.`
      );
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        year: Number(quickForm.year),
        month: Number(quickForm.month),
        revenues: revenueRows
          .filter((r) => Number(r.amount) > 0)
          .map((r) => ({
            source: r.source,
            amount: Number(r.amount),
            isRecurring: r.isRecurring,
            customerName: r.customerName || undefined,
          })),
        expenses: expenseRows
          .filter((e) => Number(e.amount) > 0)
          .map((e) => ({
            category: e.category,
            description: e.description || undefined,
            amount: Number(e.amount),
            isFixed: e.isFixed,
          })),
        cashBalance: {
          opening: Number(detailedCash.opening) || 0,
          closing: Number(detailedCash.closing) || 0,
        },
        cogs: Number(quickForm.cogs) || undefined,
        largestCustomerShare:
          Number(quickForm.largestCustomerShare) > 0
            ? Number(quickForm.largestCustomerShare) / 100
            : undefined,
      };

      const res = await fetch("/api/financials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to save");
        return;
      }

      setSuccess("Financial data saved successfully.");
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addRevenueRow = () => {
    setRevenueRows((prev) => [
      ...prev,
      { source: "", amount: "", isRecurring: false, customerName: "" },
    ]);
  };

  const addExpenseRow = () => {
    setExpenseRows((prev) => [
      ...prev,
      { category: "", description: "", amount: "", isFixed: false },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("quick")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "quick"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border"
          }`}
        >
          Quick Entry
        </button>
        <button
          onClick={() => setMode("detailed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "detailed"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border"
          }`}
        >
          Detailed Entry
        </button>
      </div>

      {/* Period Selector (shared between modes) */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Period</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Year
            </label>
            <select
              value={quickForm.year}
              onChange={(e) =>
                setQuickForm((f) => ({ ...f, year: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Month
            </label>
            <select
              value={quickForm.month}
              onChange={(e) =>
                setQuickForm((f) => ({ ...f, month: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Entry Form */}
      {mode === "quick" && (
        <form onSubmit={handleQuickSubmit} className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Entry</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <NumField
              label="Total Revenue ($)"
              value={quickForm.totalRevenue}
              onChange={(v) =>
                setQuickForm((f) => ({ ...f, totalRevenue: v }))
              }
              placeholder="33000"
              required
            />
            <NumField
              label="Total Expenses ($)"
              value={quickForm.totalExpenses}
              onChange={(v) =>
                setQuickForm((f) => ({ ...f, totalExpenses: v }))
              }
              placeholder="58000"
              required
            />
            <NumField
              label="Closing Cash Balance ($)"
              value={quickForm.cashBalance}
              onChange={(v) =>
                setQuickForm((f) => ({ ...f, cashBalance: v }))
              }
              placeholder="273000"
              required
            />
            <NumField
              label="Cost of Goods Sold ($)"
              value={quickForm.cogs}
              onChange={(v) => setQuickForm((f) => ({ ...f, cogs: v }))}
              placeholder="5500"
            />
            <NumField
              label="Largest Customer % of Revenue"
              value={quickForm.largestCustomerShare}
              onChange={(v) =>
                setQuickForm((f) => ({ ...f, largestCustomerShare: v }))
              }
              placeholder="25"
              suffix="%"
            />
          </div>
          {renderMessages()}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Financial Data"}
          </button>
        </form>
      )}

      {/* Detailed Entry Form */}
      {mode === "detailed" && (
        <form onSubmit={handleDetailedSubmit} className="space-y-6">
          {/* Revenue Lines */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Revenue</h2>
              <button
                type="button"
                onClick={addRevenueRow}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                + Add Row
              </button>
            </div>
            <div className="space-y-3">
              {revenueRows.map((row, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-4">
                  <select
                    value={row.source}
                    onChange={(e) => {
                      const next = [...revenueRows];
                      next[i].source = e.target.value;
                      setRevenueRows(next);
                    }}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Source...</option>
                    {REVENUE_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => {
                      const next = [...revenueRows];
                      next[i].amount = e.target.value;
                      setRevenueRows(next);
                    }}
                    placeholder="Amount"
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={row.customerName}
                    onChange={(e) => {
                      const next = [...revenueRows];
                      next[i].customerName = e.target.value;
                      setRevenueRows(next);
                    }}
                    placeholder="Customer (optional)"
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={row.isRecurring}
                      onChange={(e) => {
                        const next = [...revenueRows];
                        next[i].isRecurring = e.target.checked;
                        setRevenueRows(next);
                      }}
                    />
                    Recurring
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Lines */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Expenses</h2>
              <button
                type="button"
                onClick={addExpenseRow}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                + Add Row
              </button>
            </div>
            <div className="space-y-3">
              {expenseRows.map((row, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-4">
                  <select
                    value={row.category}
                    onChange={(e) => {
                      const next = [...expenseRows];
                      next[i].category = e.target.value;
                      setExpenseRows(next);
                    }}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Category...</option>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => {
                      const next = [...expenseRows];
                      next[i].amount = e.target.value;
                      setExpenseRows(next);
                    }}
                    placeholder="Amount"
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => {
                      const next = [...expenseRows];
                      next[i].description = e.target.value;
                      setExpenseRows(next);
                    }}
                    placeholder="Description (optional)"
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={row.isFixed}
                      onChange={(e) => {
                        const next = [...expenseRows];
                        next[i].isFixed = e.target.checked;
                        setExpenseRows(next);
                      }}
                    />
                    Fixed
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Balance */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Cash Balance</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <NumField
                label="Opening Balance ($)"
                value={detailedCash.opening}
                onChange={(v) =>
                  setDetailedCash((c) => ({ ...c, opening: v }))
                }
                placeholder="298000"
                required
              />
              <NumField
                label="Closing Balance ($)"
                value={detailedCash.closing}
                onChange={(v) =>
                  setDetailedCash((c) => ({ ...c, closing: v }))
                }
                placeholder="273000"
                required
              />
            </div>
          </div>

          {/* Additional */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Additional Data</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <NumField
                label="Cost of Goods Sold ($)"
                value={quickForm.cogs}
                onChange={(v) => setQuickForm((f) => ({ ...f, cogs: v }))}
                placeholder="5500"
              />
              <NumField
                label="Largest Customer % of Revenue"
                value={quickForm.largestCustomerShare}
                onChange={(v) =>
                  setQuickForm((f) => ({ ...f, largestCustomerShare: v }))
                }
                placeholder="25"
                suffix="%"
              />
            </div>
          </div>

          {renderMessages()}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Detailed Financial Data"}
          </button>
        </form>
      )}

      {/* Existing Periods Table */}
      {periods.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Saved Periods</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Expenses</th>
                <th className="px-4 py-3 text-right">COGS</th>
                <th className="px-4 py-3 text-right">Net Income</th>
                <th className="px-4 py-3 text-right">Cash</th>
                <th className="px-4 py-3 text-center">Finalized</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">
                    {MONTHS[p.month - 1]} {p.year}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    ${Number(p.totalRevenue ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    ${Number(p.totalExpenses ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${Number(p.totalCogs ?? 0).toLocaleString()}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      Number(p.netIncome ?? 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ${Number(p.netIncome ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    $
                    {Number(
                      p.cashBalance?.closingBalance ?? 0
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.isFinalized ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  function renderMessages() {
    return (
      <>
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            {success}
          </p>
        )}
      </>
    );
  }
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
  required,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
