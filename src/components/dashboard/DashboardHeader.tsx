"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function DashboardHeader({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const firstName = name.split(" ")[0].split("@")[0];

  return (
    <header className="flex items-center justify-between py-6">
      <Link
        href="/"
        className="rounded-md border-[3px] border-monoink bg-monored px-3 py-1.5 text-lg font-black uppercase tracking-tight text-white shadow-deed-sm"
      >
        💰 Money Playground
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-semibold text-cream sm:inline">
          Hey, <span className="font-black text-white">{firstName}</span>
        </span>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-9 w-9 rounded-full border-[3px] border-monoink"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-monoink bg-cream text-sm font-black text-monored">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-ghost px-3 py-2 text-xs"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
