import { formatMoney } from "@/lib/visualize";
import {
  type Comparison,
  type RegionComparison,
  WEALTH_SOURCE,
} from "@/lib/wealth";
import ProfileForm from "./ProfileForm";

// Property-set colours (Monopoly) for the wealth milestone tiers, cheap → dear.
const TIER_COLORS: Record<string, string> = {
  "Top 25%": "bg-deed-orange",
  "Top 10%": "bg-deed-red",
  "Top 5%": "bg-deed-green",
  "Top 1%": "bg-deed-blue",
};

function PercentileGauge({ percentile }: { percentile: number }) {
  const pct = Math.max(0, Math.min(100, percentile));
  return (
    <div className="mt-3">
      <div className="relative h-4 w-full overflow-hidden rounded-full border-2 border-monoink bg-white">
        <div
          className="h-full bg-board-deep"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-black uppercase tracking-wide text-stone-500">
        <span>Skint</span>
        <span>Rolling in it</span>
      </div>
    </div>
  );
}

export default function ComparisonCard({
  comparison,
  regionComparison,
  birthYear,
  region,
  totalValue,
}: {
  comparison: Comparison | null;
  regionComparison: RegionComparison | null;
  birthYear: number | null;
  region: string | null;
  totalValue: number;
}) {
  return (
    <section className="card animate-fade-up">
      <div className="deed-bar bg-monored">Title Deed</div>
      <h2 className="mono-title text-xl">How rich are you?</h2>

      {comparison ? (
        <>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            vs 🇬🇧 the UK, ages {comparison.ageBracket}
          </p>

          <div className="mt-5 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-stone-500">
              You&apos;re in the
            </p>
            <p className="mono-title text-5xl text-monored">
              {comparison.topLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              richer than {comparison.percentile.toFixed(1)}% of your peers
            </p>
          </div>

          <PercentileGauge percentile={comparison.percentile} />

          <p className="mt-4 text-center text-sm font-semibold text-stone-600">
            That&apos;s{" "}
            <span className="font-black text-board-deep">
              {comparison.multipleOfMedian >= 1
                ? `${comparison.multipleOfMedian.toFixed(1)}×`
                : `${(comparison.multipleOfMedian * 100).toFixed(0)}% of`}
            </span>{" "}
            the median ({formatMoney(comparison.median, { compact: true })}).
          </p>

          <div className="mt-5 space-y-2">
            <p className="label">Milestones for your age</p>
            {comparison.tiers.map((tier) => {
              const reached = totalValue >= tier.value;
              return (
                <div
                  key={tier.label}
                  className={`flex items-center justify-between rounded-md border-2 border-monoink px-3 py-2 text-sm ${
                    reached ? "bg-cream" : "bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-3.5 w-3.5 rounded-sm border-2 border-monoink ${TIER_COLORS[tier.label] ?? "bg-stone-300"}`}
                    />
                    <span className="font-bold">{tier.label}</span>
                    <span>{reached ? "✅" : "🔒"}</span>
                  </span>
                  <span className="font-black text-stone-700">
                    {formatMoney(tier.value, { compact: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm font-semibold text-stone-500">
          Tell us your birth year to see where you rank against your age group
          across the UK.
        </p>
      )}

      {regionComparison && (
        <div className="mt-6 border-t-2 border-dashed border-black/20 pt-5">
          <p className="label">Your region</p>
          <div className="rounded-md border-2 border-monoink bg-white px-3 py-3">
            <p className="text-sm font-semibold text-stone-600">
              📍 In <span className="font-black">{regionComparison.region}</span>{" "}
              you&apos;re in the{" "}
              <span className="font-black text-monored">
                {regionComparison.topLabel.toLowerCase()}
              </span>
              {" — "}richer than {regionComparison.percentile.toFixed(0)}% of
              households.
            </p>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              Regional median:{" "}
              {formatMoney(regionComparison.median, { compact: true })} · you
              have{" "}
              {regionComparison.multipleOfMedian >= 1
                ? `${regionComparison.multipleOfMedian.toFixed(1)}× that`
                : `${(regionComparison.multipleOfMedian * 100).toFixed(0)}% of that`}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 border-t-2 border-dashed border-black/20 pt-5">
        <p className="label">Your details</p>
        <ProfileForm birthYear={birthYear} region={region} />
      </div>

      <p className="mt-4 text-[10px] leading-snug text-stone-400">
        Source: {WEALTH_SOURCE}.
      </p>
    </section>
  );
}
