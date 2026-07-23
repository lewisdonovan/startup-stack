import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ServiceId } from "@startup-stack/catalog";
import { getSelectableServices } from "@startup-stack/catalog";
import { auth } from "@/auth";
import { db } from "@/db";
import { workspaceServices, workspaces } from "@/db/schema";
import {
  getOrCreateWorkspace,
  oauthConfigured,
  setWorkspaceServices,
} from "@/lib/workspace";

const selectableIds = getSelectableServices().map((s) => s.id);

const bodySchema = z.object({
  serviceIds: z.array(z.string()).min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getOrCreateWorkspace(
    session.user.id,
    session.user.companyName,
  );
  const services = await db.query.workspaceServices.findMany({
    where: eq(workspaceServices.workspaceId, workspace.id),
  });

  return NextResponse.json({
    workspace,
    services,
    oauth: oauthConfigured(),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const allowed = new Set(selectableIds);
  const serviceIds = parsed.data.serviceIds.filter((id) =>
    allowed.has(id as ServiceId),
  ) as ServiceId[];

  if (!serviceIds.includes("openrouter")) {
    serviceIds.push("openrouter");
  }

  const workspace = await getOrCreateWorkspace(
    session.user.id,
    session.user.companyName,
  );

  // Ensure workspace belongs to user
  if (workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await setWorkspaceServices(workspace.id, serviceIds);

  const updated = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspace.id),
  });
  const services = await db.query.workspaceServices.findMany({
    where: eq(workspaceServices.workspaceId, workspace.id),
  });

  return NextResponse.json({ workspace: updated, services });
}
