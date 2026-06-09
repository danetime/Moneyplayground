import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { getQuote } from "@/lib/quotes";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const holdings = await prisma.holding.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ holdings });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { symbol?: string; shares?: number; costBasis?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const symbol = body.symbol?.trim().toUpperCase();
  const shares = Number(body.shares);

  if (!symbol || !/^[A-Z0-9.\-]{1,10}$/.test(symbol)) {
    return NextResponse.json(
      { error: "Enter a valid ticker symbol" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(shares) || shares <= 0) {
    return NextResponse.json(
      { error: "Shares must be a positive number" },
      { status: 400 },
    );
  }

  // Validate against live data: any real ticker is accepted. Falls back to
  // the built-in universe when offline.
  const quote = await getQuote(symbol);
  if (!quote) {
    return NextResponse.json(
      { error: `Couldn't find a stock with ticker "${symbol}"` },
      { status: 400 },
    );
  }

  const costBasis =
    body.costBasis === null || body.costBasis === undefined
      ? null
      : Number(body.costBasis);

  // Upsert: adding a symbol you already hold increases the share count.
  const existing = await prisma.holding.findUnique({
    where: { userId_symbol: { userId, symbol } },
  });

  const holding = existing
    ? await prisma.holding.update({
        where: { id: existing.id },
        data: {
          shares: existing.shares + shares,
          costBasis: costBasis ?? existing.costBasis,
        },
      })
    : await prisma.holding.create({
        data: { userId, symbol, shares, costBasis },
      });

  return NextResponse.json({ holding }, { status: 201 });
}
