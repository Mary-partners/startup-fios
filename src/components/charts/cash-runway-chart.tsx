"use client";

// ============================================================
// Cash Balance & Runway Chart — Dual axis: bar + line
// ============================================================

"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlySnapshot } from "@/types/domain";
import { formatCurrency } from "@/lib/utils/formatting";

interface Props {
  data: MonthlySnapshot[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-slate-700">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}:{" "}
          {entry.dataKey === "runway"
            ? entry.value >= 999
              ? "∞"
              : `${entry.value.toFixed(1)} mo`
            : formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function CashRunwayChart({ data }: Props) {
  if (data.length < 2) return null;

  // Cap runway at 36 for display purposes
  const chartData = data.map((d) => ({
    ...d,
    displayRunway: Math.min(d.runway, 36),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="cash"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <YAxis
            yAxisId="runway"
            orientation="right"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${v}mo`}
            axisLine={false}
            tickLine={false}
            width={45}
            domain={[0, "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            yAxisId="cash"
            dataKey="cashBalance"
            name="Cash Balance"
            fill="#3b82f6"
            opacity={0.7}
            radius={[4, 4, 0, 0]}
            barSize={28}
          />
          <Line
            yAxisId="runway"
            type="monotone"
            dataKey="displayRunway"
            name="Runway"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ fill: "#f59e0b", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
