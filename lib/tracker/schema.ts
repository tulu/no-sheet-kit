export { NSKTRACKER_STORAGE_KEY } from "@/lib/storage/anonymous-storage-keys";
export const NSKTRACKER_SCHEMA_VERSION = 1;

export const TRACKER_VIEW_MODES = ["grid", "list", "calendar"] as const;
export type TrackerViewMode = (typeof TRACKER_VIEW_MODES)[number];

export const TRACKER_OUTCOME_IDS = ["fulfilled", "partial", "missed"] as const;
export type TrackerOutcomeId = (typeof TRACKER_OUTCOME_IDS)[number];

export function isTrackerOutcomeId(value: string): value is TrackerOutcomeId {
  return (TRACKER_OUTCOME_IDS as readonly string[]).includes(value);
}

export type NSKTrackerTrack = {
  id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKTrackerEntry = {
  id: string;
  track_id: string;
  /** YYYY-MM-DD */
  occurred_on: string;
  outcome_id: TrackerOutcomeId;
  /** HH:MM */
  start_time?: string;
  /** HH:MM */
  end_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type NSKTrackerSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  tracks: NSKTrackerTrack[];
  entries: NSKTrackerEntry[];
};

export function createEmptyNSKTrackerSchema(): NSKTrackerSchema {
  return {
    version: NSKTRACKER_SCHEMA_VERSION,
    last_google_sync_at: null,
    tracks: [],
    entries: [],
  };
}
