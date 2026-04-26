/**
 * GA4 custom events (names + params contract). Keep in sync with GA4 / BigQuery exports.
 *
 * | event_name                    | params                                      |
 * |------------------------------|---------------------------------------------|
 * | login_completed              | method: "google" \| "guest"                 |
 * | app_record_created           | app: AppToastApp string                     |
 * | app_record_updated           | app: AppToastApp string                     |
 * | app_record_deleted           | app: AppToastApp string                     |
 * | local_data_cleared           | source: "settings" \| "logout_guest" \| "logout_google" |
 * | google_drive_backup_deleted  | (none)                                      |
 * | google_calendar_created      | (none)                                      |
 * | google_calendar_deleted      | (none)                                      |
 * | google_drive_sync_completed  | (none)                                      |
 * | google_drive_restore_completed | success: boolean                          |
 */
import type { AppToastApp } from "@/lib/app-toasts";
import { trackGtagEvent } from "@/lib/analytics/track";

export const NSK_LOGIN_PENDING_SESSION_KEY = "nsk_login_pending";
export const NSK_LOGIN_PENDING_GOOGLE_VALUE = "google" as const;

export function trackLoginCompleted(method: "google" | "guest"): void {
  trackGtagEvent("login_completed", { method });
}

export function trackAppRecordCreated(app: AppToastApp): void {
  trackGtagEvent("app_record_created", { app });
}

export function trackAppRecordUpdated(app: AppToastApp): void {
  trackGtagEvent("app_record_updated", { app });
}

export function trackAppRecordDeleted(app: AppToastApp): void {
  trackGtagEvent("app_record_deleted", { app });
}

export function trackLocalDataCleared(
  source: "settings" | "logout_guest" | "logout_google"
): void {
  trackGtagEvent("local_data_cleared", { source });
}

export function trackGoogleDriveBackupDeleted(): void {
  trackGtagEvent("google_drive_backup_deleted");
}

export function trackGoogleCalendarCreated(): void {
  trackGtagEvent("google_calendar_created");
}

export function trackGoogleCalendarDeleted(): void {
  trackGtagEvent("google_calendar_deleted");
}

export function trackGoogleDriveSyncCompleted(): void {
  trackGtagEvent("google_drive_sync_completed");
}

export function trackGoogleDriveRestoreCompleted(success: boolean): void {
  trackGtagEvent("google_drive_restore_completed", { success });
}
