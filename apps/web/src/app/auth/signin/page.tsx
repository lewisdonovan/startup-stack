"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, companyName, email }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not save profile");
        }
      }

      const result = await signIn("nodemailer", {
        email,
        redirect: false,
        callbackUrl: "/onboarding",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <main className="shell">
      <Link href="/" className="muted mb-8 inline-block text-sm">
        ← Startup Stack
      </Link>
      <h1 className="step-title mb-2">
        {mode === "signup" ? "Create your account" : "Sign in"}
      </h1>
      <p className="muted mb-8 text-sm">
        We&apos;ll email you a magic link. Check Mailpit at{" "}
        <a href="http://localhost:8025" target="_blank" rel="noreferrer">
          localhost:8025
        </a>{" "}
        when running locally.
      </p>

      <form onSubmit={onSubmit} className="card space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="label" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label" htmlFor="company">
                Company name
              </label>
              <input
                id="company"
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                autoComplete="organization"
              />
            </div>
          </>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Sending link…" : "Email me a magic link"}
        </button>

        <button
          type="button"
          className="btn btn-ghost w-full"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      </form>
    </main>
  );
}
