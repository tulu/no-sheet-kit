import { Buffer } from "node:buffer";
import { DRIVE_BACKUP_FILENAME } from "@/lib/auth/google-oauth";

const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

type DriveHttpResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; detail: string };

export type DriveBackupLookupResult =
  | { ok: true; fileId: string | null }
  | { ok: false; step: "list_backups"; status: number; detail: string };

export type DriveZipUploadResult =
  | { ok: true }
  | {
      ok: false;
      step: "list_backups" | "create_file" | "upload_bytes" | "cleanup_old_backups";
      status: number;
      detail: string;
    };

export type DriveBackupDeleteResult =
  | { ok: true; deletedCount: number }
  | { ok: false; step: "list_backups" | "delete_backup"; status: number; detail: string };

function appDataBackupListQuery(filename: string): string {
  const escaped = filename.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return encodeURIComponent(`name='${escaped}' and 'appDataFolder' in parents and trashed=false`);
}

async function readGoogleErrorDetail(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return res.statusText || `HTTP ${res.status}`;
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } };
    const message = parsed.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  } catch {
    // Keep raw text when body is not JSON.
  }
  return text.length > 800 ? `${text.slice(0, 800)}...` : text;
}

async function driveJsonRequest<T>(
  accessToken: string,
  input: string,
  init: RequestInit = {}
): Promise<DriveHttpResult<T>> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, detail: await readGoogleErrorDetail(res) };
  }
  return { ok: true, status: res.status, data: (await res.json()) as T };
}

async function driveRawRequest(
  accessToken: string,
  input: string,
  init: RequestInit = {}
): Promise<DriveHttpResult<null>> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, detail: await readGoogleErrorDetail(res) };
  }
  return { ok: true, status: res.status, data: null };
}

async function listBackupFileIds(accessToken: string, filename: string): Promise<DriveHttpResult<string[]>> {
  const q = appDataBackupListQuery(filename);
  const url = `${DRIVE_FILES}?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=100`;
  const list = await driveJsonRequest<{ files?: { id?: string }[] }>(accessToken, url);
  if (!list.ok) return list;
  const ids = (list.data.files ?? [])
    .map((file) => file.id)
    .filter((id): id is string => typeof id === "string");
  return { ok: true, status: list.status, data: ids };
}

export async function findAppDataBackupFileId(
  accessToken: string,
  filename: string = DRIVE_BACKUP_FILENAME
): Promise<DriveBackupLookupResult> {
  const listed = await listBackupFileIds(accessToken, filename);
  if (!listed.ok) {
    return { ok: false, step: "list_backups", status: listed.status, detail: listed.detail };
  }
  return { ok: true, fileId: listed.data[0] ?? null };
}

export async function downloadAppDataFile(accessToken: string, fileId: string): Promise<ArrayBuffer | null> {
  const url = `${DRIVE_FILES}/${encodeURIComponent(fileId)}?alt=media`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  return res.arrayBuffer();
}

/**
 * Create + upload new backup first, then clean up old backups.
 * This avoids a window where a failed upload leaves the account without any backup.
 */
export async function uploadAppDataZip(
  accessToken: string,
  bytes: ArrayBuffer,
  filename: string = DRIVE_BACKUP_FILENAME
): Promise<DriveZipUploadResult> {
  const listed = await listBackupFileIds(accessToken, filename);
  if (!listed.ok) {
    return { ok: false, step: "list_backups", status: listed.status, detail: listed.detail };
  }
  const previousIds = listed.data;

  const create = await driveJsonRequest<{ id?: string }>(accessToken, `${DRIVE_FILES}?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: filename,
      parents: ["appDataFolder"],
      mimeType: "application/zip",
    }),
  });
  if (!create.ok) {
    return { ok: false, step: "create_file", status: create.status, detail: create.detail };
  }

  const newFileId = typeof create.data.id === "string" ? create.data.id : "";
  if (!newFileId) {
    return { ok: false, step: "create_file", status: 0, detail: "Drive did not return a file id." };
  }

  const uploadUrl = `${DRIVE_UPLOAD}/${encodeURIComponent(newFileId)}?uploadType=media`;
  const uploaded = await driveRawRequest(accessToken, uploadUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/zip" },
    body: Buffer.from(bytes),
  });
  if (!uploaded.ok) {
    return { ok: false, step: "upload_bytes", status: uploaded.status, detail: uploaded.detail };
  }

  for (const oldId of previousIds) {
    const cleaned = await driveRawRequest(accessToken, `${DRIVE_FILES}/${encodeURIComponent(oldId)}`, {
      method: "DELETE",
    });
    if (!cleaned.ok && cleaned.status !== 404) {
      return {
        ok: false,
        step: "cleanup_old_backups",
        status: cleaned.status,
        detail: cleaned.detail,
      };
    }
  }

  return { ok: true };
}

export async function deleteAppDataBackups(
  accessToken: string,
  filename: string = DRIVE_BACKUP_FILENAME
): Promise<DriveBackupDeleteResult> {
  const listed = await listBackupFileIds(accessToken, filename);
  if (!listed.ok) {
    return { ok: false, step: "list_backups", status: listed.status, detail: listed.detail };
  }

  let deletedCount = 0;
  for (const id of listed.data) {
    const deleted = await driveRawRequest(accessToken, `${DRIVE_FILES}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!deleted.ok && deleted.status !== 404) {
      return { ok: false, step: "delete_backup", status: deleted.status, detail: deleted.detail };
    }
    deletedCount += 1;
  }

  return { ok: true, deletedCount };
}
