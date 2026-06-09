// Turn a pound amount into fun, tangible comparisons:
// piles of gold, diamonds, and cars you could buy.
//
// All values here are in GBP, matching the rest of the app. Money formatting
// lives in ./currency (formatGBP), re-exported below for convenience.

export { formatGBP, formatGBP as formatMoney } from "./currency";

// --- Reference prices (approximate, in GBP, for fun) ---
const GOLD_PRICE_PER_OZ = 2_600; // £ per troy ounce — fallback when no live quote
const OZ_PER_KG = 32.1507;
const GOOD_DELIVERY_BAR_OZ = 400; // standard 400 oz gold bar (~12.4 kg)

const DIAMOND_PRICE_PER_CARAT = 4_000; // a decent 1-carat stone

export type GoldView = {
  ounces: number;
  kilograms: number;
  bars: number; // number of 400oz Good Delivery bars
  tonnes: number;
  pricePerOz: number; // £/oz used for the conversion
  live: boolean; // true when priced from a live gold quote
};

export function toGold(value: number, livePricePerOz?: number): GoldView {
  const pricePerOz =
    livePricePerOz && livePricePerOz > 0 ? livePricePerOz : GOLD_PRICE_PER_OZ;
  const ounces = value / pricePerOz;
  const kilograms = ounces / OZ_PER_KG;
  return {
    ounces,
    kilograms,
    bars: ounces / GOOD_DELIVERY_BAR_OZ,
    tonnes: kilograms / 1000,
    pricePerOz,
    live: pricePerOz !== GOLD_PRICE_PER_OZ,
  };
}

export type DiamondView = {
  carats: number;
  stones: number; // number of 1-carat stones
};

export function toDiamonds(value: number): DiamondView {
  const carats = value / DIAMOND_PRICE_PER_CARAT;
  return { carats, stones: carats };
}

// --- Cars (approximate UK on-the-road prices, in GBP) ---
export type Car = {
  name: string;
  price: number;
  emoji: string;
};

// Ordered cheapest → priciest.
export const CARS: Car[] = [
  { name: "Used Ford Fiesta", price: 9_000, emoji: "🚗" },
  { name: "New Honda Civic", price: 30_000, emoji: "🚙" },
  { name: "Tesla Model 3", price: 40_000, emoji: "⚡" },
  { name: "BMW M3", price: 85_000, emoji: "🏎️" },
  { name: "Porsche 911", price: 105_000, emoji: "🏎️" },
  { name: "Range Rover Autobiography", price: 140_000, emoji: "🚙" },
  { name: "Ferrari Roma", price: 185_000, emoji: "🏎️" },
  { name: "Lamborghini Huracán", price: 205_000, emoji: "🏎️" },
  { name: "McLaren 750S", price: 245_000, emoji: "🏎️" },
  { name: "Rolls-Royce Ghost", price: 290_000, emoji: "🛻" },
  { name: "Bugatti Chiron", price: 2_500_000, emoji: "🏁" },
];

export type CarView = {
  // Best single car you could buy outright, and how many of them.
  best: { car: Car; count: number } | null;
  // A relatable benchmark: how many "everyman" cars (Civic) you could buy.
  everyman: { car: Car; count: number };
};

export function toCars(value: number): CarView {
  const sorted = [...CARS].sort((a, b) => b.price - a.price);
  let best: { car: Car; count: number } | null = null;
  for (const car of sorted) {
    const count = Math.floor(value / car.price);
    if (count >= 1) {
      best = { car, count };
      break;
    }
  }
  const everymanCar = CARS[1]; // New Honda Civic
  return {
    best,
    everyman: { car: everymanCar, count: value / everymanCar.price },
  };
}

// --- Houses (average prices by GB region, HM Land Registry / ONS HPI, 2026) ---
// Approximate and for fun; region names match src/lib/wealth.ts REGIONS.
export const UK_AVG_HOUSE_PRICE = 268_000;

export const HOUSE_PRICE_BY_REGION: Record<string, number> = {
  "North East": 162_000,
  "North West": 213_000,
  "Yorkshire & the Humber": 206_000,
  "East Midlands": 248_000,
  "West Midlands": 255_000,
  "East of England": 330_000,
  London: 510_000,
  "South East": 380_000,
  "South West": 315_000,
  Wales: 213_000,
  Scotland: 195_000,
};

export type HouseView = {
  count: number; // homes you could buy outright in `where`
  price: number; // average price used
  where: string; // region name or "the UK"
  // Always-fun extremes for contrast.
  londonCount: number;
  northEastCount: number;
};

export function toHouses(value: number, region?: string | null): HouseView {
  const price =
    (region && HOUSE_PRICE_BY_REGION[region]) || UK_AVG_HOUSE_PRICE;
  return {
    count: value / price,
    price,
    where: region && HOUSE_PRICE_BY_REGION[region] ? region : "the UK",
    londonCount: value / HOUSE_PRICE_BY_REGION["London"],
    northEastCount: value / HOUSE_PRICE_BY_REGION["North East"],
  };
}

// --- Greggs sausage rolls (the one true unit of British wealth) ---
export const SAUSAGE_ROLL_PRICE = 1.35; // £, standard high-street price

export function toSausageRolls(value: number): number {
  return value / SAUSAGE_ROLL_PRICE;
}

// --- Number formatting (non-currency) ---
export function formatNumber(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}
