// Wealth comparison (UK).
//
// Given a portfolio value and an age bracket, work out roughly where someone
// sits in the UK wealth distribution ("you're in the top X%").
//
// The figures below are APPROXIMATE total net-wealth percentiles per adult in
// GBP, inspired by the ONS Wealth and Assets Survey (the same data behind the
// Guardian's "how rich are you" calculator). They are for entertainment, not
// precise statistics — kept in one place so they're easy to refine or swap for
// a real data source.
//
// Each bracket maps a percentile (0–100, where 100 = richest) to a net-wealth
// threshold in GBP. We interpolate between anchors to estimate a percentile.

export type CountryCode = "UK";

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
];

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
const THRESHOLDS: Record<AgeBracket, number[]> = {
  "18-24": [1_000, 8_000, 26_000, 70_000, 120_000, 300_000],
  "25-34": [4_000, 30_000, 90_000, 210_000, 350_000, 850_000],
  "35-44": [12_000, 110_000, 300_000, 620_000, 980_000, 2_500_000],
  "45-54": [25_000, 200_000, 540_000, 1_050_000, 1_700_000, 4_800_000],
  "55-64": [40_000, 300_000, 800_000, 1_550_000, 2_500_000, 7_000_000],
  "65+": [50_000, 330_000, 880_000, 1_700_000, 2_900_000, 8_000_000],
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
