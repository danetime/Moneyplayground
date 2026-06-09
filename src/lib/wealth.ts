// Wealth comparison (UK).
//
// Given a portfolio value and an age bracket, work out roughly where someone
// sits in the UK wealth distribution ("you're in the top X%").
//
// DATA SOURCE: ONS Wealth and Assets Survey — "Household total wealth in Great
// Britain, April 2020 to March 2022" (the latest release; the same survey behind
// the Guardian's wealth calculator). Total wealth = property + private pension +
// financial + physical wealth.
//
// Real anchors used:
//   • Median household total wealth by age band (ONS, by age of household head):
//       16–24 £15,200 · 25–34 £109,800 · 35–44 £209,600 · 45–54 £301,900 ·
//       55–64 £496,500 · 65–74 £502,500 · 75+ £373,100
//   • Overall GB distribution thresholds: 10th pct £16,500 · median £293,700 ·
//       top 10% £1,200,500 · top 1% £3,121,500
//
// Each age band's median is a real ONS figure. The other percentiles (p25, p75,
// p90, p95, p99) are modelled by applying the shape of the overall GB wealth
// distribution to each band's median — so the population-wide p50/p90/p99 match
// ONS exactly, while per-age spread is an approximation. For entertainment, not
// precise per-age statistics.
//
// NOTE: this compares your portfolio against TOTAL wealth (incl. home equity and
// pensions), so it's a stretch goal, not a like-for-like financial-assets check.

export type CountryCode = "UK";

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
];

export const WEALTH_SOURCE =
  "ONS Wealth & Assets Survey (Apr 2020–Mar 2022), total wealth incl. property & pensions";

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

// threshold[ageBracket] = [p25, p50, p75, p90, p95, p99] in GBP.
// p50 = real ONS median for the band; others = median × overall-distribution
// shape multipliers [0.24, 1, 2.2, 4.0875, 6.0, 10.628] (the p90 and p99
// multipliers reproduce ONS's £1,200,500 and £3,121,500 against the £293,700
// national median).
const THRESHOLDS: Record<AgeBracket, number[]> = {
  "18-24": [3_600, 15_200, 33_000, 62_000, 91_000, 162_000],
  "25-34": [26_000, 109_800, 242_000, 449_000, 659_000, 1_167_000],
  "35-44": [50_000, 209_600, 461_000, 857_000, 1_258_000, 2_227_000],
  "45-54": [72_000, 301_900, 664_000, 1_234_000, 1_811_000, 3_208_000],
  "55-64": [119_000, 496_500, 1_092_000, 2_029_000, 2_979_000, 5_277_000],
  "65+": [115_000, 480_000, 1_056_000, 1_962_000, 2_880_000, 5_101_000],
};

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
