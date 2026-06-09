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
      <Link href="/" className="text-lg font-extrabold tracking-tight">
        💰 Money <span className="gold-text">Playground</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-300 sm:inline">
          Hey, <span className="font-semibold text-slate-100">{firstName}</span>
        </span>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-8 w-8 rounded-full border border-white/15"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold-light">
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
