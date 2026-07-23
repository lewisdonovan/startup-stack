import { and, eq } from "drizzle-orm";
import {
  getRequiredServiceIds,
  SERVICE_BY_ID,
  type ServiceId,
} from "@startup-stack/catalog";
import { db } from "@/db";
import { secrets, workspaceServices, workspaces } from "@/db/schema";
import { decryptSecret, encryptSecret } from "@/lib/crypto";

export async function getOrCreateWorkspace(userId: string, companyName?: string | null) {
  const existing = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, userId),
  });
  if (existing) return existing;

  const slug = (companyName || "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "workspace";

  const [created] = await db
    .insert(workspaces)
    .values({
      userId,
      slug: `${slug}-${crypto.randomUUID().slice(0, 8)}`,
      status: "drafting",
    })
    .returning();

  // Seed required services
  for (const serviceId of getRequiredServiceIds()) {
    const def = SERVICE_BY_ID[serviceId];
    await db.insert(workspaceServices).values({
      workspaceId: created.id,
      serviceId,
      status: def.connectMode === "builtin" ? "ready" : "awaiting_keys",
    });
  }

  return created;
}

export async function setWorkspaceServices(
  workspaceId: string,
  selectedIds: ServiceId[],
) {
  const required = new Set(getRequiredServiceIds());
  const finalIds = new Set<ServiceId>([...required, ...selectedIds]);
  // Always include context7 even if not selectable
  finalIds.add("context7");
  finalIds.add("openrouter");

  const existing = await db.query.workspaceServices.findMany({
    where: eq(workspaceServices.workspaceId, workspaceId),
  });
  const existingMap = new Map(existing.map((e) => [e.serviceId, e]));

  for (const id of finalIds) {
    const def = SERVICE_BY_ID[id];
    if (!def) continue;
    const row = existingMap.get(id);
    if (row) continue;
    await db.insert(workspaceServices).values({
      workspaceId,
      serviceId: id,
      status:
        def.connectMode === "builtin"
          ? "ready"
          : def.connectMode === "oauth"
            ? "awaiting_oauth"
            : "awaiting_keys",
    });
  }

  // Remove deselected optional services (keep secrets until cascade if workspace deleted;
  // for deselected, delete service rows and their secrets for those keys)
  for (const row of existing) {
    if (!finalIds.has(row.serviceId as ServiceId)) {
      const def = SERVICE_BY_ID[row.serviceId as ServiceId];
      if (def?.required) continue;
      await db
        .delete(workspaceServices)
        .where(eq(workspaceServices.id, row.id));
      if (def) {
        for (const field of def.envFields) {
          await db
            .delete(secrets)
            .where(
              and(
                eq(secrets.workspaceId, workspaceId),
                eq(secrets.key, field.key),
              ),
            );
        }
      }
    }
  }

  await db
    .update(workspaces)
    .set({ status: "connecting", updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId));
}

export async function upsertSecrets(
  workspaceId: string,
  values: Record<string, string>,
) {
  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    const enc = encryptSecret(value);
    const existing = await db.query.secrets.findFirst({
      where: and(eq(secrets.workspaceId, workspaceId), eq(secrets.key, key)),
    });
    if (existing) {
      await db
        .update(secrets)
        .set({
          ciphertext: enc.ciphertext,
          iv: enc.iv,
          authTag: enc.authTag,
          updatedAt: new Date(),
        })
        .where(eq(secrets.id, existing.id));
    } else {
      await db.insert(secrets).values({
        workspaceId,
        key,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
      });
    }
  }
}

export async function decryptWorkspaceSecrets(
  workspaceId: string,
): Promise<Record<string, string>> {
  const rows = await db.query.secrets.findMany({
    where: eq(secrets.workspaceId, workspaceId),
  });
  const out: Record<string, string> = {};
  for (const row of rows) {
    out[row.key] = decryptSecret({
      ciphertext: row.ciphertext,
      iv: row.iv,
      authTag: row.authTag,
    });
  }
  return out;
}

export async function markServiceReady(
  workspaceId: string,
  serviceId: string,
) {
  await db
    .update(workspaceServices)
    .set({ status: "ready", updatedAt: new Date() })
    .where(
      and(
        eq(workspaceServices.workspaceId, workspaceId),
        eq(workspaceServices.serviceId, serviceId),
      ),
    );
  await refreshWorkspaceStatus(workspaceId);
}

export async function refreshWorkspaceStatus(workspaceId: string) {
  const rows = await db.query.workspaceServices.findMany({
    where: eq(workspaceServices.workspaceId, workspaceId),
  });
  const allReady = rows.length > 0 && rows.every((r) => r.status === "ready");
  await db
    .update(workspaces)
    .set({
      status: allReady ? "ready" : "connecting",
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId));
  return allReady;
}

export function oauthConfigured(): { linear: boolean; notion: boolean } {
  return {
    linear: Boolean(
      process.env.LINEAR_OAUTH_CLIENT_ID &&
        process.env.LINEAR_OAUTH_CLIENT_SECRET,
    ),
    notion: Boolean(
      process.env.NOTION_OAUTH_CLIENT_ID &&
        process.env.NOTION_OAUTH_CLIENT_SECRET,
    ),
  };
}
