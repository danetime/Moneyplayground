// Wealth comparison (UK).
//
// Given a net-worth figure and an age bracket (and optionally a region), work out
// where someone sits in the UK wealth distribution ("you're in the top X%").
//
// DATA SOURCE: ONS Wealth and Assets Survey — "Total wealth: Wealth in Great
// Britain", April 2020 to March 2022 (the latest round; the same survey behind
// the Guardian/IFS wealth calculators). Total wealth = net property + private
// pension + net financial + physical wealth.
//
// This is built from the REAL published distributions, not a model:
//   • AGE_SHARES — ONS Table 2.11 "Individuals by age, by household total wealth":
//     the actual % of each age group falling in each wealth band. We turn those
//     bands into a cumulative curve and read percentiles straight off it.
//   • REGION_POINTS — ONS Table 2.8: the real 25th/50th/75th total-wealth
//     percentile points for each GB region.
// The only modelled part is the very top tail (above £1m, an open-ended band in
// the source), where we extrapolate with the national curve's top-end slope.
//
// IMPORTANT — what this is and isn't:
//   • HOUSEHOLD total wealth (incl. home equity and pension pots), attributed to
//     each individual in the household. So "top 25% = ~£490k" for 35–44 is real:
//     about a quarter of people that age live in households worth £500k+ ONCE you
//     count pensions and property. It feels high because pension wealth is huge
//     and invisible. For a like-for-like read, enter your property and pension in
//     the Other Assets panel.
//   • The 18–24 band is skewed up because many are counted with their parents'
//     household wealth — treat that bracket as a loose guide.

export type CountryCode = "UK";

export const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
];

export const WEALTH_SOURCE =
  "ONS Wealth & Assets Survey (Apr 2020–Mar 2022), Tables 2.8 & 2.11 — household total wealth, GB (incl. property & pensions)";

export const AGE_BRACKETS = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;
export type AgeBracket = (typeof AGE_BRACKETS)[number];

// Upper bound (£) of each ONS wealth band; the final band (£1m+) is open-ended.
const BANDS = [20_000, 85_000, 200_000, 300_000, 500_000, 1_000_000];

// ONS Table 2.11 — Individuals by age, by household total wealth, GB,
// April 2020 to March 2022. Each row is the % of that age group in each band:
// [ <£20k, £20–85k, £85–200k, £200–300k, £300–500k, £500k–1m, £1m+ ].
const AGE_SHARES: Record<AgeBracket, number[]> = {
  "18-24": [14, 18, 11, 8, 11, 21, 16],
  "25-34": [14, 23, 22, 10, 13, 11, 6],
  "35-44": [10, 17, 17, 14, 18, 18, 6],
  "45-54": [10, 14, 10, 10, 15, 25, 17],
  "55-64": [8, 9, 8, 6, 13, 27, 29],
  "65+": [5, 10, 9, 9, 17, 27, 22],
};

// Top-tail slope (Pareto alpha) for wealth above £1m, derived from the national
// curve's P90 (£1.41m) → P99 (£3.67m). Stable across the open-ended top band.
const TAIL_ALPHA = 2.4;

// ---- Regions ----

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

