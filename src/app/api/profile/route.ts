import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { COUNTRIES } from "@/lib/wealth";

const VALID_COUNTRIES = new Set(COUNTRIES.map((c) => c.code));

export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { birthYear?: number | null; country?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { birthYear?: number | null; country?: string } = {};

  if (body.birthYear !== undefined) {
    if (body.birthYear === null) {
      data.birthYear = null;
    } else {
      const year = Number(body.birthYear);
      const thisYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1900 || year > thisYear - 13) {
        return NextResponse.json(
          { error: "Enter a valid birth year" },
          { status: 400 },
        );
      }
      data.birthYear = year;
    }
  }

  if (body.country !== undefined) {
    if (!VALID_COUNTRIES.has(body.country as never)) {
      return NextResponse.json({ error: "Unsupported country" }, { status: 400 });
    }
    data.country = body.country;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { birthYear: true, country: true },
  });
  return NextResponse.json({ user });
}
