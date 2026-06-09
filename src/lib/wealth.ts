// Wealth comparison.
//
// Given a portfolio value, an age bracket and a country, work out roughly where
// someone sits in the wealth distribution ("you're in the top X%").
//
// The figures below are APPROXIMATE net-worth percentiles in USD, assembled for
// entertainment — they are not financial advice or precise statistics. They're
// kept in one place so they're easy to refine or swap for a real data source.
//
// Each bracket maps a percentile (0–100, where 100 = richest) to a net-worth
// threshold in USD. We interpolate between anchors to estimate a percentile.

export type CountryCode = "US" | "UK" | "AU" | "CA" | "GLOBAL";

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GLOBAL", name: "Global", flag: "🌍" },
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

// threshold[country][ageBracket] = [p25, p50, p75, p90, p95, p99] in USD.
type Table = Record<CountryCode, Record<AgeBracket, number[]>>;

const THRESHOLDS: Table = {
  US: {
    "18-24": [1_200, 8_000, 28_000, 80_000, 140_000, 350_000],
    "25-34": [6_000, 39_000, 110_000, 260_000, 430_000, 1_100_000],
    "35-44": [18_000, 135_000, 360_000, 760_000, 1_200_000, 3_400_000],
    "45-54": [35_000, 247_000, 660_000, 1_300_000, 2_100_000, 6_500_000],
    "55-64": [55_000, 364_000, 940_000, 1_900_000, 3_200_000, 9_800_000],
    "65+": [70_000, 410_000, 1_050_000, 2_100_000, 3_600_000, 11_000_000],
  },
  UK: {
    "18-24": [1_000, 7_000, 24_000, 70_000, 120_000, 300_000],
    "25-34": [5_000, 32_000, 95_000, 220_000, 360_000, 900_000],
    "35-44": [15_000, 110_000, 300_000, 640_000, 1_000_000, 2_800_000],
    "45-54": [30_000, 210_000, 560_000, 1_100_000, 1_800_000, 5_400_000],
    "55-64": [48_000, 320_000, 820_000, 1_650_000, 2_700_000, 8_000_000],
    "65+": [60_000, 360_000, 920_000, 1_850_000, 3_100_000, 9_000_000],
  },
  AU: {
    "18-24": [1_500, 9_000, 32_000, 90_000, 150_000, 380_000],
    "25-34": [7_000, 44_000, 125_000, 290_000, 470_000, 1_200_000],
    "35-44": [20_000, 150_000, 400_000, 830_000, 1_300_000, 3_600_000],
    "45-54": [40_000, 280_000, 740_000, 1_450_000, 2_300_000, 7_000_000],
    "55-64": [62_000, 410_000, 1_050_000, 2_100_000, 3_500_000, 10_500_000],
    "65+": [78_000, 460_000, 1_180_000, 2_350_000, 4_000_000, 12_000_000],
  },
  CA: {
    "18-24": [1_200, 8_000, 27_000, 78_000, 135_000, 330_000],
    "25-34": [6_000, 38_000, 108_000, 250_000, 410_000, 1_050_000],
    "35-44": [17_000, 128_000, 345_000, 720_000, 1_150_000, 3_200_000],
    "45-54": [34_000, 235_000, 630_000, 1_250_000, 2_000_000, 6_200_000],
    "55-64": [52_000, 350_000, 900_000, 1_820_000, 3_050_000, 9_300_000],
    "65+": [66_000, 395_000, 1_010_000, 2_020_000, 3_450_000, 10_500_000],
  },
  GLOBAL: {
    "18-24": [200, 1_500, 6_000, 24_000, 55_000, 180_000],
    "25-34": [800, 6_000, 26_000, 90_000, 180_000, 600_000],
    "35-44": [2_000, 14_000, 62_000, 210_000, 420_000, 1_400_000],
    "45-54": [3_500, 24_000, 105_000, 360_000, 700_000, 2_300_000],
    "55-64": [4_500, 30_000, 130_000, 440_000, 860_000, 2_900_000],
    "65+": [5_000, 33_000, 140_000, 470_000, 920_000, 3_100_000],
  },
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
  country: CountryCode;
  countryName: string;
  // The net worth needed to reach each notable tier, for "next goal" display.
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
  country: CountryCode,
): Comparison {
  const anchors = THRESHOLDS[country][ageBracket];
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

  const countryName =
    COUNTRIES.find((c) => c.code === country)?.name ?? country;

  return {
    percentile,
    topPercent,
    topLabel: topLabelFor(topPercent),
    ageBracket,
    country,
    countryName,
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
