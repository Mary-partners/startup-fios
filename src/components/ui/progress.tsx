// ============================================================
// Progress  -  Bar progress indicator
// ============================================================

import { cn } from "@/lib/utils/cn";

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  barClassName?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "yellow" | "red" | "slate";
  showLabel?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const colorStyles: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  slate: "bg-slate-500",
};

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  size = "md",
  color = "blue",
  showLabel = false,
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-full rounded-full bg-slate-200", sizeStyles[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-300",
            sizeStyles[size],
            colorStyles[color],
            barClassName
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium text-slate-500">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
