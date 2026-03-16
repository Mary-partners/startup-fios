// ============================================================
// ExpenseTable — Editable expense line items for detailed mode
// ============================================================

"use client";

import { EXPENSE_CATEGORIES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/formatting";

export interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  amount: number;
  isFixed: boolean;
}

interface ExpenseTableProps {
  rows: ExpenseRow[];
  onUpdate: (id: string, field: keyof ExpenseRow, value: string | number | boolean) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export default function ExpenseTable({
  rows,
  onUpdate,
  onAdd,
  onRemove,
  readOnly = false,
}: ExpenseTableProps) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const fixedTotal = rows.filter((r) => r.isFixed).reduce((sum, r) => sum + r.amount, 0);
  const variableTotal = total - fixedTotal;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Expense Lines</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Fixed: {formatCurrency(fixedTotal)}</span>
          <span>Variable: {formatCurrency(variableTotal)}</span>
          <span>Total: {formatCurrency(total)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-center">Fixed</th>
              {!readOnly && <th className="px-3 py-2 w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-2">
                  {readOnly ? (
                    row.category
                  ) : (
                    <select
                      value={row.category}
                      onChange={(e) => onUpdate(row.id, "category", e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                    >
                      <option value="">Select...</option>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    row.description || "—"
                  ) : (
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => onUpdate(row.id, "description", e.target.value)}
                      placeholder="Optional note"
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
                    checked={row.isFixed}
                    onChange={(e) => onUpdate(row.id, "isFixed", e.target.checked)}
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
          + Add Expense Line
        </button>
      )}
    </div>
  );
}
