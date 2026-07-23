import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="shell">
      <p className="badge mb-6">Local-first · SaaS-ready</p>
      <h1 className="step-title mb-3">Startup Stack</h1>
      <p className="muted mb-10 max-w-xl text-base leading-relaxed">
        Select your tools, connect accounts, store API keys securely, and
        download a plug-and-play agent workspace for Claude Code, Cursor, or any
        MCP harness.
      </p>

      <div className="card space-y-4">
        {session?.user ? (
          <>
            <p>
              Signed in as <strong>{session.user.email}</strong>
              {session.user.companyName ? (
                <> · {session.user.companyName}</>
              ) : null}
            </p>
            <Link href="/onboarding" className="btn btn-primary">
              Continue onboarding
            </Link>
          </>
        ) : (
          <>
            <p className="muted text-sm">
              Create an account with a magic link — no password required.
            </p>
            <div className="flex gap-3">
              <Link href="/auth/signin" className="btn btn-primary">
                Get started
              </Link>
              <Link href="/auth/signin" className="btn btn-ghost">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
