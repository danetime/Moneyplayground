import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuotes } from "@/lib/quotes";
import {
  ageToBracket,
  compareWealth,
  type CountryCode,
} from "@/lib/wealth";
import { toGold, toDiamonds, toCars } from "@/lib/visualize";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import WealthVisualizer from "@/components/dashboard/WealthVisualizer";
import ComparisonCard from "@/components/dashboard/ComparisonCard";
import HoldingsPanel from "@/components/dashboard/HoldingsPanel";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { holdings: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");

  // Price each holding with live quotes (mock fallback when offline).
  const quotes = await getQuotes(user.holdings.map((h) => h.symbol));
  const enriched = user.holdings.map((h) => {
    const quote = quotes[h.symbol.toUpperCase()];
    const price = quote?.price ?? 0;
    const value = price * h.shares;
    const cost = h.costBasis != null ? h.costBasis * h.shares : null;
    return {
      id: h.id,
      symbol: h.symbol,
      name: quote?.name ?? h.symbol,
      shares: h.shares,
      price,
      value,
      costBasis: h.costBasis,
      gain: cost != null ? value - cost : null,
      gainPct: cost && cost > 0 ? ((value - cost) / cost) * 100 : null,
      dayChangePct: quote?.changePct ?? null,
      dayChange: quote?.change != null ? quote.change * h.shares : null,
    };
  });

  const pricesLive = Object.values(quotes).some((q) => q.source !== "mock");
  const dayChangeTotal = enriched.reduce(
    (sum, h) => sum + (h.dayChange ?? 0),
    0,
  );
  const hasDayChange = enriched.some((h) => h.dayChange != null);

  const totalValue = enriched.reduce((sum, h) => sum + h.value, 0);
  const totalCost = enriched.reduce(
    (sum, h) => sum + (h.costBasis != null ? h.costBasis * h.shares : 0),
    0,
  );
  const totalGain = totalCost > 0 ? totalValue - totalCost : null;

  const gold = toGold(totalValue);
  const diamonds = toDiamonds(totalValue);
  const cars = toCars(totalValue);

  const country = (user.country as CountryCode) ?? "US";
  const currentYear = new Date().getFullYear();
  const age = user.birthYear ? currentYear - user.birthYear : null;
  const comparison =
    age != null
      ? compareWealth(totalValue, ageToBracket(age), country)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      <DashboardHeader
        name={user.name ?? user.email ?? "there"}
        image={user.image}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PortfolioSummary
            totalValue={totalValue}
            totalGain={totalGain}
            holdingsCount={enriched.length}
            pricesLive={pricesLive}
            dayChange={hasDayChange ? dayChangeTotal : null}
          />
          <WealthVisualizer
            totalValue={totalValue}
            gold={gold}
            diamonds={diamonds}
            cars={cars}
          />
          <HoldingsPanel holdings={enriched} />
        </div>

        <div className="space-y-6">
          <ComparisonCard
            comparison={comparison}
            birthYear={user.birthYear}
            country={country}
            totalValue={totalValue}
          />
        </div>
      </div>
    </div>
  );
}
