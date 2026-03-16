// ============================================================
// Individual Financial Metric Calculators
// Pure functions — no side effects, no DB access.
// ============================================================

/**
 * Gross Burn = Total monthly expenses (all cash out).
 * Does NOT subtract revenue.
 */
export function calcGrossBurn(monthlyExpenses: number): number {
  return Math.max(0, monthlyExpenses);
}

/**
 * Net Burn = Expenses - Revenue.
 * Positive = burning cash. Negative = cash-flow positive.
 */
export function calcNetBurn(
  monthlyExpenses: number,
  monthlyRevenue: number
): number {
  return monthlyExpenses - monthlyRevenue;
}

/**
 * Runway = Cash Balance / Net Burn (in months).
 * Returns Infinity if net burn <= 0 (cash-flow positive).
 * Returns 0 if cashBalance <= 0.
 */
export function calcRunway(cashBalance: number, netBurn: number): number {
  if (cashBalance <= 0) return 0;
  if (netBurn <= 0) return Infinity; // cash-flow positive
  return cashBalance / netBurn;
}

/**
 * Burn Multiple = Net Burn / Net New ARR.
 * Lower is better. Industry benchmarks:
 *   < 1x = excellent
 *   1-2x = good
 *   2-4x = concerning
 *   > 4x = poor
 * Returns null if no revenue growth (can't divide by zero).
 */
export function calcBurnMultiple(
  netBurn: number,
  monthlyRevenue: number,
  previousMonthRevenue: number
): number | null {
  const netNewRevenue = monthlyRevenue - previousMonthRevenue;
  if (netNewRevenue <= 0) return null; // No positive growth to evaluate
  if (netBurn <= 0) return 0; // Cash-flow positive = 0x burn multiple
  return netBurn / netNewRevenue;
}

/**
 * Month-over-month revenue growth rate.
 * Returns null if previous month was 0 (pre-revenue transition).
 */
export function calcRevenueGrowthRate(
  currentRevenue: number,
  previousRevenue: number
): number | null {
  if (previousRevenue === 0) {
    if (currentRevenue > 0) return 1; // 100% from zero = first revenue
    return null; // Still pre-revenue
  }
  return (currentRevenue - previousRevenue) / previousRevenue;
}

/**
 * Gross Margin = (Revenue - COGS) / Revenue.
 * Returns null if revenue is 0.
 */
export function calcGrossMargin(
  revenue: number,
  cogs: number
): number | null {
  if (revenue <= 0) return null;
  return (revenue - cogs) / revenue;
}

/**
 * Revenue Concentration Risk = share of largest customer.
 * 0 = perfectly distributed, 1 = single customer dependency.
 */
export function calcConcentrationRisk(largestCustomerShare: number): number {
  return Math.min(1, Math.max(0, largestCustomerShare));
}

/**
 * Adjusted burn after planned hires.
 */
export function calcAdjustedBurn(
  monthlyExpenses: number,
  plannedHiresImpact: number
): number {
  return monthlyExpenses + plannedHiresImpact;
}
