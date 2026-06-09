import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Scope the delete to the owner so users can't remove others' holdings.
  const result = await prisma.holding.deleteMany({
    where: { id: params.id, userId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { shares?: number; costBasis?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { shares?: number; costBasis?: number | null } = {};
  if (body.shares !== undefined) {
    const shares = Number(body.shares);
    if (!Number.isFinite(shares) || shares <= 0) {
      return NextResponse.json(
        { error: "Shares must be a positive number" },
        { status: 400 },
      );
    }
    data.shares = shares;
  }
  if (body.costBasis !== undefined) {
    data.costBasis = body.costBasis === null ? null : Number(body.costBasis);
  }

  const result = await prisma.holding.updateMany({
    where: { id: params.id, userId },
    data,
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
