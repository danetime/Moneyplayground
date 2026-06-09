"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/visualize";

type AssetType = "property" | "pension" | "cash" | "other";

type Asset = {
  id: string;
  type: AssetType;
  name: string;
  value: number;
  debt: number;
};

const TYPE_META: Record<AssetType, { label: string; icon: string; color: string }> = {
  property: { label: "Property", icon: "🏠", color: "bg-deed-orange" },
  pension:  { label: "Pension",  icon: "🏦", color: "bg-deed-blue"   },
  cash:     { label: "Cash",     icon: "💷", color: "bg-deed-green"  },
  other:    { label: "Other",    icon: "📦", color: "bg-deed-sky"    },
};

export default function AssetsPanel({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [type, setType]   = useState<AssetType>("property");
  const [name, setName]   = useState("");
  const [value, setValue] = useState("");
  const [debt, setDebt]   = useState("");
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addAsset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name: name.trim(),
        value: Number(value),
        debt: debt ? Number(debt) : 0,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't add that asset.");
      return;
    }
    setName("");
    setValue("");
    setDebt("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="card">
      <div className="deed-bar bg-deed-orange">Other Assets</div>
      <h2 className="mono-title text-xl">Property, pensions &amp; cash</h2>

      <form onSubmit={addAsset} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[auto_2fr_1fr]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssetType)}
            className="input"
          >
            {(Object.entries(TYPE_META) as [AssetType, (typeof TYPE_META)[AssetType]][]).map(
              ([key, meta]) => (
                <option key={key} value={key}>
                  {meta.icon} {meta.label}
                </option>
              ),
            )}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "property" ? "e.g. Main home" :
              type === "pension"  ? "e.g. Work pension (Vanguard)" :
              type === "cash"     ? "e.g. Easy-access savings" :
              "e.g. Car, crypto…"
            }
            className="input"
            maxLength={100}
            required
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value (£)"
            type="number"
            step="any"
            min="0"
            className="input"
            required
          />
        </div>
        {type === "property" && (
          <div>
            <input
              value={debt}
              onChange={(e) => setDebt(e.target.value)}
              placeholder="Outstanding mortgage (£) — leave blank if none"
              type="number"
              step="any"
              min="0"
              className="input w-full sm:w-1/2"
            />
          </div>
        )}
        <button type="submit" disabled={busy} className="btn-gold">
          {busy ? "Adding…" : "Add asset"}
        </button>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </form>

      <div className="mt-5">
        {assets.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/15 py-8 text-center text-sm text-stone-500">
            No other assets yet. Add property, a pension or cash above.
          </p>
        ) : (
          <ul className="divide-y divide-black/10">
            {assets.map((a) => {
              const meta = TYPE_META[a.type as AssetType] ?? TYPE_META.other;
              const net = a.value - a.debt;
              return (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${meta.color}`}
                  >
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.name}</p>
                    <p className="text-xs text-stone-500">
                      {meta.label}
                      {a.debt > 0 && (
                        <>
                          {" · "}
                          {formatMoney(a.value)} value
                          {" − "}
                          {formatMoney(a.debt)} mortgage
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(net)}</p>
                    {a.debt > 0 && (
                      <p className="text-xs text-stone-500">equity</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(a.id)}
                    className="ml-1 rounded-lg p-2 text-stone-500 transition hover:bg-rose-100 hover:text-rose-700"
                    aria-label={`Remove ${a.name}`}
                    title="Remove"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
