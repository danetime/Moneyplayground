// Turn a dollar amount into fun, tangible comparisons:
// piles of gold, diamonds, and cars you could buy.

// --- Reference prices (approximate, for fun) ---
const GOLD_PRICE_PER_OZ = 3_300; // USD per troy ounce
const OZ_PER_KG = 32.1507;
const GOOD_DELIVERY_BAR_OZ = 400; // standard 400 oz gold bar (~12.4 kg)

const DIAMOND_PRICE_PER_CARAT = 5_000; // a decent 1-carat stone

export type GoldView = {
  ounces: number;
  kilograms: number;
  bars: number; // number of 400oz Good Delivery bars
  tonnes: number;
};

export function toGold(value: number): GoldView {
  const ounces = value / GOLD_PRICE_PER_OZ;
  const kilograms = ounces / OZ_PER_KG;
  return {
    ounces,
    kilograms,
    bars: ounces / GOOD_DELIVERY_BAR_OZ,
    tonnes: kilograms / 1000,
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

// --- Cars ---
export type Car = {
  name: string;
  price: number;
  emoji: string;
};

// Ordered cheapest → priciest.
export const CARS: Car[] = [
  { name: "Used Toyota Corolla", price: 18_000, emoji: "🚗" },
  { name: "New Honda Civic", price: 28_000, emoji: "🚙" },
  { name: "Tesla Model 3", price: 42_000, emoji: "⚡" },
  { name: "BMW M3", price: 76_000, emoji: "🏎️" },
  { name: "Porsche 911", price: 130_000, emoji: "🏎️" },
  { name: "Range Rover Autobiography", price: 180_000, emoji: "🚙" },
  { name: "Lamborghini Huracán", price: 250_000, emoji: "🏎️" },
  { name: "Ferrari Roma", price: 280_000, emoji: "🏎️" },
  { name: "Rolls-Royce Ghost", price: 380_000, emoji: "🛻" },
  { name: "McLaren 750S", price: 330_000, emoji: "🏎️" },
  { name: "Bugatti Chiron", price: 3_500_000, emoji: "🏁" },
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

// --- Formatting helpers ---
export function formatUSD(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}
