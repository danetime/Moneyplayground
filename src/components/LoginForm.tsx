"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm({
  googleEnabled,
  devEnabled,
}: {
  googleEnabled: boolean;
  devEnabled: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("dev", { email, name, callbackUrl: "/dashboard" });
  }

  return (
    <div className="space-y-5">
      {googleEnabled && (
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="btn-ghost w-full py-3"
        >
          <span className="text-lg">G</span> Continue with Google
        </button>
      )}

      {googleEnabled && devEnabled && (
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>
      )}

      {devEnabled && (
        <form onSubmit={handleDevLogin} className="space-y-3">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="name">
              Display name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Money Tycoon"
              className="input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full py-3">
            {loading ? "Signing in…" : "Continue with demo account"}
          </button>
          <p className="text-center text-xs text-slate-500">
            Demo login — no password, for trying the app.
          </p>
        </form>
      )}

      {!googleEnabled && !devEnabled && (
        <p className="text-sm text-amber-300/90">
          No sign-in method is configured. Set <code>GOOGLE_CLIENT_ID</code>/
          <code>GOOGLE_CLIENT_SECRET</code> or <code>ENABLE_DEV_LOGIN=true</code>{" "}
          in your <code>.env</code>.
        </p>
      )}
    </div>
  );
}
