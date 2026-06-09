import { formatMoney } from "@/lib/visualize";

export default function PortfolioSummary({
  totalValue,
  stocksValue,
  assetsValue,
  totalGain,
  holdingsCount,
  pricesLive,
  dayChange,
}: {
  totalValue: number;
  stocksValue: number;
  assetsValue: number;
  totalGain: number | null;
  holdingsCount: number;
  pricesLive: boolean;
  dayChange: number | null;
}) {
  const gainPositive = (totalGain ?? 0) >= 0;
  const dayPositive = (dayChange ?? 0) >= 0;
  const hasOtherAssets = assetsValue > 0;

  return (
    <section className="banknote animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="label mb-0 text-board-deep">💷 The Bank · your net worth</p>
        {holdingsCount > 0 && (
          <span
            className={`flex items-center gap-1.5 rounded-full border-2 border-monoink px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
              pricesLive ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"
            }`}
            title={
              pricesLive
                ? "Prices fetched from live market data"
                : "No network — showing built-in fallback prices"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                pricesLive ? "animate-pulse bg-emerald-500" : "bg-stone-500"
              }`}
            />
            {pricesLive ? "Live prices" : "Offline prices"}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <span className="money-text text-5xl font-black tracking-tight sm:text-6xl">
          {formatMoney(totalValue)}
        </span>
        <div className="mb-2 flex flex-wrap gap-2">
          {dayChange != null && dayChange !== 0 && (
            <span
              className={`rounded-md border-2 border-monoink px-2 py-1 text-sm font-bold ${
                dayPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {dayPositive ? "▲" : "▼"} {formatMoney(Math.abs(dayChange))} today
            </span>
          )}
          {totalGain != null && (
            <span
              className={`rounded-md border-2 border-monoink px-2 py-1 text-sm font-bold ${
                gainPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {gainPositive ? "▲" : "▼"} {formatMoney(Math.abs(totalGain))} all time
            </span>
          )}
        </div>
      </div>

      {hasOtherAssets && (
        <div className="mt-3 flex flex-wrap gap-3 border-t border-dashed border-black/15 pt-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-600">
            <span className="rounded bg-board-deep/10 px-1.5 py-0.5 text-xs font-bold text-board-deep">
              📈 Stocks
            </span>
            {formatMoney(stocksValue)}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-600">
            <span className="rounded bg-deed-orange/20 px-1.5 py-0.5 text-xs font-bold text-monoink">
              🏠 Other assets
            </span>
            {formatMoney(assetsValue)}
          </div>
        </div>
      )}

      <p className="mt-2 text-sm font-semibold text-stone-600">
        {holdingsCount === 0 && !hasOtherAssets
          ? "Pass GO and add your first stock below to bring your pile to life."
          : holdingsCount > 0
          ? `Across ${holdingsCount} stock holding${holdingsCount === 1 ? "" : "s"}${hasOtherAssets ? " + other assets" : ""}.`
          : "Other assets only — add stocks below to track your portfolio too."}
      </p>
    </section>
  );
}
