import {
  formatNumber,
  formatMoney,
  type GoldView,
  type DiamondView,
  type CarView,
} from "@/lib/visualize";

// Render up to `max` emoji icons to represent a count, with a "+N" overflow.
function IconPile({
  count,
  emoji,
  max = 40,
}: {
  count: number;
  emoji: string;
  max?: number;
}) {
  const whole = Math.floor(count);
  const shown = Math.min(whole, max);
  const overflow = whole - shown;
  if (whole < 1) {
    return (
      <p className="text-sm text-slate-500">
        Not quite one yet — keep stacking!
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-0.5 text-2xl leading-none">
      {Array.from({ length: shown }).map((_, i) => (
        <span key={i}>{emoji}</span>
      ))}
      {overflow > 0 && (
        <span className="self-center pl-2 text-sm font-semibold text-slate-400">
          +{formatNumber(overflow, 0)} more
        </span>
      )}
    </div>
  );
}

export default function WealthVisualizer({
  totalValue,
  gold,
  diamonds,
  cars,
}: {
  totalValue: number;
  gold: GoldView;
  diamonds: DiamondView;
  cars: CarView;
}) {
  if (totalValue <= 0) {
    return (
      <section className="card text-center">
        <div className="text-4xl">🪙</div>
        <h2 className="mt-3 text-lg font-bold">Your treasure awaits</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add a holding and watch your gold, diamonds and supercars appear.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        What that looks like
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Gold */}
        <div className="card animate-fade-up">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold">🪙 Piles of gold</h3>
            <span className="text-xs text-slate-500">~£2,600/oz</span>
          </div>
          <p className="mt-2 text-3xl font-black gold-text">
            {formatNumber(gold.kilograms)} kg
          </p>
          <p className="text-sm text-slate-400">
            {formatNumber(gold.ounces)} troy oz ·{" "}
            {gold.tonnes >= 0.01
              ? `${formatNumber(gold.tonnes, 2)} tonnes`
              : `${formatNumber(gold.bars, 1)} bars`}
          </p>
          <div className="mt-4">
            <IconPile count={Math.max(gold.bars, gold.kilograms)} emoji="🟨" />
            <p className="mt-2 text-xs text-slate-500">
              Each bar ≈ a 400oz Good Delivery brick.
            </p>
          </div>
        </div>

        {/* Diamonds */}
        <div className="card animate-fade-up">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold">💎 Diamonds</h3>
            <span className="text-xs text-slate-500">~£4k/carat</span>
          </div>
          <p className="mt-2 text-3xl font-black text-sky-200">
            {formatNumber(diamonds.carats)} ct
          </p>
          <p className="text-sm text-slate-400">
            {formatNumber(diamonds.stones, 0)} one-carat stones
          </p>
          <div className="mt-4">
            <IconPile count={diamonds.stones} emoji="💎" />
          </div>
        </div>
      </div>

      {/* Cars */}
      <div className="card animate-fade-up">
        <h3 className="text-lg font-bold">🏎️ Cars you could buy</h3>
        {cars.best ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-sm text-slate-400">Top pick, paid in full</p>
              <p className="text-2xl font-black">
                {cars.best.count > 1 && (
                  <span className="gold-text">{cars.best.count}× </span>
                )}
                {cars.best.car.emoji} {cars.best.car.name}
              </p>
              <p className="text-sm text-slate-500">
                {formatMoney(cars.best.car.price, { compact: true })} each
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-sm text-slate-400">Or, in Honda Civics</p>
              <p className="text-2xl font-black text-slate-100">
                {formatNumber(cars.everyman.count, 1)} 🚙
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Not enough for a car yet — but you&apos;re{" "}
            {formatNumber(cars.everyman.count * 100, 0)}% of the way to a Civic.
          </p>
        )}
      </div>
    </section>
  );
}
