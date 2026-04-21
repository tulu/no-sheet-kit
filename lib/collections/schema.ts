export const NSKCOLLECTIONS_STORAGE_KEY = "nskcollections";
export const NSKCOLLECTIONS_SCHEMA_VERSION = 1;

export const POSSESSION_STATUSES = ["owned", "lent_out", "borrowed", "wanted"] as const;
export type PossessionStatus = (typeof POSSESSION_STATUSES)[number];

/** Possession filters shown in the sidebar (below collections). "Owned" is omitted. */
export const COLLECTIONS_SIDEBAR_POSSESSION_STATUSES = ["lent_out", "borrowed", "wanted"] as const;
export type CollectionsSidebarPossessionStatus =
  (typeof COLLECTIONS_SIDEBAR_POSSESSION_STATUSES)[number];

export function isPossessionStatus(value: string): value is PossessionStatus {
  return (POSSESSION_STATUSES as readonly string[]).includes(value);
}

/** Sidebar: overview (not a real collection id). */
export const COLLECTIONS_DASHBOARD_NAV_ID = "__collections_dashboard__" as const;
export type CollectionsNavSelection = typeof COLLECTIONS_DASHBOARD_NAV_ID | string;

/** Sidebar: all items with a given possession status (not a collection id). */
export const COLLECTIONS_POSSESSION_NAV_PREFIX = "__nsk_possession:" as const;

export function possessionNavId(status: PossessionStatus): string {
  return `${COLLECTIONS_POSSESSION_NAV_PREFIX}${status}`;
}

export function parsePossessionNavId(nav: string): PossessionStatus | null {
  if (!nav.startsWith(COLLECTIONS_POSSESSION_NAV_PREFIX)) return null;
  const rest = nav.slice(COLLECTIONS_POSSESSION_NAV_PREFIX.length);
  return isPossessionStatus(rest) ? rest : null;
}

/** `list` matches Links/Loans table-style layout (persisted view key). */
export const COLLECTIONS_VIEW_MODES = ["grid", "list"] as const;
export type CollectionsViewMode = (typeof COLLECTIONS_VIEW_MODES)[number];

export type NSKCollection = {
  id: string;
  name: string;
  order: number;
  show_price: boolean;
  show_link: boolean;
  created_at: string;
  updated_at: string;
};

export type NSKCollectionItem = {
  id: string;
  collection_id: string;
  name: string;
  notes?: string;
  possession_status: PossessionStatus;
  /** YYYY-MM-DD — optional context for lent_out / borrowed */
  related_date?: string;
  /** Who lent / who borrowed — optional */
  related_person?: string;
  price?: number;
  /** ISO 4217-style code (e.g. USD); meaningful when `price` is set. */
  currency?: string;
  /** Optional URL (http/https) when the collection enables links. */
  link?: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type NSKCollectionsSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  collections: NSKCollection[];
  items: NSKCollectionItem[];
};

export function createEmptyNSKCollectionsSchema(): NSKCollectionsSchema {
  return {
    version: NSKCOLLECTIONS_SCHEMA_VERSION,
    last_google_sync_at: null,
    collections: [],
    items: [],
  };
}