// ONS Table 2.8 — total wealth percentile points by region, GB,
// April 2020 to March 2022: [25th, 50th (median), 75th] in £.
const REGION_POINTS: Record<Region, [number, number, number]> = {
  "North East": [38_100, 179_900, 429_600],
  "North West": [68_500, 222_400, 522_400],
  "Yorkshire & the Humber": [58_300, 245_600, 518_700],
  "East Midlands": [71_700, 261_000, 586_100],
  "West Midlands": [72_300, 260_800, 587_100],
  "East of England": [121_600, 400_700, 820_500],
  London: [30_500, 244_800, 791_400],
  "South East": [127_300, 489_800, 935_700],
  "South West": [103_100, 347_700, 724_100],
  Wales: [72_900, 266_900, 585_100],
  Scotland: [57_500, 239_500, 546_100],
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

// ---- Distribution interpolation ----

// An anchor is a known (percentile, wealth) point on a distribution curve.
type Anchor = { p: number; v: number };

// Build the cumulative percentile curve for an age band from its band shares.
function ageAnchors(bracket: AgeBracket): Anchor[] {
  const shares = AGE_SHARES[bracket];
  const total = shares.reduce((a, b) => a + b, 0);
  const anchors: Anchor[] = [];
  let cum = 0;
  for (let i = 0; i < BANDS.length; i++) {
    cum += (shares[i] * 100) / total;
    anchors.push({ p: cum, v: BANDS[i] });
  }
  return anchors; // last anchor is at £1m; everything above is the tail
}

function regionAnchors(region: Region): Anchor[] {
  const [v25, v50, v75] = REGION_POINTS[region];
  return [
    { p: 25, v: v25 },
    { p: 50, v: v50 },
    { p: 75, v: v75 },
  ];
}

// Percentile (0–100) of a wealth value on a curve defined by `anchors`, using
// log-linear interpolation between anchors and a Pareto tail above the top one.
function percentileFor(value: number, anchors: Anchor[]): number {
  if (value <= 0) return 0;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  if (value <= first.v) return (value / first.v) * first.p;

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (value <= b.v) {
      const t = Math.log(value / a.v) / Math.log(b.v / a.v);
      return a.p + t * (b.p - a.p);
    }
  }

  // Above the top anchor: exceedance shrinks with the tail slope.
  const exceedance = (100 - last.p) * Math.pow(value / last.v, -TAIL_ALPHA);
  return Math.min(99.99, 100 - exceedance);
}

// Wealth value at percentile `p` — the inverse of percentileFor.
function valueForPercentile(p: number, anchors: Anchor[]): number {
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  if (p <= first.p) return first.v * (p / first.p);

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      return a.v * Math.pow(b.v / a.v, t);
    }
  }

  const exceedance = 100 - p;
  return last.v * Math.pow(exceedance / (100 - last.p), -1 / TAIL_ALPHA);
}

function topLabelFor(topPercent: number): string {
  if (topPercent <= 1) return "Top 1%";
  if (topPercent <= 5) return "Top 5%";
  if (topPercent <= 10) return "Top 10%";
  if (topPercent <= 25) return "Top 25%";
  if (topPercent <= 50) return "Top 50%";
  return `Bottom ${Math.round(100 - topPercent)}%`;
}

// ---- Public comparison API ----

export type Comparison = {
  percentile: number; // 0–100, your rank (higher = richer)
  topPercent: number; // e.g. 10 means "top 10%"
  topLabel: string; // "Top 10%"
  ageBracket: AgeBracket;
  countryName: string;
  tiers: { label: string; percentile: number; value: number }[];
  median: number;
  multipleOfMedian: number; // value / median
};

export function compareWealth(
  value: number,
  ageBracket: AgeBracket,
): Comparison {
  const anchors = ageAnchors(ageBracket);
  const percentile = percentileFor(value, anchors);
  const topPercent = Math.max(0.01, 100 - percentile);
  const median = valueForPercentile(50, anchors);

  const tierDefs: { label: string; percentile: number }[] = [
    { label: "Top 25%", percentile: 75 },
    { label: "Top 10%", percentile: 90 },
    { label: "Top 5%", percentile: 95 },
    { label: "Top 1%", percentile: 99 },
  ];
  const tiers = tierDefs.map((t) => ({
    ...t,
    value: Math.round(valueForPercentile(t.percentile, anchors)),
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

export type RegionComparison = {
  region: Region;
  percentile: number;
  topPercent: number;
  topLabel: string;
  median: number;
  multipleOfMedian: number;
};

export function compareWealthByRegion(
  value: number,
  region: Region,
): RegionComparison {
  const anchors = regionAnchors(region);
  const percentile = percentileFor(value, anchors);
  const topPercent = Math.max(0.01, 100 - percentile);
  const median = REGION_POINTS[region][1];
  return {
    region,
    percentile,
    topPercent,
    topLabel: topLabelFor(topPercent),
    median,
    multipleOfMedian: median > 0 ? value / median : 0,
  };
}
