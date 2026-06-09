// Live stock quotes with layered providers and graceful fallback.
//
// Provider order:
//   1. Finnhub  — used when FINNHUB_API_KEY is set (free tier: 60 calls/min)
//   2. Yahoo Finance chart endpoint — keyless, used otherwise
//   3. Mock prices from the built-in universe — used when offline
//
// Results are cached in memory for a short TTL so a dashboard render only
// hits the network once per symbol per minute. Failures are negative-cached
// briefly so a dead network doesn't add latency to every page load.

import { STOCK_UNIVERSE, getFallbackQuote } from "./stocks";

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  change: number | null; // today's change per share, in quote currency
  changePct: number | null;
  currency: string;
  source: "finnhub" | "yahoo" | "mock";
  asOf: string; // ISO timestamp
};

const TTL_MS = 60_000;
const NEGATIVE_TTL_MS = 30_000;
const FETCH_TIMEOUT_MS = 5_000;

type CacheEntry = { quote: Quote | null; expires: number };
const cache = new Map<string, CacheEntry>();

const UNIVERSE_NAMES = new Map(
  STOCK_UNIVERSE.map((s) => [s.symbol, s.name]),
);

async function fetchJson(url: string, headers?: Record<string, string>) {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    // Next.js patches fetch with response caching in server components;
    // quotes must always be fresh.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
  return res.json();
}

async function fetchFinnhub(symbol: string): Promise<Quote | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  const data = await fetchJson(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
  );
  // Finnhub returns zeros (with t=0) for unknown symbols.
  if (!data || typeof data.c !== "number" || data.c === 0) return null;
  return {
    symbol,
    name: UNIVERSE_NAMES.get(symbol) ?? symbol,
    price: data.c,
    change: typeof data.d === "number" ? data.d : null,
    changePct: typeof data.dp === "number" ? data.dp : null,
    currency: "USD",
    source: "finnhub",
    asOf: new Date().toISOString(),
  };
}

async function fetchYahoo(symbol: string): Promise<Quote | null> {
  // Yahoo writes class shares with a dash: BRK.B -> BRK-B
  const yahooSymbol = symbol.replace(/\./g, "-");
  const data = await fetchJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`,
    { "User-Agent": "Mozilla/5.0 (compatible; MoneyPlayground/1.0)" },
  );
  const meta = data?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (typeof price !== "number") return null;
  const prevClose =
    typeof meta.chartPreviousClose === "number"
      ? meta.chartPreviousClose
      : typeof meta.previousClose === "number"
        ? meta.previousClose
        : null;
  const change = prevClose != null ? price - prevClose : null;
  return {
    symbol,
    name:
      meta.shortName ??
      meta.longName ??
      UNIVERSE_NAMES.get(symbol) ??
      symbol,
    price,
    change,
    changePct:
      change != null && prevClose ? (change / prevClose) * 100 : null,
    currency: meta.currency ?? "USD",
    source: "yahoo",
    asOf: new Date().toISOString(),
  };
}

function mockQuote(symbol: string): Quote | null {
  const fallback = getFallbackQuote(symbol);
  if (!fallback) return null;
  return {
    symbol: fallback.symbol,
    name: fallback.name,
    price: fallback.price,
    change: null,
    changePct: null,
    currency: "USD",
    source: "mock",
    asOf: new Date().toISOString(),
  };
}

/**
 * Get a quote for one symbol: live if possible, mock if the symbol is in the
 * built-in universe and the network is unavailable, otherwise null.
 */
export async function getQuote(symbol: string): Promise<Quote | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;

  const cached = cache.get(sym);
  if (cached && cached.expires > Date.now()) return cached.quote;

  let quote: Quote | null = null;
  let networkFailed = false;

  for (const provider of [fetchFinnhub, fetchYahoo]) {
    try {
      quote = await provider(sym);
      if (quote) break;
    } catch {
      // Provider unreachable or errored — try the next one.
      networkFailed = true;
    }
  }

  // Only fall back to mock prices when the network failed, not when a live
  // provider clearly told us the symbol doesn't exist.
  if (!quote && networkFailed) quote = mockQuote(sym);

  cache.set(sym, {
    quote,
    expires: Date.now() + (quote ? TTL_MS : NEGATIVE_TTL_MS),
  });
  return quote;
}

/** Fetch quotes for many symbols in parallel. Unknown symbols are omitted. */
export async function getQuotes(
  symbols: string[],
): Promise<Record<string, Quote>> {
  const unique = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase())));
  const results = await Promise.all(unique.map((s) => getQuote(s)));
  const out: Record<string, Quote> = {};
  for (const q of results) {
    if (q) out[q.symbol] = q;
  }
  return out;
}
