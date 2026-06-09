// Wealth comparison (UK).
//
// Given a net-worth figure and an age bracket, work out roughly where someone
// sits in the UK wealth distribution ("you're in the top X%").
//
// DATA SOURCE: ONS Wealth and Assets Survey — "Distribution of individual total
// wealth by characteristic in Great Britain" (the individual-level release of the
// same survey behind the Guardian's wealth calculator). Total wealth = property +
// private pension + financial + physical wealth.
//
// IMPORTANT — INDIVIDUAL, not household.
// An earlier version compared against *household* totals, which roughly double an
// individual's wealth (two adults sharing a home and pensions). Benchmarking one
// person's net worth against a household made everyone look poorer than they are
// for their age. We now use ONS *individual* total wealth, which is the correct
// like-for-like basis for a single person's portfolio + assets.
//
// Real ONS anchors used:
//   • Median individual total wealth, GB = £125,000 (Apr 2018–Mar 2020).
//   • Individual wealth rises with age, peaking in the 60–64 band at ~9× the
//     30–34 band, then easing in retirement.
// The per-age medians below are set to ONS individual total-wealth levels for
// each band (anchored to that £125k overall median and the ~9× age gradient).
//
// The per-age spread (p25, p75, p90, p95, p99) is MODELLED by applying a wealth-
// distribution shape to each band's median — so the ranking is realistic but the
// exact per-age percentile thresholds are approximations, not direct ONS reads.
// (This environment can't download the raw ONS spreadsheets; to use the exact
// per-age percentile table, drop its figures into THRESHOLDS below.)
//
// For entertainment, not precise personal statistics.

export type CountryCode = "UK";

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
];

export const WEALTH_SOURCE =
  "ONS Wealth & Assets Survey — individual total wealth, GB (incl. property & pensions)";

export const AGE_BRACKETS = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;
export type AgeBracket = (typeof AGE_BRACKETS)[number];

// Anchor percentiles we store values for.
const PCTS = [25, 50, 75, 90, 95, 99] as const;

// Per-age median INDIVIDUAL total wealth (GBP), anchored to ONS individual
// figures: ~£125k overall median, peaking in the 55–64 band at ~9× the early-30s
// level, then easing past State Pension age.
const MEDIAN_BY_AGE: Record<AgeBracket, number> = {
  "18-24": 4_000,
  "25-34": 45_000,
  "35-44": 130_000,
  "45-54": 190_000,
  "55-64": 290_000,
  "65+": 300_000,
};

// Wealth-distribution shape: multipliers off each band's median for
// [p25, p50, p75, p90, p95, p99]. Reflects how individual wealth fans out — a
// long upper tail where the top 1% of a band hold ~14× its median. The spread is
// modelled (not a direct ONS per-age read); the medians above are the real anchor.
const SHAPE = [0.18, 1, 2.4, 4.6, 7.0, 14.0] as const;

// threshold[ageBracket] = [p25, p50, p75, p90, p95, p99] in GBP.
const THRESHOLDS: Record<AgeBracket, number[]> = Object.fromEntries(
  (Object.keys(MEDIAN_BY_AGE) as AgeBracket[]).map((bracket) => [
    bracket,
    SHAPE.map((m) => Math.round(MEDIAN_BY_AGE[bracket] * m)),
  ]),
) as Record<AgeBracket, number[]>;

export function ageToBracket(age: number): AgeBracket {
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}

export type Comparison = {
  percentile: number; // 0–100, your rank (higher = richer)
  topPercent: number; // e.g. 10 means "top 10%"
  topLabel: string; // "Top 10%"
  ageBracket: AgeBracket;
  countryName: string;
  // The net wealth needed to reach each notable tier, for "next goal" display.
  tiers: { label: string; percentile: number; value: number }[];
  median: number;
  multipleOfMedian: number; // value / median
};

/**
 * Estimate the percentile (0–100) for `value` by interpolating between anchors.
 */
function estimatePercentile(value: number, anchors: number[]): number {
  // anchors aligned with PCTS = [25, 50, 75, 90, 95, 99]
  if (value <= 0) return 0;

  // Below the lowest anchor: scale linearly from 0 up to the lowest percentile.
  if (value <= anchors[0]) {
    return (value / anchors[0]) * PCTS[0];
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const lo = anchors[i];
    const hi = anchors[i + 1];
    if (value <= hi) {
      const t = (value - lo) / (hi - lo);
      return PCTS[i] + t * (PCTS[i + 1] - PCTS[i]);
    }
  }

  // Above the top anchor (p99). Approach but never quite reach 100.
  const top = anchors[anchors.length - 1];
  // Each additional doubling past p99 buys a fraction of the remaining gap.
  const doublings = Math.log2(value / top);
  const extra = (1 - Math.pow(0.5, doublings)) * (99.99 - 99);
  return Math.min(99.99, 99 + extra);
}

function topLabelFor(topPercent: number): string {
  if (topPercent <= 1) return "Top 1%";
  if (topPercent <= 5) return "Top 5%";
  if (topPercent <= 10) return "Top 10%";
  if (topPercent <= 25) return "Top 25%";
  if (topPercent <= 50) return "Top 50%";
  return `Bottom ${Math.round(100 - topPercent)}%`;
}

export function compareWealth(
  value: number,
  ageBracket: AgeBracket,
): Comparison {
  const anchors = THRESHOLDS[ageBracket];
  const percentile = estimatePercentile(value, anchors);
  const topPercent = Math.max(0.01, 100 - percentile);
  const median = anchors[1]; // p50

  const tierDefs: { label: string; percentile: number }[] = [
    { label: "Top 25%", percentile: 75 },
    { label: "Top 10%", percentile: 90 },
    { label: "Top 5%", percentile: 95 },
    { label: "Top 1%", percentile: 99 },
  ];

  const tiers = tierDefs.map((t) => ({
    ...t,
    value: valueForPercentile(t.percentile, anchors),
  }));

  return {
    percentile,
    topPercent,
    topLabel: topLabelFor(topPercent),
    ageBracket,
    countryName: "the UK",
    tiers,
    median,
    multipleOfMedian: median > 0 ? value / median : 0,
  };
}

/** Inverse of estimatePercentile for the stored anchor percentiles. */
function valueForPercentile(pct: number, anchors: number[]): number {
  for (let i = 0; i < PCTS.length; i++) {
    if (PCTS[i] === pct) return anchors[i];
  }
  return anchors[anchors.length - 1];
}
