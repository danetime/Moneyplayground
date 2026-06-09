import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const devEnabled = process.env.ENABLE_DEV_LOGIN === "true";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link
        href="/"
        className="mx-auto mb-8 rounded-md border-[3px] border-monoink bg-monored px-4 py-2 text-lg font-black uppercase tracking-tight text-white shadow-deed-sm"
      >
        💰 Money Playground
      </Link>
      <div className="card">
        <div className="deed-bar bg-board-deep">Pass GO</div>
        <h1 className="mono-title text-2xl">Welcome in</h1>
        <p className="mt-1 text-sm font-semibold text-stone-500">
          Sign in to start building your portfolio.
        </p>
        <div className="mt-6">
          <LoginForm googleEnabled={googleEnabled} devEnabled={devEnabled} />
        </div>
      </div>
      <p className="mt-6 text-center text-xs font-semibold text-cream/80">
        For entertainment only. Not financial advice.
      </p>
    </main>
  );
}
