import { NextResponse } from "next/server";
import { DRIVE_BACKUP_FILENAME } from "@/lib/auth/google-oauth";
import { downloadAppDataFile, findAppDataBackupFileId } from "@/lib/google/drive-appdata";
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
