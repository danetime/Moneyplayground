import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const VALID_TYPES = ["property", "pension", "cash", "other"] as const;
type AssetType = (typeof VALID_TYPES)[number];

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ assets });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { type?: string; name?: string; value?: number; debt?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type as AssetType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Asset name is required (max 100 chars)" }, { status: 400 });
  }

  const value = Number(body.value);
  if (!Number.isFinite(value) || value < 0) {
    return NextResponse.json({ error: "Value must be a positive number" }, { status: 400 });
  }

  const debt = Number(body.debt ?? 0);
  if (!Number.isFinite(debt) || debt < 0) {
    return NextResponse.json({ error: "Debt must be a positive number" }, { status: 400 });
  }

  const asset = await prisma.asset.create({
    data: { userId, type, name, value, debt },
  });
  return NextResponse.json({ asset }, { status: 201 });
}
