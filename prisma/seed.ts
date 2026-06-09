import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // A demo user with a starter portfolio, so the dashboard has something to
  // show before you add your own holdings. Sign in with this email via the
  // demo login to see it.
  const email = "demo@moneyplayground.app";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Tycoon",
      birthYear: 2002,
      country: "UK",
    },
  });

  const holdings: { symbol: string; shares: number; costBasis: number }[] = [
    { symbol: "AAPL", shares: 120, costBasis: 150 },
    { symbol: "MSFT", shares: 40, costBasis: 300 },
    { symbol: "NVDA", shares: 200, costBasis: 60 },
    { symbol: "VTI", shares: 80, costBasis: 220 },
    { symbol: "TSLA", shares: 25, costBasis: 270 },
  ];

  for (const h of holdings) {
    await prisma.holding.upsert({
      where: { userId_symbol: { userId: user.id, symbol: h.symbol } },
      update: { shares: h.shares, costBasis: h.costBasis },
      create: { userId: user.id, ...h },
    });
  }

  console.log(`Seeded demo user (${email}) with ${holdings.length} holdings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
