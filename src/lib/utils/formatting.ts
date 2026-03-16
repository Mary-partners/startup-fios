// ============================================================
// Formatting Utilities
// ============================================================

/**
 * Format a number as USD currency.
 */
export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a decimal as a percentage.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format runway in months, handling infinity.
 */
export function formatRunway(months: number): string {
  if (months >= 999 || months === Infinity) return "Cash-flow positive";
  if (months <= 0) return "0 months";
  return `${months.toFixed(1)} months`;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a period as "Jan 2026".
 */
export function formatPeriod(year: number, month: number): string {
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}
