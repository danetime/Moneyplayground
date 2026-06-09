import { formatUSD } from "@/lib/visualize";

export default function PortfolioSummary({
  totalValue,
  totalGain,
  holdingsCount,
}: {
  totalValue: number;
  totalGain: number | null;
  holdingsCount: number;
}) {
  const gainPositive = (totalGain ?? 0) >= 0;

  return (
    <section className="card animate-fade-up">
      <p className="label">Total portfolio value</p>
      <div className="mt-1 flex flex-wrap items-end gap-3">
        <span className="text-5xl font-black tracking-tight gold-text sm:text-6xl">
          {formatUSD(totalValue)}
        </span>
        {totalGain != null && (
          <span
            className={`mb-2 rounded-lg px-2 py-1 text-sm font-semibold ${
              gainPositive
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {gainPositive ? "▲" : "▼"} {formatUSD(Math.abs(totalGain))}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-400">
        {holdingsCount === 0
          ? "Add your first stock below to bring your pile to life."
          : `Across ${holdingsCount} holding${holdingsCount === 1 ? "" : "s"}.`}
      </p>
    </section>
  );
}
