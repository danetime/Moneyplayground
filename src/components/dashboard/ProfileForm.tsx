"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, type CountryCode } from "@/lib/wealth";

export default function ProfileForm({
  birthYear,
  country,
}: {
  birthYear: number | null;
  country: CountryCode;
}) {
  const router = useRouter();
  const [year, setYear] = useState(birthYear ? String(birthYear) : "");
  const [code, setCode] = useState<CountryCode>(country);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthYear: year ? Number(year) : null,
        country: code,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="birthYear">
            Birth year
          </label>
          <input
            id="birthYear"
            type="number"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="1995"
            min={1900}
            max={new Date().getFullYear() - 13}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="country">
            Country
          </label>
          <select
            id="country"
            value={code}
            onChange={(e) => setCode(e.target.value as CountryCode)}
            className="input"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
      <button type="submit" disabled={saving} className="btn-ghost w-full">
        {saving ? "Saving…" : "Update comparison"}
      </button>
    </form>
  );
}
