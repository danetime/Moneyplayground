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
      <Link href="/" className="mb-8 text-center text-lg font-extrabold">
        💰 Money <span className="gold-text">Playground</span>
      </Link>
      <div className="card">
        <h1 className="text-2xl font-bold">Welcome in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to start building your portfolio.
        </p>
        <div className="mt-6">
          <LoginForm googleEnabled={googleEnabled} devEnabled={devEnabled} />
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        For entertainment only. Not financial advice.
      </p>
    </main>
  );
}
