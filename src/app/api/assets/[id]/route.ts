import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.asset.deleteMany({ where: { id: params.id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; value?: number; debt?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { name?: string; value?: number; debt?: number } = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name || name.length > 100) {
      return NextResponse.json({ error: "Asset name is required (max 100 chars)" }, { status: 400 });
    }
    data.name = name;
  }
  if (body.value !== undefined) {
    const value = Number(body.value);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: "Value must be a positive number" }, { status: 400 });
    }
    data.value = value;
  }
  if (body.debt !== undefined) {
    const debt = Number(body.debt);
    if (!Number.isFinite(debt) || debt < 0) {
      return NextResponse.json({ error: "Debt must be a positive number" }, { status: 400 });
    }
    data.debt = debt;
  }

  const result = await prisma.asset.updateMany({ where: { id: params.id, userId }, data });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
