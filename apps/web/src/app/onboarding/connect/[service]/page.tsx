"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Field = {
  key: string;
  label: string;
  required: boolean;
  placeholder?: string;
  secret?: boolean;
};

type Service = {
  id: string;
  name: string;
  purpose: string;
  instructions: string[];
  envFields: Field[];
  signupUrl?: string;
  apiKeyUrl?: string;
  effectiveConnectMode: string;
  oauthProvider?: string;
};

function ConnectInner() {
  const params = useParams<{ service: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = params.service;

  const [service, setService] = useState<Service | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauth, setOauth] = useState<{ linear: boolean; notion: boolean }>({
    linear: false,
    notion: false,
  });

  const forceFallback =
    searchParams.get("fallback") === "1" ||
    Boolean(searchParams.get("error"));

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      const found = (data.services as Service[]).find((s) => s.id === serviceId);
      if (!found) {
        router.push("/onboarding");
        return;
      }
      setService(found);
      setOauth(data.oauth || {});
      const defaults: Record<string, string> = {};
      for (const f of found.envFields) {
        defaults[f.key] =
          f.key === "NOTION_INTEGRATION_TYPE"
            ? "Internal"
            : f.key === "N8N_BASE_URL"
              ? "http://localhost:5678"
              : "";
      }
      setValues(defaults);
    }
    void load();
  }, [serviceId, router]);

  const showOauth =
    !forceFallback &&
    service?.effectiveConnectMode === "oauth" &&
    service.oauthProvider &&
    oauth[service.oauthProvider as "linear" | "notion"];

  async function saveKeys(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/workspace/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      const wsRes = await fetch("/api/workspace/services");
      const ws = await wsRes.json();
      const next = (ws.services || []).find(
        (s: { status: string; serviceId: string }) =>
          s.status !== "ready" && s.serviceId !== "context7",
      );
      if (next) router.push(`/onboarding/connect/${next.serviceId}`);
      else router.push("/onboarding/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setSaving(false);
    }
  }

  if (!service) {
    return (
      <main className="shell">
        <p className="muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="muted mb-2 text-sm">Step 2 of 3 · Connect</p>
      <h1 className="step-title mb-2">{service.name}</h1>
      <p className="muted mb-6 text-sm">{service.purpose}</p>

      {searchParams.get("error") && (
        <p className="mb-4 text-sm" style={{ color: "var(--danger)" }}>
          OAuth failed ({searchParams.get("error")}). Use the key form below.
        </p>
      )}

      <div className="card mb-6 space-y-3">
        <h2 className="font-medium">Setup instructions</h2>
        <ol className="muted list-decimal space-y-2 pl-5 text-sm">
          {service.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 pt-2">
          {service.signupUrl && (
            <a
              href={service.signupUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Open signup
            </a>
          )}
          {service.apiKeyUrl && (
            <a
              href={service.apiKeyUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Open API keys
            </a>
          )}
        </div>
        {service.id === "n8n" && (
          <div className="mt-2 rounded-lg border border-[var(--border)] p-3 text-sm">
            <p className="mb-2 font-medium">Local n8n</p>
            <p className="muted mb-2">
              From the repo root, start the optional Compose profile:
            </p>
            <pre className="overflow-x-auto rounded bg-black/40 p-3 text-xs">
              docker compose --profile n8n up -d
            </pre>
            <p className="muted mt-2">
              Then open{" "}
              <a href="http://localhost:5678" target="_blank" rel="noreferrer">
                localhost:5678
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {showOauth && (
        <div className="mb-6">
          <a
            href={`/api/oauth/${service.oauthProvider}`}
            className="btn btn-primary"
          >
            Connect with {service.name}
          </a>
          <p className="muted mt-3 text-sm">
            Or paste an API key below if you prefer.
          </p>
        </div>
      )}

      {service.envFields.length > 0 && (
        <form onSubmit={saveKeys} className="card space-y-4">
          <h2 className="font-medium">Enter credentials</h2>
          {service.envFields.map((field) => (
            <div key={field.key}>
              <label className="label" htmlFor={field.key}>
                {field.label}
                {field.required ? "" : " (optional)"}
              </label>
              <input
                id={field.key}
                className="input"
                type={field.secret ? "password" : "text"}
                placeholder={field.placeholder}
                value={values[field.key] || ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                required={field.required}
                autoComplete="off"
              />
            </div>
          ))}
          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save & continue"}
            </button>
            <Link href="/onboarding/review" className="btn btn-ghost">
              Skip to review
            </Link>
          </div>
        </form>
      )}

      {service.envFields.length === 0 && (
        <Link href="/onboarding/review" className="btn btn-primary">
          Continue
        </Link>
      )}
    </main>
  );
}

export default function ConnectServicePage() {
  return (
    <Suspense
      fallback={
        <main className="shell">
          <p className="muted">Loading…</p>
        </main>
      }
    >
      <ConnectInner />
    </Suspense>
  );
}
