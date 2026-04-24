import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getVerifiedSessionAndCookie } from "@/lib/auth/require-session";
import { enrichUrl } from "@/lib/links/enrichment";
import { getClientIpFromRequest } from "@/lib/security/client-ip";
import { checkInMemoryRateLimit } from "@/lib/security/rate-limit-in-memory";

type EnrichRequest = {
  url?: string;
};

const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_SESSION = 30;
const MAX_PER_IP = 120;

export async function POST(request: Request) {
  try {
    const auth = await getVerifiedSessionAndCookie();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { session, token } = auth;

    const sessionKey =
      session.kind === "google"
        ? `enrich:s:g:${session.sub}`
        : `enrich:s:a:${createHash("sha256").update(token).digest("hex")}`;

    if (!checkInMemoryRateLimit(sessionKey, { windowMs: RATE_WINDOW_MS, max: MAX_PER_SESSION })) {
      return NextResponse.json(
        { error: "Too many enrichment requests from this session; try again later." },
        { status: 429 }
      );
    }

    const ip = getClientIpFromRequest(request);
    if (
      ip &&
      !checkInMemoryRateLimit(`enrich:i:${ip}`, { windowMs: RATE_WINDOW_MS, max: MAX_PER_IP })
    ) {
      return NextResponse.json(
        { error: "Too many enrichment requests from this network; try again later." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as EnrichRequest;
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    const enriched = await enrichUrl(body.url);
    return NextResponse.json(enriched, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
