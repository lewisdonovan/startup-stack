import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="shell">
      <h1 className="step-title mb-3">Check your email</h1>
      <div className="card space-y-3">
        <p>
          A magic link was sent
          {params.email ? (
            <>
              {" "}
              to <strong>{params.email}</strong>
            </>
          ) : (
            " to your inbox"
          )}
          .
        </p>
        <p className="muted text-sm">
          Local Docker: open{" "}
          <a href="http://localhost:8025" target="_blank" rel="noreferrer">
            Mailpit
          </a>{" "}
          to click the link.
        </p>
        <Link href="/auth/signin" className="btn btn-ghost">
          Back
        </Link>
      </div>
    </main>
  );
}
