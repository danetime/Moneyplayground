import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { isRegion } from "@/lib/wealth";

export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { birthYear?: number | null; region?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { birthYear?: number | null; region?: string | null } = {};

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

  if (body.region !== undefined) {
    if (body.region === null || body.region === "") {
      data.region = null;
    } else if (isRegion(body.region)) {
      data.region = body.region;
    } else {
      return NextResponse.json(
        { error: "Choose a valid region" },
        { status: 400 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { birthYear: true, region: true },
  });
  return NextResponse.json({ user });
}
