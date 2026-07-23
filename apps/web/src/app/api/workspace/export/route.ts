import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { exportTokens, workspaces } from "@/db/schema";
import { hashToken, randomToken } from "@/lib/crypto";
import { getOrCreateWorkspace, refreshWorkspaceStatus } from "@/lib/workspace";

const TTL_MS = 10 * 60 * 1000;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getOrCreateWorkspace(
    session.user.id,
    session.user.companyName,
  );
  if (workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ready = await refreshWorkspaceStatus(workspace.id);
  if (!ready) {
    return NextResponse.json(
      { error: "Not all services are ready" },
      { status: 400 },
    );
  }

  const token = randomToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TTL_MS);

  await db.insert(exportTokens).values({
    workspaceId: workspace.id,
    tokenHash,
    expiresAt,
  });

  return NextResponse.json({
    token,
    expiresAt: expiresAt.toISOString(),
    downloadUrl: `/api/workspace/export/${token}`,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, session.user.id),
  });
  return NextResponse.json({ workspace });
}
