export { NSKDATES_STORAGE_KEY } from "@/lib/storage/anonymous-storage-keys";
export const NSKDATES_SCHEMA_VERSION = 1;

export const DATE_TYPE_IDS = [
  "birthday",
  "anniversary",
  "reminder",
  "milestone",
  "memorial",
  "document_expiration",
  "other",
] as const;

export type DateTypeId = (typeof DATE_TYPE_IDS)[number];
export type DateFilterId = "all" | DateTypeId | "upcoming_30";
export type DatesViewMode = "list" | "grid" | "calendar";

export const DATES_VIEW_MODES: readonly DatesViewMode[] = ["list", "grid", "calendar"];

export type NSKDateItem = {
  id: string;
  label: string;
  type_id: DateTypeId;
  date: string; // YYYY-MM-DD
  is_recurring: boolean;
  notes?: string;
  /** Google Calendar event id in the NoSheetKit calendar, if synced. */
  google_calendar_event_id?: string;
  /** Email reminder minutes before start (all-day–safe; e.g. 0, 1440, 43200). */
  google_calendar_email_reminder_minutes?: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

export type NSKDatesSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  items: NSKDateItem[];
};

export function createEmptyNSKDatesSchema(): NSKDatesSchema {
  return {
    version: NSKDATES_SCHEMA_VERSION,
    last_google_sync_at: null,
    items: [],
  };
}

export function isDateTypeId(value: string): value is DateTypeId {
  return DATE_TYPE_IDS.includes(value as DateTypeId);
}
