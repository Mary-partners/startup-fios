"use client";

// ============================================================
// Net Burn Chart  -  Bar chart showing burn trend with zero line
// ============================================================

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { MonthlySnapshot } from "@/types/domain";
import { formatCurrency } from "@/lib/utils/formatting";

interface Props {
  data: MonthlySnapshot[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-slate-700">{label}</p>
      <p className="text-xs">
        <span className={val > 0 ? "text-red-600" : "text-green-600"}>
          {val > 0 ? "Burning " : "Generating "}
          {formatCurrency(Math.abs(val))}
        </span>
        <span className="text-slate-400"> / month</span>
      </p>
    </div>
  );
}

export default function BurnChart({ data }: Props) {
  if (data.length < 2) return null;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => {
              const abs = Math.abs(v);
              return `${v < 0 ? "-" : ""}$${(abs / 1000).toFixed(0)}k`;
            }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="netBurn" name="Net Burn" radius={[4, 4, 0, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.netBurn > 0 ? "#ef4444" : "#22c55e"}
                opacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
