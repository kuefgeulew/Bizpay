/**
 * SYSTEM CURRENCY CONSTANT
 * ──────────────────────────────────────────────────────────────
 * BizPay is a BDT-only Operating Cash OS. Any non-BDT currency
 * is a system violation. This file is the SINGLE authoritative
 * source for currency identity and formatting.
 *
 * ASSERTION: No function in this system accepts a currency
 * parameter. No mock data contains a currency field. No UI
 * implies currency choice. Violating this is a governance
 * breach.
 * ──────────────────────────────────────────────────────────────
 */

/** The only currency the system recognises */
export const SYSTEM_CURRENCY = "BDT" as const;

/** Display symbol — always prefixed to amounts */
export const CURRENCY_SYMBOL = "৳" as const;

/**
 * Canonical BDT amount formatter.
 * Always returns "৳X,XX,XXX" using the South Asian (en-IN) grouping.
 *
 * @param amount - numeric amount in BDT (integer or decimal)
 * @returns formatted string, e.g. "৳4,80,000"
 *
 * ❌ This function intentionally does NOT accept a currency parameter.
 * ❌ This function intentionally does NOT branch on any currency code.
 */
export function formatBDT(amount: number): string {
  if (amount === 0) return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN")}`;
}

/**
 * Compact BDT formatter — uses Lakh/Crore suffixes for large values.
 *
 * @param amount - numeric amount in BDT
 * @returns e.g. "৳4.8L", "৳1.2Cr", or "৳85,000" for smaller amounts
 */
export function formatBDTCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 10_000_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 10_000_000).toFixed(1)}Cr`;
  }
  if (abs >= 100_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 100_000).toFixed(1)}L`;
  }
  if (abs >= 1_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}${CURRENCY_SYMBOL}${abs.toLocaleString("en-IN")}`;
}
