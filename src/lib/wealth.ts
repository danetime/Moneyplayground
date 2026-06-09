// Wealth comparison (UK).
//
// Given a net-worth figure and an age bracket, work out where someone sits in the
// UK wealth distribution ("you're in the top X%").
//
// DATA SOURCE: ONS Wealth and Assets Survey — "Total wealth in Great Britain,
// April 2018 to March 2020" (the same survey behind the Guardian/IFS wealth
// calculators). Total wealth = net property + private pension + net financial +
// physical wealth. These are HOUSEHOLD figures.
//
// Everything below is REAL ONS data, taken directly from the published tables:
//   • NAT_CURVE — the full national household total-wealth distribution, P1…P99
//     (ONS Figure 2). P50 = £302,500; P99 = £3,668,200 ("richest 1% had more
//     than £3.6m"); P10 = £15,400 ("least wealthy 10% had £15,400 or less").
//   • MEDIAN_BY_AGE — real median household total wealth by age of the household
//     reference person (ONS Figure 4).
//
// Per-age thresholds are produced by shifting the real national curve so its
// median lands on each age band's real median — i.e. we assume each age band has
// a similar distribution *shape*, anchored to its own real median. So both the
// national curve and every age-band median are exact ONS figures; only the spread
// within a band is modelled. For entertainment, not precise personal statistics.
//
// NOTE: this is HOUSEHOLD total wealth (incl. home equity and pensions). For a
// fair comparison, enter your property and pension in the Other Assets panel —
// stocks alone will under-read.

export type CountryCode = "UK";

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
];

export const WEALTH_SOURCE =
  "ONS Wealth & Assets Survey (Apr 2018–Mar 2020) — household total wealth, GB (incl. property & pensions)";

export const AGE_BRACKETS = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;
export type AgeBracket = (typeof AGE_BRACKETS)[number];

// Real national household total-wealth distribution, ONS WAS Apr 2018–Mar 2020.
// NAT_CURVE[i] = wealth threshold at percentile (i + 1), so index 0 = P1 … 98 = P99.
const NAT_CURVE: number[] = [
  -1_700, 2_500, 2_800, 4_200, 6_700, 7_800, 9_100, 11_100, 14_100, 15_400,
  17_100, 19_400, 22_200, 25_100, 27_200, 30_200, 34_200, 36_900, 40_700, 44_700,
  48_800, 53_600, 59_900, 65_800, 71_000, 78_500, 85_600, 92_400, 99_900, 107_200,
  113_900, 122_200, 130_800, 139_200, 146_400, 155_800, 164_900, 174_000, 183_200, 193_800,
  203_400, 214_000, 225_200, 236_700, 246_600, 257_400, 267_700, 277_300, 291_800, 302_500,
  313_500, 325_300, 338_600, 351_800, 366_300, 380_800, 391_900, 407_700, 421_600, 436_100,
  450_100, 467_300, 484_400, 502_100, 519_000, 538_200, 558_400, 575_900, 597_400, 617_900,
  641_200, 662_900, 683_600, 709_000, 733_800, 764_500, 795_800, 826_500, 856_000, 895_000,
  934_000, 969_600, 1_013_900, 1_057_400, 1_105_900, 1_159_100, 1_210_700, 1_274_700, 1_339_400, 1_413_700,
  1_506_300, 1_603_600, 1_709_800, 1_853_800, 1_988_500, 2_197_500, 2_469_200, 2_862_800, 3_668_200,
];

// National median (P50) — the pivot used to shift the curve onto each age band.
const NAT_MEDIAN = 302_500;

// Real median household total wealth by age of household reference person
// (ONS Figure 4). ONS's top two bands are "55 to under State Pension age" and
// "State Pension age and over", mapped here to 55-64 and 65+.
const MEDIAN_BY_AGE: Record<AgeBracket, number> = {
  "18-24": 22_300,
  "25-34": 76_800,
  "35-44": 198_100,
  "45-54": 366_600,
  "55-64": 553_400,
  "65+": 468_700,
};

// Real median household total wealth by region, ONS WAS Apr 2018–Mar 2020
// (Figure 5, "South East wealthiest region…"). Same survey and definition as
// the national curve above, so the same curve-shift trick applies per region.
export const REGIONS = [
  "North East",
  "North West",
  "Yorkshire & the Humber",
  "East Midlands",
  "West Midlands",
  "East of England",
  "London",
  "South East",
  "South West",
  "Wales",
  "Scotland",
] as const;
export type Region = (typeof REGIONS)[number];

