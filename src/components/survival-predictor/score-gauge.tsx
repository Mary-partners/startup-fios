// ============================================================
// ScoreGauge — Circular SVG gauge for survival/health scores
// ============================================================

"use client";

interface ScoreGaugeProps {
  score: number; // 0-100
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreGauge({
  score,
  label = "Score",
  size = 180,
  strokeWidth = 12,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  const color =
    score >= 70
      ? "#22c55e" // green-500
      : score >= 40
      ? "#eab308" // yellow-500
      : "#ef4444"; // red-500

  const riskLabel =
    score >= 70
      ? "Low Risk"
      : score >= 40
      ? "Moderate Risk"
      : "High Risk";

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center text (overlaid) */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ marginTop: -size / 2 - 24, height: size }}
      >
        <span className="text-4xl font-bold" style={{ color }}>
          {Math.round(score)}
        </span>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>

      <span
        className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: `${color}20`,
          color,
        }}
      >
        {riskLabel}
      </span>
    </div>
  );
}
