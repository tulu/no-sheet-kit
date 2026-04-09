export const NSKDATES_STORAGE_KEY = "nskdates";
export const NSKDATES_SCHEMA_VERSION = 1;

export const DATE_TYPE_IDS = [
  "birthday",
  "anniversary",
  "reminder",
  "milestone",
  "memorial",
  "other",
] as const;

export type DateTypeId = (typeof DATE_TYPE_IDS)[number];
export type DateFilterId = "all" | DateTypeId;
export type DatesViewMode = "list" | "grid" | "calendar";

export type NSKDateItem = {
  id: string;
  label: string;
  type_id: DateTypeId;
  date: string; // YYYY-MM-DD
  is_recurring: boolean;
  notes?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

export type NSKDatesSchema = {
  version: number;
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
