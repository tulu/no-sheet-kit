import JSZip from "jszip";
import { emitListAppDataUpdated } from "@/lib/storage/list-app-data-updated";
import {
  buildNskListAppStorageKey,
  GUEST_BACKUP_FILENAME_TO_SLUG,
  NSK_LIST_APP_SLUGS,
  SESSION_SUFFIX_ANONYMOUS,
  type NskListAppSlug,
  ZIP_FILENAME_BY_SLUG,
} from "./session-storage-keys";

function prettyJsonOrRaw(raw: string): string {
  try {
    return `${JSON.stringify(JSON.parse(raw), null, 2)}\n`;
  } catch {
    return raw.endsWith("\n") ? raw : `${raw}\n`;
  }
}

export type SessionGuestExportEntry = {
  storageKey: string;
  filename: string;
  body: string;
};

export function collectSessionGuestExportEntries(sessionSuffix: string): SessionGuestExportEntry[] {
  if (typeof window === "undefined") return [];
  const out: SessionGuestExportEntry[] = [];
  for (const slug of NSK_LIST_APP_SLUGS) {
    const storageKey = buildNskListAppStorageKey(slug, sessionSuffix);
    const raw = window.localStorage.getItem(storageKey);
    if (raw == null || raw.trim() === "") continue;
    out.push({
      storageKey,
      filename: ZIP_FILENAME_BY_SLUG[slug],
      body: prettyJsonOrRaw(raw),
    });
  }
  return out;
}

export async function buildSessionGuestDataZipBlob(entries: SessionGuestExportEntry[]): Promise<Blob> {
  const zip = new JSZip();
  for (const { filename, body } of entries) {
    zip.file(filename, body);
  }
  return zip.generateAsync({ type: "blob" });
}

export function downloadZipBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  queueMicrotask(() => URL.revokeObjectURL(url));
}

export function guestBackupZipFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `nosheetkit-guest-${y}-${m}-${day}.zip`;
}

const MAX_RESTORE_ZIP_BYTES = 32 * 1024 * 1024;

export class GuestBackupRestoreError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_ZIP" | "NO_FILES" | "BAD_JSON" | "FILE_TOO_LARGE"
  ) {
    super(message);
    this.name = "GuestBackupRestoreError";
  }
}

/**
 * Reads a ZIP from our guest export (or compatible layout: `*.json` at any depth).
 * Overwrites matching keys in localStorage for the given session suffix.
 */
export async function restoreSessionGuestDataFromZipFile(
  file: File,
  sessionSuffix: string
): Promise<number> {
  if (typeof window === "undefined") {
    throw new GuestBackupRestoreError("Not available on server.", "INVALID_ZIP");
  }
  if (file.size > MAX_RESTORE_ZIP_BYTES) {
    throw new GuestBackupRestoreError("ZIP too large.", "FILE_TOO_LARGE");
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new GuestBackupRestoreError("Could not read ZIP.", "INVALID_ZIP");
  }

  const touched = new Set<string>();

  for (const relativePath of Object.keys(zip.files)) {
    const entry = zip.files[relativePath];
    if (!entry || entry.dir) continue;
    const segments = relativePath.replace(/\\/g, "/").split("/");
    const base = segments[segments.length - 1]?.trim().toLowerCase() ?? "";
    if (!base.endsWith(".json")) continue;
    const slug = GUEST_BACKUP_FILENAME_TO_SLUG[base];
    if (!slug) continue;

    let text: string;
    try {
      text = await entry.async("text");
    } catch {
      throw new GuestBackupRestoreError("Could not read an entry from the ZIP.", "INVALID_ZIP");
    }
    const trimmed = text.trim();
    if (trimmed === "") continue;
    try {
      JSON.parse(trimmed);
    } catch {
      throw new GuestBackupRestoreError(`Invalid JSON: ${base}`, "BAD_JSON");
    }
    const storageKey = buildNskListAppStorageKey(slug as NskListAppSlug, sessionSuffix);
    window.localStorage.setItem(storageKey, trimmed);
    touched.add(storageKey);
  }

  if (touched.size === 0) {
    throw new GuestBackupRestoreError("No recognized backup JSON files in ZIP.", "NO_FILES");
  }

  emitListAppDataUpdated(sessionSuffix);

  return touched.size;
}

export function collectAnonymousGuestExportEntries(): SessionGuestExportEntry[] {
  return collectSessionGuestExportEntries(SESSION_SUFFIX_ANONYMOUS);
}

export async function buildAnonymousGuestDataZipBlob(
  entries: SessionGuestExportEntry[]
): Promise<Blob> {
  return buildSessionGuestDataZipBlob(entries);
}

export async function restoreAnonymousGuestDataFromZipFile(file: File): Promise<number> {
  return restoreSessionGuestDataFromZipFile(file, SESSION_SUFFIX_ANONYMOUS);
}
