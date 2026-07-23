import { NextResponse } from "next/server";
import path from "node:path";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { ServiceId } from "@startup-stack/catalog";
import { buildWorkspaceZip } from "@startup-stack/workspace-gen";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  exportTokens,
  users,
  workspaceServices,
  workspaces,
} from "@/db/schema";
import { hashToken } from "@/lib/crypto";
import { decryptWorkspaceSecrets } from "@/lib/workspace";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await context.params;
  const tokenHash = hashToken(token);

  const row = await db.query.exportTokens.findFirst({
    where: and(
      eq(exportTokens.tokenHash, tokenHash),
      isNull(exportTokens.usedAt),
      gt(exportTokens.expiresAt, new Date()),
    ),
  });

  if (!row) {
    return NextResponse.json(
      { error: "Invalid or expired download token" },
      { status: 410 },
    );
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, row.workspaceId),
  });
  if (!workspace || workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark used immediately (single-use)
  await db
    .update(exportTokens)
    .set({ usedAt: new Date() })
    .where(eq(exportTokens.id, row.id));

  const services = await db.query.workspaceServices.findMany({
    where: eq(workspaceServices.workspaceId, workspace.id),
  });
  const serviceIds = services.map((s) => s.serviceId as ServiceId);
  const secretsMap = await decryptWorkspaceSecrets(workspace.id);

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const skillsRoot =
    process.env.SKILLS_ROOT ||
    path.resolve(process.cwd(), "../../skills");
  const verifyMcpScriptPath =
    process.env.VERIFY_MCP_SCRIPT ||
    path.resolve(process.cwd(), "../../scripts/verify-mcp.sh");

  const zip = await buildWorkspaceZip({
    slug: workspace.slug,
    companyName: user?.companyName || "Startup",
    userName: user?.name || "Founder",
    serviceIds,
    secrets: secretsMap,
    skillsRoot,
    verifyMcpScriptPath,
  });

  await db
    .update(workspaces)
    .set({ status: "exported", updatedAt: new Date() })
    .where(eq(workspaces.id, workspace.id));

  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="startup-stack-${workspace.slug}.zip"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
