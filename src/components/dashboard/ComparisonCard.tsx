import { formatMoney } from "@/lib/visualize";
import { type Comparison } from "@/lib/wealth";
import ProfileForm from "./ProfileForm";

function PercentileGauge({ percentile }: { percentile: number }) {
  const pct = Math.max(0, Math.min(100, percentile));
  return (
    <div className="mt-3">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
        <span>Poorer</span>
        <span>Richer</span>
      </div>
    </div>
  );
}

export default function ComparisonCard({
  comparison,
  birthYear,
  totalValue,
}: {
  comparison: Comparison | null;
  birthYear: number | null;
  totalValue: number;
}) {
  return (
    <section className="card animate-fade-up">
      <h2 className="text-lg font-bold">📊 How rich are you?</h2>

      {comparison ? (
        <>
          <p className="mt-1 text-sm text-slate-400">
            vs 🇬🇧 the UK, ages {comparison.ageBracket}
          </p>

          <div className="mt-5 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              You&apos;re in the
            </p>
            <p className="text-4xl font-black gold-text">
              {comparison.topLabel}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              richer than {comparison.percentile.toFixed(1)}% of your peers
            </p>
          </div>

          <PercentileGauge percentile={comparison.percentile} />

          <p className="mt-4 text-center text-sm text-slate-300">
            That&apos;s{" "}
            <span className="font-bold text-gold-light">
              {comparison.multipleOfMedian >= 1
                ? `${comparison.multipleOfMedian.toFixed(1)}×`
                : `${(comparison.multipleOfMedian * 100).toFixed(0)}% of`}
            </span>{" "}
            the median ({formatMoney(comparison.median, { compact: true })}).
          </p>

          <div className="mt-5 space-y-2">
            <p className="label">Milestones for your bracket</p>
            {comparison.tiers.map((tier) => {
              const reached = totalValue >= tier.value;
              return (
                <div
                  key={tier.label}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span>{reached ? "✅" : "🔒"}</span>
                    <span className={reached ? "text-slate-200" : "text-slate-400"}>
                      {tier.label}
                    </span>
                  </span>
                  <span className="font-semibold text-slate-300">
                    {formatMoney(tier.value, { compact: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-400">
          Tell us your birth year to see where you rank against your age group
          across the UK.
        </p>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="label">Your details</p>
        <ProfileForm birthYear={birthYear} />
      </div>
    </section>
  );
}
