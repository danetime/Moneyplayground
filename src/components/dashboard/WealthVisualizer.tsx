import {
  formatNumber,
  formatMoney,
  type GoldView,
  type DiamondView,
  type CarView,
  type HouseView,
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
      <p className="text-sm text-stone-500">
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
        <span className="self-center pl-2 text-sm font-semibold text-stone-500">
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
  houses,
  sausageRolls,
}: {
  totalValue: number;
  gold: GoldView;
  diamonds: DiamondView;
  cars: CarView;
  houses: HouseView;
  sausageRolls: number;
}) {
  if (totalValue <= 0) {
    return (
      <section className="card text-center">
        <div className="text-4xl">🪙</div>
        <h2 className="mt-3 text-lg font-bold">Your treasure awaits</h2>
        <p className="mt-1 text-sm text-stone-500">
          Add a holding and watch your gold, diamonds and supercars appear.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="mono-title text-sm tracking-widest text-board-deep">
        What that looks like
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Gold */}
        <div className="card animate-fade-up">
          <div className="deed-bar bg-deed-yellow !text-monoink">Gold Reserve</div>
          <div className="flex items-baseline justify-between">
            <h3 className="mono-title text-lg">🪙 Piles of gold</h3>
            <span className="text-xs font-bold text-stone-500">
              {gold.live ? "" : "~"}
              {formatMoney(gold.pricePerOz, { compact: true })}/oz
              {gold.live && (
                <span className="ml-1 text-emerald-700">● live</span>
              )}
            </span>
          </div>
          <p className="mt-2 text-3xl font-black gold-text">
            {formatNumber(gold.kilograms)} kg
          </p>
          <p className="text-sm text-stone-500">
            {formatNumber(gold.ounces)} troy oz ·{" "}
            {gold.tonnes >= 0.01
              ? `${formatNumber(gold.tonnes, 2)} tonnes`
              : `${formatNumber(gold.bars, 1)} bars`}
          </p>
          <div className="mt-4">
            <IconPile count={Math.max(gold.bars, gold.kilograms)} emoji="🟨" />
            <p className="mt-2 text-xs text-stone-500">
              Each bar ≈ a 400oz Good Delivery brick.
            </p>
          </div>
        </div>

        {/* Diamonds */}
        <div className="card animate-fade-up">
          <div className="deed-bar bg-deed-blue">Jewel Vault</div>
          <div className="flex items-baseline justify-between">
            <h3 className="mono-title text-lg">💎 Diamonds</h3>
            <span className="text-xs font-bold text-stone-500">~£4k/carat</span>
          </div>
          <p className="mt-2 text-3xl font-black text-deed-blue">
            {formatNumber(diamonds.carats)} ct
          </p>
          <p className="text-sm text-stone-500">
            {formatNumber(diamonds.stones, 0)} one-carat stones
          </p>
          <div className="mt-4">
            <IconPile count={diamonds.stones} emoji="💎" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Houses */}
        <div className="card animate-fade-up">
          <div className="deed-bar bg-deed-red">Property Ladder</div>
          <div className="flex items-baseline justify-between">
            <h3 className="mono-title text-lg">🏠 Houses</h3>
            <span className="text-xs font-bold text-stone-500">
              avg {formatMoney(houses.price, { compact: true })} in {houses.where}
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-deed-red">
            {formatNumber(houses.count, houses.count >= 10 ? 0 : 1)} homes
          </p>
          <p className="text-sm text-stone-500">
            bought outright in {houses.where}
          </p>
          <div className="mt-4">
            <IconPile count={houses.count} emoji="🏠" />
            <p className="mt-2 text-xs text-stone-500">
              Or {formatNumber(houses.northEastCount, 1)} in the North East ·{" "}
              {formatNumber(houses.londonCount, 1)} in London
            </p>
          </div>
        </div>

        {/* Greggs */}
        <div className="card animate-fade-up">
          <div className="deed-bar bg-deed-orange">Greggs Counter</div>
          <div className="flex items-baseline justify-between">
            <h3 className="mono-title text-lg">🥐 Sausage rolls</h3>
            <span className="text-xs font-bold text-stone-500">£1.35 each</span>
          </div>
          <p className="mt-2 text-3xl font-black text-deed-orange">
            {formatNumber(sausageRolls, 0)}
          </p>
          <p className="text-sm text-stone-500">
            Greggs sausage rolls — about{" "}
            {formatNumber(sausageRolls / 365, 0)} a day for a year
          </p>
          <div className="mt-4">
            <IconPile count={Math.min(sausageRolls, 999_999)} emoji="🥐" max={30} />
            <p className="mt-2 text-xs text-stone-500">
              The one true unit of British wealth.
            </p>
          </div>
        </div>
      </div>

      {/* Cars */}
      <div className="card animate-fade-up">
        <div className="deed-bar bg-deed-green">Motor Works</div>
        <h3 className="mono-title text-lg">🏎️ Cars you could buy</h3>
        {cars.best ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-sm text-stone-500">Top pick, paid in full</p>
              <p className="text-2xl font-black">
                {cars.best.count > 1 && (
                  <span className="gold-text">{cars.best.count}× </span>
                )}
                {cars.best.car.emoji} {cars.best.car.name}
              </p>
              <p className="text-sm text-stone-500">
                {formatMoney(cars.best.car.price, { compact: true })} each
              </p>
            </div>
            <div className="h-10 w-px bg-black/5" />
            <div>
              <p className="text-sm text-stone-500">Or, in Honda Civics</p>
              <p className="text-2xl font-black text-monoink">
                {formatNumber(cars.everyman.count, 1)} 🚙
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">
            Not enough for a car yet — but you&apos;re{" "}
            {formatNumber(cars.everyman.count * 100, 0)}% of the way to a Civic.
          </p>
        )}
      </div>
    </section>
  );
}
