import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Returns the signed-in user's id, or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const id = await getCurrentUserId();
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}
