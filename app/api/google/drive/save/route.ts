import { NextResponse } from "next/server";
import { DRIVE_BACKUP_FILENAME } from "@/lib/auth/google-oauth";
import { uploadAppDataZip } from "@/lib/google/drive-appdata";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

const MAX_BYTES = 32 * 1024 * 1024;

/** Large ZIP + round-trips to Google can exceed default limits on some hosts. */
export const maxDuration = 120;

export async function POST(request: Request) {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const buf = await request.arrayBuffer();
  if (buf.byteLength === 0) return NextResponse.json({ error: "empty_body" }, { status: 400 });
  if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  const result = await uploadAppDataZip(ctx.accessToken, buf, DRIVE_BACKUP_FILENAME);
  if (!result.ok) {
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      isDev
        ? {
            error: "upload_failed",
            step: result.step,
            googleStatus: result.status,
            googleDetail: result.detail.slice(0, 800),
          }
        : {
            error: "upload_failed",
            step: result.step,
            googleStatus: result.status,
          },
      { status: 502 }
    );
  }

  const syncedAt = new Date().toISOString();
  return NextResponse.json({ ok: true as const, syncedAt });
}
