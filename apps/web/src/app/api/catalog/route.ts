import { NextResponse } from "next/server";
import {
  getSelectableServices,
  resolveConnectMode,
  SERVICES,
} from "@startup-stack/catalog";
import { oauthConfigured } from "@/lib/workspace";

export async function GET() {
  const oauth = oauthConfigured();
  const catalog = SERVICES.map((s) => ({
    ...s,
    effectiveConnectMode: resolveConnectMode(s, oauth),
  }));

  return NextResponse.json({
    services: catalog,
    selectable: getSelectableServices().map((s) => ({
      ...s,
      effectiveConnectMode: resolveConnectMode(s, oauth),
    })),
    oauth,
  });
}
