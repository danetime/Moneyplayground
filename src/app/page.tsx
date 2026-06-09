import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const FEATURES = [
  {
    emoji: "🪙",
    title: "Piles of gold",
    body: "See your portfolio reimagined as troy ounces, kilos and stacks of 400oz bars.",
  },
  {
    emoji: "💎",
    title: "Diamonds & supercars",
    body: "How many carats is that? Which car could you drive off the lot today?",
  },
  {
    emoji: "📊",
    title: "How rich, really?",
    body: "See if you're top 25%, 10%, 5% or 1% for your age — at home and worldwide.",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-extrabold tracking-tight">
          💰 Money <span className="gold-text">Playground</span>
        </span>
        <Link
          href={session ? "/dashboard" : "/login"}
          className="btn-ghost"
        >
          {session ? "Open dashboard" : "Sign in"}
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="mb-4 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-light">
          Your net worth, but fun
        </p>
        <h1 className="max-w-3xl text-balance text-5xl font-black leading-tight tracking-tight sm:text-6xl">
          See your wealth in <span className="gold-text">gold, diamonds</span>{" "}
          and supercars.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg text-slate-300">
          Add your stocks, watch your total grow, and find out how you really
          stack up against people your age — in your country and across the
          whole world.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="btn-gold px-6 py-3 text-base"
          >
            {session ? "Open your dashboard →" : "Get started — it's free →"}
          </Link>
          <a href="#how" className="btn-ghost px-6 py-3 text-base">
            See how it works
          </a>
        </div>
      </section>

      <section id="how" className="grid gap-5 pb-20 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl">{f.emoji}</div>
            <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        Money Playground · For entertainment, not financial advice · Prices and
        wealth figures are illustrative.
      </footer>
    </main>
  );
}
