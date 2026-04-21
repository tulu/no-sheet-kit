export const NSKLINKS_STORAGE_KEY = "nsklinks";
export const NSKLINKS_SCHEMA_VERSION = 1;

export type LinkStatus = "pending" | "ready" | "error";
export type LinksViewMode = "grid" | "list";
export type LinkFilterId = "all" | "tags";

export const LINKS_VIEW_MODES: readonly LinksViewMode[] = ["grid", "list"];

export type NSKLinkItem = {
  id: string;
  url: string;
  canonical_url?: string;
  site_origin?: string;
  hostname?: string;
  title?: string;
  description?: string;
  image_url?: string;
  favicon_url?: string;
  manual_tags: string[];
  auto_tags: string[];
  reviewed: boolean;
  reviewed_at?: string;
  review_due_date?: string; // YYYY-MM-DD
  status: LinkStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
};

export type NSKLinksSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  items: NSKLinkItem[];
};

export function createEmptyNSKLinksSchema(): NSKLinksSchema {
  return {
    version: NSKLINKS_SCHEMA_VERSION,
    last_google_sync_at: null,
    items: [],
  };
}

export function isLinkStatus(value: string): value is LinkStatus {
  return value === "pending" || value === "ready" || value === "error";
}
