// FX + currency formatting.
//
// The app displays everything in GBP. Live quotes come back in their native
// currency (USD for US stocks, GBp pence for many LSE stocks), so we convert
// to pounds for display. The USD→GBP rate is a fixed approximation — fine for
// a for-fun app; swap for a live FX feed if you ever need precision.

export const USD_TO_GBP = 0.79;

/** Convert an amount in `currency` to GBP. Unknown currencies are treated as USD. */
export function toGbp(amount: number, currency: string): number {
  switch (currency) {
    case "GBP":
      return amount;
    case "GBp": // London pence — 100 pence to the pound
      return amount / 100;
    case "EUR":
      return amount * 0.85;
    default: // USD and anything else
      return amount * USD_TO_GBP;
  }
}

export function formatGBP(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: Math.abs(value) < 1000 ? 2 : 0,
  }).format(value);
}
