"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchStocks } from "@/lib/stocks";
import { formatMoney } from "@/lib/visualize";

type EnrichedHolding = {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  gain: number | null;
  gainPct: number | null;
  dayChangePct: number | null;
};

export default function HoldingsPanel({
  holdings,
}: {
  holdings: EnrichedHolding[];
}) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(
    () => (symbol ? searchStocks(symbol, 6) : []),
    [symbol],
  );

  async function addHolding(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        shares: Number(shares),
        costBasis: cost ? Number(cost) : null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't add that holding.");
      return;
    }
    setSymbol("");
    setShares("");
    setCost("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/holdings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="card">
      <div className="deed-bar bg-board-deep">Portfolio</div>
      <h2 className="mono-title text-xl">Your holdings</h2>

      <form onSubmit={addHolding} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="relative">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Any ticker (e.g. AAPL)"
              className="input uppercase"
              list="stock-suggestions"
              autoComplete="off"
            />
            <datalist id="stock-suggestions">
              {suggestions.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.name}
                </option>
              ))}
            </datalist>
          </div>
          <input
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="Shares"
            type="number"
            step="any"
            min="0"
            className="input"
          />
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Cost/share (£)"
            type="number"
            step="any"
            min="0"
            className="input"
          />
          <button type="submit" disabled={busy} className="btn-gold">
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </form>

      <div className="mt-5">
        {holdings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/15 py-8 text-center text-sm text-stone-500">
            No holdings yet. Add one above to start your pile.
          </p>
        ) : (
          <ul className="divide-y divide-black/10">
            {holdings.map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-xs font-bold">
                  {h.symbol.slice(0, 4)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{h.name}</p>
                  <p className="text-xs text-stone-500">
                    {h.shares} sh · {formatMoney(h.price)}
                    {h.dayChangePct != null && (
                      <span
                        className={
                          h.dayChangePct >= 0
                            ? " text-emerald-700"
                            : " text-rose-700"
                        }
                      >
                        {" "}
                        {h.dayChangePct >= 0 ? "+" : ""}
                        {h.dayChangePct.toFixed(2)}% today
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMoney(h.value)}</p>
                  {h.gainPct != null && (
                    <p
                      className={`text-xs ${
                        h.gainPct >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {h.gainPct >= 0 ? "▲" : "▼"} {Math.abs(h.gainPct).toFixed(1)}%
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(h.id)}
                  className="ml-1 rounded-lg p-2 text-stone-500 transition hover:bg-rose-100 hover:text-rose-700"
                  aria-label={`Remove ${h.symbol}`}
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
