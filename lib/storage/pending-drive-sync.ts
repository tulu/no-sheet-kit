import { SESSION_SUFFIX_ANONYMOUS } from "./session-storage-keys";

/** Same-tab updates: Save button and other UI listen for this after mark/clear. */
export const PENDING_DRIVE_SYNC_CHANGED_EVENT = "nsk-pending-drive-sync-changed";

function pendingKey(sessionSuffix: string): string {
  return `nsk_pending_drive_${sessionSuffix}`;
}

export function getPendingDriveSyncStorageKey(sessionSuffix: string): string {
  return pendingKey(sessionSuffix);
}

function notifyPendingChanged(sessionSuffix: string): void {
  if (typeof window === "undefined") return;
  // Defer cross-component notifications to avoid setState during another component render.
  window.setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent(PENDING_DRIVE_SYNC_CHANGED_EVENT, { detail: { sessionSuffix } })
    );
  }, 0);
}

export function isGoogleSessionSuffix(sessionSuffix: string): boolean {
  return sessionSuffix !== SESSION_SUFFIX_ANONYMOUS && sessionSuffix.startsWith("Google_");
}

export function markPendingDriveSync(sessionSuffix: string): void {
  if (typeof window === "undefined") return;
  if (!isGoogleSessionSuffix(sessionSuffix)) return;
  window.localStorage.setItem(pendingKey(sessionSuffix), "1");
  notifyPendingChanged(sessionSuffix);
}

export function clearPendingDriveSync(sessionSuffix: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(pendingKey(sessionSuffix));
  notifyPendingChanged(sessionSuffix);
}

export function hasPendingDriveSync(sessionSuffix: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(pendingKey(sessionSuffix)) === "1";
}
