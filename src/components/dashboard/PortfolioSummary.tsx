import { formatUSD } from "@/lib/visualize";

export default function PortfolioSummary({
  totalValue,
  totalGain,
  holdingsCount,
  pricesLive,
  dayChange,
}: {
  totalValue: number;
  totalGain: number | null;
  holdingsCount: number;
  pricesLive: boolean;
  dayChange: number | null;
}) {
  const gainPositive = (totalGain ?? 0) >= 0;
  const dayPositive = (dayChange ?? 0) >= 0;

  return (
    <section className="card animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="label">Total portfolio value</p>
        {holdingsCount > 0 && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              pricesLive
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-slate-500/15 text-slate-400"
            }`}
            title={
              pricesLive
                ? "Prices fetched from live market data"
                : "No network — showing built-in fallback prices"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                pricesLive ? "animate-pulse bg-emerald-400" : "bg-slate-500"
              }`}
            />
            {pricesLive ? "Live prices" : "Offline prices"}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-end gap-3">
        <span className="text-5xl font-black tracking-tight gold-text sm:text-6xl">
          {formatUSD(totalValue)}
        </span>
        <div className="mb-2 flex gap-2">
          {dayChange != null && dayChange !== 0 && (
            <span
              className={`rounded-lg px-2 py-1 text-sm font-semibold ${
                dayPositive
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {dayPositive ? "▲" : "▼"} {formatUSD(Math.abs(dayChange))} today
            </span>
          )}
          {totalGain != null && (
            <span
              className={`rounded-lg px-2 py-1 text-sm font-semibold ${
                gainPositive
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {gainPositive ? "▲" : "▼"} {formatUSD(Math.abs(totalGain))} all time
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        {holdingsCount === 0
          ? "Add your first stock below to bring your pile to life."
          : `Across ${holdingsCount} holding${holdingsCount === 1 ? "" : "s"}.`}
      </p>
    </section>
  );
}
