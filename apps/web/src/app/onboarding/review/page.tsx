"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type ServiceRow = {
  serviceId: string;
  status: string;
};

function ReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [workspaceStatus, setWorkspaceStatus] = useState<string>("");
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [wsRes, catRes] = await Promise.all([
        fetch("/api/workspace/services"),
        fetch("/api/catalog"),
      ]);
      if (wsRes.status === 401) {
        router.push("/auth/signin");
        return;
      }
      const ws = await wsRes.json();
      const cat = await catRes.json();
      const nameMap: Record<string, string> = {};
      for (const s of cat.services || []) nameMap[s.id] = s.name;
      setNames(nameMap);
      setServices(ws.services || []);
      setWorkspaceStatus(ws.workspace?.status || "");
      setLoading(false);
    }
    void load();
  }, [router]);

  const allReady =
    services.length > 0 &&
    services.every((s) => s.status === "ready");

  async function download() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/workspace/export", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");
      window.location.href = data.downloadUrl;
      setExporting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <p className="muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="muted mb-2 text-sm">Step 3 of 3 · Review</p>
      <h1 className="step-title mb-2">Almost there</h1>
      <p className="muted mb-6 text-sm">
        Confirm every selected service is connected. Then download a one-time
        zip of your agent workspace (keys included; link expires in 10 minutes).
      </p>

      {searchParams.get("connected") && (
        <p className="mb-4 text-sm" style={{ color: "var(--success)" }}>
          Connected {searchParams.get("connected")}.
        </p>
      )}

      <div className="card mb-6 space-y-3">
        {services.map((s) => (
          <div
            key={s.serviceId}
            className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="font-medium">
                {names[s.serviceId] || s.serviceId}
              </p>
              <p className="muted text-xs">{s.status}</p>
            </div>
            {s.status === "ready" ? (
              <span style={{ color: "var(--success)" }}>Ready</span>
            ) : (
              <Link
                href={`/onboarding/connect/${s.serviceId}`}
                className="btn btn-ghost"
              >
                Connect
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="muted mb-4 text-xs">Workspace status: {workspaceStatus}</p>

      {error && (
        <p className="mb-4 text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!allReady || exporting}
          onClick={() => void download()}
        >
          {exporting ? "Preparing…" : "Download workspace zip"}
        </button>
        <Link href="/onboarding" className="btn btn-ghost">
          Edit services
        </Link>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="shell">
          <p className="muted">Loading…</p>
        </main>
      }
    >
      <ReviewInner />
    </Suspense>
  );
}
