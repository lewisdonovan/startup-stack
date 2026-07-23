import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getOrCreateWorkspace } from "@/lib/workspace";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  companyName: z.string().min(1).max(120),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, companyName, email } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (existing) {
    await db
      .update(users)
      .set({ name, companyName })
      .where(eq(users.id, existing.id));
    await getOrCreateWorkspace(existing.id, companyName);
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name,
        companyName,
      })
      .returning();
    await getOrCreateWorkspace(created.id, companyName);
  }

  return NextResponse.json({ ok: true, email: normalizedEmail });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: session.user,
  });
}
