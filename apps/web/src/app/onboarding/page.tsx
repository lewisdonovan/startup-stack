"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CatalogService = {
  id: string;
  name: string;
  purpose: string;
  required: boolean;
  selectable: boolean;
  alwaysActive: boolean;
  effectiveConnectMode: string;
};

export default function OnboardingSelectPage() {
  const router = useRouter();
  const [services, setServices] = useState<CatalogService[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(["openrouter"]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [catRes, wsRes] = await Promise.all([
        fetch("/api/catalog"),
        fetch("/api/workspace/services"),
      ]);
      if (wsRes.status === 401) {
        router.push("/auth/signin");
        return;
      }
      const cat = await catRes.json();
      const ws = await wsRes.json();
      setServices(cat.selectable || []);
      const existing = new Set<string>(
        (ws.services || [])
          .map((s: { serviceId: string }) => s.serviceId)
          .filter((id: string) => id !== "context7"),
      );
      if (existing.size === 0) existing.add("openrouter");
      setSelected(existing);
      setLoading(false);
    }
    void load();
  }, [router]);

  const ordered = useMemo(
    () =>
      [...services].sort((a, b) => Number(b.required) - Number(a.required)),
    [services],
  );

  function toggle(id: string, required: boolean) {
    if (required) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      next.add("openrouter");
      return next;
    });
  }

  async function continueNext() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/workspace/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceIds: [...selected] }),
      });
      if (!res.ok) throw new Error("Could not save selection");
      const data = await res.json();
      const pending = (data.services || []).find(
        (s: { status: string; serviceId: string }) =>
          s.status !== "ready" && s.serviceId !== "context7",
      );
      if (pending) {
        router.push(`/onboarding/connect/${pending.serviceId}`);
      } else {
        router.push("/onboarding/review");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <p className="muted">Loading services…</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="muted mb-2 text-sm">Step 1 of 3</p>
      <h1 className="step-title mb-2">Choose your services</h1>
      <p className="muted mb-8 text-sm">
        OpenRouter is required. Context7 is always included. Select anything
        else you want wired into your agent workspace.
      </p>

      <div className="space-y-3">
        {ordered.map((s) => {
          const checked = selected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id, s.required)}
              className="card w-full text-left transition"
              style={{
                borderColor: checked ? "var(--accent)" : undefined,
                background: checked ? "var(--accent-soft)" : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.required && <span className="badge">Required</span>}
                    <span className="badge">{s.effectiveConnectMode}</span>
                  </div>
                  <p className="muted mt-1 text-sm">{s.purpose}</p>
                </div>
                <span className="text-lg" aria-hidden>
                  {checked ? "✓" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving}
          onClick={() => void continueNext()}
        >
          {saving ? "Saving…" : "Continue"}
        </button>
        <Link href="/" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </main>
  );
}
