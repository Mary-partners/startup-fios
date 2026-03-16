"use client";

// ============================================================
// Gross Margin Trend — Line chart with color-coded threshold
// ============================================================

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthlySnapshot } from "@/types/domain";

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
        Gross Margin:{" "}
        <span
          className={
            val === null ? "text-slate-400" : val >= 60 ? "text-green-600" : val >= 40 ? "text-yellow-600" : "text-red-600"
          }
        >
          {val !== null ? `${(val * 100).toFixed(1)}%` : "N/A"}
        </span>
      </p>
    </div>
  );
}

export default function MarginChart({ data }: Props) {
  // Filter to only periods with margin data
  const chartData = data
    .filter((d) => d.grossMargin !== null)
    .map((d) => ({
      ...d,
      marginPct: d.grossMargin !== null ? d.grossMargin * 100 : null,
    }));

  if (chartData.length < 2) return null;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            width={45}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Target zone: 60%+ for healthy SaaS margin */}
          <ReferenceLine
            y={60}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{
              value: "60% target",
              position: "insideTopRight",
              fontSize: 10,
              fill: "#22c55e",
            }}
          />
          <Line
            type="monotone"
            dataKey="marginPct"
            name="Gross Margin"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ fill: "#8b5cf6", r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
