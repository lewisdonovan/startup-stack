import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="shell">
      <h1 className="step-title mb-3">Sign-in error</h1>
      <div className="card space-y-3">
        <p className="muted text-sm">{params.error || "Something went wrong."}</p>
        <Link href="/auth/signin" className="btn btn-primary">
          Try again
        </Link>
      </div>
    </main>
  );
}
