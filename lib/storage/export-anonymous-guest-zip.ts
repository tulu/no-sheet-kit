import JSZip from "jszip";
import {
  ALL_ANONYMOUS_APP_STORAGE_KEYS,
  NSKCOLLECTIONS_STORAGE_KEY,
  NSKDATES_STORAGE_KEY,
  NSKDOMAINS_STORAGE_KEY,
  NSKLINKS_STORAGE_KEY,
  NSKLOANS_STORAGE_KEY,
  NSKTASKS_STORAGE_KEY,
} from "./anonymous-storage-keys";

const STORAGE_KEY_TO_FILENAME: Record<(typeof ALL_ANONYMOUS_APP_STORAGE_KEYS)[number], string> = {
  [NSKLOANS_STORAGE_KEY]: "loans.json",
  [NSKDATES_STORAGE_KEY]: "dates.json",
  [NSKLINKS_STORAGE_KEY]: "links.json",
  [NSKDOMAINS_STORAGE_KEY]: "domains.json",
  [NSKTASKS_STORAGE_KEY]: "tasks.json",
  [NSKCOLLECTIONS_STORAGE_KEY]: "collections.json",
};

function prettyJsonOrRaw(raw: string): string {
  try {
    return `${JSON.stringify(JSON.parse(raw), null, 2)}\n`;
  } catch {
    return raw.endsWith("\n") ? raw : `${raw}\n`;
  }
}

export type AnonymousGuestExportEntry = {
  storageKey: (typeof ALL_ANONYMOUS_APP_STORAGE_KEYS)[number];
  filename: string;
  body: string;
};

export function collectAnonymousGuestExportEntries(): AnonymousGuestExportEntry[] {
  if (typeof window === "undefined") return [];
  const out: AnonymousGuestExportEntry[] = [];
  for (const key of ALL_ANONYMOUS_APP_STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw == null || raw.trim() === "") continue;
    out.push({
      storageKey: key,
      filename: STORAGE_KEY_TO_FILENAME[key],
      body: prettyJsonOrRaw(raw),
    });
  }
  return out;
}

export async function buildAnonymousGuestDataZipBlob(entries: AnonymousGuestExportEntry[]): Promise<Blob> {
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

/** Basenames produced by guest export; values are localStorage keys. */
export const GUEST_BACKUP_FILENAME_TO_STORAGE_KEY: Record<
  string,
  (typeof ALL_ANONYMOUS_APP_STORAGE_KEYS)[number]
> = {
  [STORAGE_KEY_TO_FILENAME[NSKLOANS_STORAGE_KEY].toLowerCase()]: NSKLOANS_STORAGE_KEY,
  [STORAGE_KEY_TO_FILENAME[NSKDATES_STORAGE_KEY].toLowerCase()]: NSKDATES_STORAGE_KEY,
  [STORAGE_KEY_TO_FILENAME[NSKLINKS_STORAGE_KEY].toLowerCase()]: NSKLINKS_STORAGE_KEY,
  [STORAGE_KEY_TO_FILENAME[NSKDOMAINS_STORAGE_KEY].toLowerCase()]: NSKDOMAINS_STORAGE_KEY,
  [STORAGE_KEY_TO_FILENAME[NSKTASKS_STORAGE_KEY].toLowerCase()]: NSKTASKS_STORAGE_KEY,
  [STORAGE_KEY_TO_FILENAME[NSKCOLLECTIONS_STORAGE_KEY].toLowerCase()]: NSKCOLLECTIONS_STORAGE_KEY,
};

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
 * Overwrites matching keys in localStorage. Returns how many apps were written.
 */
export async function restoreAnonymousGuestDataFromZipFile(file: File): Promise<number> {
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

  const touched = new Set<(typeof ALL_ANONYMOUS_APP_STORAGE_KEYS)[number]>();

  for (const relativePath of Object.keys(zip.files)) {
    const entry = zip.files[relativePath];
    if (!entry || entry.dir) continue;
    const segments = relativePath.replace(/\\/g, "/").split("/");
    const base = segments[segments.length - 1]?.trim().toLowerCase() ?? "";
    if (!base.endsWith(".json")) continue;
    const storageKey = GUEST_BACKUP_FILENAME_TO_STORAGE_KEY[base];
    if (!storageKey) continue;

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
    window.localStorage.setItem(storageKey, trimmed);
    touched.add(storageKey);
  }

  if (touched.size === 0) {
    throw new GuestBackupRestoreError("No recognized backup JSON files in ZIP.", "NO_FILES");
  }

  return touched.size;
}
