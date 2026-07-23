import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { SERVICE_BY_ID, type ServiceId } from "@startup-stack/catalog";
import { auth } from "@/auth";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import {
  getOrCreateWorkspace,
  markServiceReady,
  upsertSecrets,
} from "@/lib/workspace";

const bodySchema = z.object({
  serviceId: z.string(),
  values: z.record(z.string()),
});

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

  const serviceId = parsed.data.serviceId as ServiceId;
  const def = SERVICE_BY_ID[serviceId];
  if (!def) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  }

  for (const field of def.envFields) {
    if (field.required && !parsed.data.values[field.key]?.trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field.label}` },
        { status: 400 },
      );
    }
  }

  const workspace = await getOrCreateWorkspace(
    session.user.id,
    session.user.companyName,
  );
  if (workspace.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const toStore: Record<string, string> = {};
  for (const field of def.envFields) {
    const v = parsed.data.values[field.key];
    if (v?.trim()) toStore[field.key] = v.trim();
  }

  // Defaults for Notion integration type
  if (serviceId === "notion" && !toStore.NOTION_INTEGRATION_TYPE) {
    toStore.NOTION_INTEGRATION_TYPE = "Internal";
  }

  await upsertSecrets(workspace.id, toStore);
  await markServiceReady(workspace.id, serviceId);

  const updated = await db.query.workspaces.findFirst({
    where: and(eq(workspaces.id, workspace.id)),
  });

  return NextResponse.json({ ok: true, workspace: updated });
}