const MEDIAN_BY_REGION: Record<Region, number> = {
  "North East": 168_500,
  "North West": 237_500,
  "Yorkshire & the Humber": 214_900,
  "East Midlands": 262_800,
  "West Midlands": 262_400,
  "East of England": 398_900,
  London: 340_300,
  "South East": 503_400,
  "South West": 379_900,
  Wales: 275_700,
  Scotland: 214_000,
};

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value);
}

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
  // The wealth needed to reach each notable tier, for "next goal" display.
  tiers: { label: string; percentile: number; value: number }[];
  median: number;
  multipleOfMedian: number; // value / median
};

/**
 * Percentile (0–100) of a value on the national household wealth curve, with
 * linear interpolation between the stored P1…P99 points.
 */
function nationalPercentile(value: number): number {
  if (value <= NAT_CURVE[0]) {
    // At or below P1. Scale gently toward 0 so tiny/negative wealth ranks low.
    return value <= 0 ? 0 : (value / NAT_CURVE[0]) * 1;
  }
  for (let i = 0; i < NAT_CURVE.length - 1; i++) {
    const lo = NAT_CURVE[i];
    const hi = NAT_CURVE[i + 1];
    if (value <= hi) {
      const t = (value - lo) / (hi - lo);
      // index i = P(i+1); interpolate between P(i+1) and P(i+2).
      return i + 1 + t;
    }
  }
  // Above P99 (£3.67m): approach but never quite reach 100.
  const top = NAT_CURVE[NAT_CURVE.length - 1];
  const doublings = Math.log2(value / top);
  return Math.min(99.99, 99 + (1 - Math.pow(0.5, doublings)) * 0.99);
}

/** Wealth threshold at a percentile on the national curve (inverse of above). */
function nationalValueAt(pct: number): number {
  const p = Math.max(1, Math.min(99, pct));
  const idx = Math.floor(p) - 1;
  const frac = p - Math.floor(p);
  const lo = NAT_CURVE[idx];
  const hi = NAT_CURVE[Math.min(idx + 1, NAT_CURVE.length - 1)];
  return lo + (hi - lo) * frac;
}

function topLabelFor(topPercent: number): string {
  if (topPercent <= 1) return "Top 1%";
  if (topPercent <= 5) return "Top 5%";
  if (topPercent <= 10) return "Top 10%";
  if (topPercent <= 25) return "Top 25%";
  if (topPercent <= 50) return "Top 50%";
  return `Bottom ${Math.round(100 - topPercent)}%`;
}

export type RegionComparison = {
  region: Region;
  percentile: number;
  topPercent: number;
  topLabel: string;
  median: number;
  multipleOfMedian: number;
};

/** Rank a net worth within a GB region (same curve-shift approach as by age). */
export function compareWealthByRegion(
  value: number,
  region: Region,
): RegionComparison {
  const median = MEDIAN_BY_REGION[region];
  const scale = NAT_MEDIAN / median;
  const percentile = nationalPercentile(value * scale);
  const topPercent = Math.max(0.01, 100 - percentile);
  return {
    region,
    percentile,
    topPercent,
    topLabel: topLabelFor(topPercent),
    median,
    multipleOfMedian: median > 0 ? value / median : 0,
  };
}

export function compareWealth(
  value: number,
  ageBracket: AgeBracket,
): Comparison {
  const median = MEDIAN_BY_AGE[ageBracket];
  // Shift the national curve onto this age band: a value is ranked as if the
  // band shared the national distribution shape, scaled to its own median.
  const scale = NAT_MEDIAN / median;
  const percentile = nationalPercentile(value * scale);
  const topPercent = Math.max(0.01, 100 - percentile);

  const tierDefs: { label: string; percentile: number }[] = [
    { label: "Top 25%", percentile: 75 },
    { label: "Top 10%", percentile: 90 },
    { label: "Top 5%", percentile: 95 },
    { label: "Top 1%", percentile: 99 },
  ];

  const tiers = tierDefs.map((t) => ({
    ...t,
    // Convert a national-curve threshold back to this age band's scale.
    value: Math.round(nationalValueAt(t.percentile) / scale),
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
