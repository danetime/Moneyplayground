// Mock stock universe + pricing.
//
// This is intentionally a static dataset so the whole app works offline with
// no API keys. To go live later, replace `getQuote`/`getQuotes` with calls to
// a real provider (Finnhub, Alpha Vantage, etc.) — the rest of the app only
// depends on these two functions and the `Quote` shape.

export type Stock = {
  symbol: string;
  name: string;
  price: number; // current price in USD
  sector: string;
};

// A small universe of well-known tickers with plausible prices.
export const STOCK_UNIVERSE: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 212.44, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 467.12, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 178.33, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 201.5, sector: "Consumer" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 134.81, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", price: 612.9, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.6, sector: "Automotive" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 452.2, sector: "Financials" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 248.71, sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", price: 312.4, sector: "Financials" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 152.18, sector: "Healthcare" },
  { symbol: "WMT", name: "Walmart Inc.", price: 91.05, sector: "Consumer" },
  { symbol: "PG", name: "Procter & Gamble", price: 168.42, sector: "Consumer" },
  { symbol: "DIS", name: "Walt Disney Co.", price: 112.3, sector: "Media" },
  { symbol: "KO", name: "Coca-Cola Co.", price: 62.9, sector: "Consumer" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 905.6, sector: "Media" },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 121.7, sector: "Technology" },
  { symbol: "INTC", name: "Intel Corp.", price: 21.4, sector: "Technology" },
  { symbol: "BA", name: "Boeing Co.", price: 177.9, sector: "Industrials" },
  { symbol: "NKE", name: "Nike Inc.", price: 76.25, sector: "Consumer" },
  { symbol: "PFE", name: "Pfizer Inc.", price: 25.6, sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil Corp.", price: 112.8, sector: "Energy" },
  { symbol: "T", name: "AT&T Inc.", price: 22.95, sector: "Telecom" },
  { symbol: "COST", name: "Costco Wholesale", price: 982.4, sector: "Consumer" },
  { symbol: "SPY", name: "S&P 500 ETF", price: 598.3, sector: "ETF" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 521.7, sector: "ETF" },
  { symbol: "VTI", name: "Total Market ETF", price: 295.1, sector: "ETF" },
];

const BY_SYMBOL = new Map(STOCK_UNIVERSE.map((s) => [s.symbol, s]));

export type Quote = {
  symbol: string;
  name: string;
  price: number;
};

export function getQuote(symbol: string): Quote | null {
  const s = BY_SYMBOL.get(symbol.toUpperCase());
  if (!s) return null;
  return { symbol: s.symbol, name: s.name, price: s.price };
}

export function getQuotes(symbols: string[]): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const sym of symbols) {
    const q = getQuote(sym);
    if (q) out[q.symbol] = q;
  }
  return out;
}

export function isKnownSymbol(symbol: string): boolean {
  return BY_SYMBOL.has(symbol.toUpperCase());
}

export function searchStocks(query: string, limit = 8): Stock[] {
  const q = query.trim().toLowerCase();
  if (!q) return STOCK_UNIVERSE.slice(0, limit);
  return STOCK_UNIVERSE.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
  ).slice(0, limit);
}
