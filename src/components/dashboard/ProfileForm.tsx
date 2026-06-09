"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({
  birthYear,
}: {
  birthYear: number | null;
}) {
  const router = useRouter();
  const [year, setYear] = useState(birthYear ? String(birthYear) : "");
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
      {error && <p className="text-xs text-rose-700">{error}</p>}
      <button type="submit" disabled={saving} className="btn-ghost w-full">
        {saving ? "Saving…" : "Update comparison"}
      </button>
    </form>
  );
}
