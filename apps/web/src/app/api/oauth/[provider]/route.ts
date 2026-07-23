import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { getOrCreateWorkspace, oauthConfigured } from "@/lib/workspace";
import { randomToken } from "@/lib/crypto";

const APP_URL = () => process.env.APP_URL || "http://localhost:3000";

export async function GET(
  _req: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", APP_URL()));
  }

  const { provider } = await context.params;
  const oauth = oauthConfigured();

  if (provider === "linear" && !oauth.linear) {
    return NextResponse.redirect(
      new URL("/onboarding/connect/linear?fallback=1", APP_URL()),
    );
  }
  if (provider === "notion" && !oauth.notion) {
    return NextResponse.redirect(
      new URL("/onboarding/connect/notion?fallback=1", APP_URL()),
    );
  }

  const workspace = await getOrCreateWorkspace(
    session.user.id,
    session.user.companyName,
  );

  const state = randomToken(24);
  await db.insert(oauthStates).values({
    userId: session.user.id,
    workspaceId: workspace.id,
    provider,
    state,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  if (provider === "linear") {
    const url = new URL("https://linear.app/oauth/authorize");
    url.searchParams.set("client_id", process.env.LINEAR_OAUTH_CLIENT_ID!);
    url.searchParams.set(
      "redirect_uri",
      `${APP_URL()}/api/oauth/linear/callback`,
    );
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "read,write");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "consent");
    return NextResponse.redirect(url);
  }

  if (provider === "notion") {
    const url = new URL("https://api.notion.com/v1/oauth/authorize");
    url.searchParams.set("client_id", process.env.NOTION_OAUTH_CLIENT_ID!);
    url.searchParams.set(
      "redirect_uri",
      `${APP_URL()}/api/oauth/notion/callback`,
    );
    url.searchParams.set("response_type", "code");
    url.searchParams.set("owner", "user");
    url.searchParams.set("state", state);
    return NextResponse.redirect(url);
  }

  return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
}
