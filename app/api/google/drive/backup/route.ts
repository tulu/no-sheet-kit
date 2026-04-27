import { NextResponse } from "next/server";
import { DRIVE_BACKUP_FILENAME } from "@/lib/auth/google-oauth";
import {
  deleteAppDataBackups,
  downloadAppDataFile,
  findAppDataBackupFileId,
} from "@/lib/google/drive-appdata";
import { getGoogleAccessTokenForCookies } from "@/lib/google/google-access-token";

export async function GET() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const lookup = await findAppDataBackupFileId(ctx.accessToken, DRIVE_BACKUP_FILENAME);
  if (!lookup.ok) {
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      isDev
        ? {
            error: "lookup_failed",
            step: lookup.step,
            googleStatus: lookup.status,
            googleDetail: lookup.detail.slice(0, 800),
          }
        : {
            error: "lookup_failed",
            step: lookup.step,
            googleStatus: lookup.status,
          },
      { status: 502 }
    );
  }
  if (!lookup.fileId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const buf = await downloadAppDataFile(ctx.accessToken, lookup.fileId);
  if (!buf) return NextResponse.json({ error: "download_failed" }, { status: 502 });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${DRIVE_BACKUP_FILENAME}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function DELETE() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await deleteAppDataBackups(ctx.accessToken, DRIVE_BACKUP_FILENAME);
  if (!result.ok) {
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      isDev
        ? {
            error: "delete_failed",
            step: result.step,
            googleStatus: result.status,
            googleDetail: result.detail.slice(0, 800),
          }
        : {
            error: "delete_failed",
            step: result.step,
            googleStatus: result.status,
          },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true as const, deletedCount: result.deletedCount });
}

export async function HEAD() {
  const ctx = await getGoogleAccessTokenForCookies();
  if (!ctx) return new NextResponse(null, { status: 401 });

  const lookup = await findAppDataBackupFileId(ctx.accessToken, DRIVE_BACKUP_FILENAME);
  if (!lookup.ok) return new NextResponse(null, { status: 502 });
  if (!lookup.fileId) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
