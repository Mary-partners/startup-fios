// ============================================================
// RevenueTable - Editable revenue line items for detailed mode
// ============================================================

"use client";

import { REVENUE_SOURCES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/formatting";

export interface RevenueRow {
  id: string;
  source: string;
  amount: number;
  isRecurring: boolean;
  customerName: string;
}

interface RevenueTableProps {
  rows: RevenueRow[];
  onUpdate: (id: string, field: keyof RevenueRow, value: string | number | boolean) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export default function RevenueTable({
  rows,
  onUpdate,
  onAdd,
  onRemove,
  readOnly = false,
}: RevenueTableProps) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const recurringTotal = rows.filter((r) => r.isRecurring).reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Revenue Lines</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>MRR: {formatCurrency(recurringTotal)}</span>
          <span>Total: {formatCurrency(total)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-center">Recurring</th>
              {!readOnly && <th className="px-3 py-2 w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-2">
                  {readOnly ? (
                    row.source
                  ) : (
                    <select
                      value={row.source}
                      onChange={(e) => onUpdate(row.id, "source", e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                    >
                      <option value="">Select...</option>
                      {REVENUE_SOURCES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    row.customerName || "-"
                  ) : (
                    <input
                      type="text"
                      value={row.customerName}
                      onChange={(e) => onUpdate(row.id, "customerName", e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {readOnly ? (
                    formatCurrency(row.amount)
                  ) : (
                    <input
                      type="number"
                      value={row.amount || ""}
                      onChange={(e) => onUpdate(row.id, "amount", Number(e.target.value) || 0)}
                      min={0}
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-right text-sm"
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.isRecurring}
                    onChange={(e) => onUpdate(row.id, "isRecurring", e.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onRemove(row.id)}
                      className="text-slate-400 hover:text-red-500"
                      title="Remove"
                    >
                      x
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <button
          onClick={onAdd}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          + Add Revenue Line
        </button>
      )}
    </div>
  );
}
