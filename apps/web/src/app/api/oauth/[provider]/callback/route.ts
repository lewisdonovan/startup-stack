import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { markServiceReady, upsertSecrets } from "@/lib/workspace";

const APP_URL = () => process.env.APP_URL || "http://localhost:3000";

export async function GET(
  req: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", APP_URL()));
  }

  const { provider } = await context.params;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL(
        `/onboarding/connect/${provider}?error=oauth_denied`,
        APP_URL(),
      ),
    );
  }

  const stateRow = await db.query.oauthStates.findFirst({
    where: and(
      eq(oauthStates.state, state),
      eq(oauthStates.userId, session.user.id),
      eq(oauthStates.provider, provider),
      gt(oauthStates.expiresAt, new Date()),
    ),
  });

  if (!stateRow) {
    return NextResponse.redirect(
      new URL(
        `/onboarding/connect/${provider}?error=invalid_state`,
        APP_URL(),
      ),
    );
  }

  // consume state
  await db.delete(oauthStates).where(eq(oauthStates.id, stateRow.id));

  try {
    if (provider === "linear") {
      const tokenRes = await fetch("https://api.linear.app/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          redirect_uri: `${APP_URL()}/api/oauth/linear/callback`,
          client_id: process.env.LINEAR_OAUTH_CLIENT_ID!,
          client_secret: process.env.LINEAR_OAUTH_CLIENT_SECRET!,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenRes.ok) throw new Error("Linear token exchange failed");
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) throw new Error("No access token");
      await upsertSecrets(stateRow.workspaceId, {
        LINEAR_API_KEY: tokenJson.access_token,
      });
      await markServiceReady(stateRow.workspaceId, "linear");
    } else if (provider === "notion") {
      const basic = Buffer.from(
        `${process.env.NOTION_OAUTH_CLIENT_ID}:${process.env.NOTION_OAUTH_CLIENT_SECRET}`,
      ).toString("base64");
      const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${APP_URL()}/api/oauth/notion/callback`,
        }),
      });
      if (!tokenRes.ok) throw new Error("Notion token exchange failed");
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) throw new Error("No access token");
      await upsertSecrets(stateRow.workspaceId, {
        NOTION_API_KEY: tokenJson.access_token,
        NOTION_INTEGRATION_TYPE: "Public",
      });
      await markServiceReady(stateRow.workspaceId, "notion");
    } else {
      throw new Error("Unknown provider");
    }
  } catch {
    return NextResponse.redirect(
      new URL(
        `/onboarding/connect/${provider}?error=token_exchange&fallback=1`,
        APP_URL(),
      ),
    );
  }

  return NextResponse.redirect(
    new URL("/onboarding/review?connected=" + provider, APP_URL()),
  );
}
