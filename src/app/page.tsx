import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const FEATURES = [
  {
    emoji: "🪙",
    title: "Piles of gold",
    body: "See your portfolio reimagined as troy ounces, kilos and stacks of 400oz bars.",
    color: "bg-deed-yellow",
  },
  {
    emoji: "💎",
    title: "Diamonds & supercars",
    body: "How many carats is that? Which car could you drive off the lot today?",
    color: "bg-deed-blue",
  },
  {
    emoji: "📊",
    title: "How rich, really?",
    body: "See if you're top 25%, 10%, 5% or 1% for your age, using real ONS data.",
    color: "bg-deed-green",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <span className="rounded-md border-[3px] border-monoink bg-monored px-3 py-1.5 text-lg font-black uppercase tracking-tight text-white shadow-deed-sm">
          💰 Money Playground
        </span>
        <Link href={session ? "/dashboard" : "/login"} className="btn-ghost">
          {session ? "Open board" : "Sign in"}
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="mb-5 rounded-md border-[3px] border-monoink bg-cream px-4 py-1.5 text-xs font-black uppercase tracking-widest text-monored shadow-deed-sm">
          ★ Your net worth, but fun ★
        </p>
        <h1 className="mono-title max-w-3xl text-balance text-5xl leading-[1.05] text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)] sm:text-6xl">
          See your wealth in <span className="text-deed-yellow">gold</span>,{" "}
          <span className="text-deed-sky">diamonds</span> and supercars.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg font-semibold text-cream">
          Add your stocks, watch your total grow, and find out how you really
          stack up against people your age across the UK.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="btn-gold px-6 py-3 text-base"
          >
            {session ? "Open your board →" : "Get started — it's free →"}
          </Link>
          <a href="#how" className="btn-ghost px-6 py-3 text-base">
            How it works
          </a>
        </div>
      </section>

      <section id="how" className="grid gap-5 pb-20 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className={`deed-bar ${f.color} ${f.color === "bg-deed-yellow" ? "!text-monoink" : ""}`}>
              {f.title}
            </div>
            <div className="text-4xl">{f.emoji}</div>
            <h3 className="mono-title mt-3 text-lg">{f.title}</h3>
            <p className="mt-1.5 text-sm font-semibold text-stone-600">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t-2 border-dashed border-white/30 py-6 text-center text-xs font-semibold text-cream/80">
        Money Playground · For entertainment, not financial advice · Prices and
        wealth figures are illustrative · Not affiliated with Monopoly or Hasbro.
      </footer>
    </main>
  );
}
