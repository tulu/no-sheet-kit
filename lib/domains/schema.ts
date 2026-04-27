export { NSKDOMAINS_STORAGE_KEY } from "@/lib/storage/anonymous-storage-keys";
export const NSKDOMAINS_SCHEMA_VERSION = 1;

export const DOMAIN_STATUS_IDS = ["active", "parked", "for_sale", "abandoned"] as const;
export type DomainStatusId = (typeof DOMAIN_STATUS_IDS)[number];

export type DomainFilterId = "all" | DomainStatusId | "expiring_soon";

export type DomainsViewMode = "list" | "grid" | "calendar";

export const DOMAINS_VIEW_MODES: readonly DomainsViewMode[] = ["list", "grid", "calendar"];

export type NSKDomainItem = {
  id: string;
  domain_name: string;
  registrar: string;
  /** YYYY-MM-DD or empty when unknown */
  purchased_at: string;
  expires_on: string; // YYYY-MM-DD
  status_id: DomainStatusId;
  auto_renew: boolean;
  price: string;
  notes?: string;
  google_calendar_event_id?: string;
  google_calendar_email_reminder_minutes?: number;
  created_at: string;
  updated_at: string;
};

export type NSKDomainsSchema = {
  version: number;
  /** ISO timestamp of last successful Google Drive sync for this app payload, if any. */
  last_google_sync_at: string | null;
  items: NSKDomainItem[];
};

export function createEmptyNSKDomainsSchema(): NSKDomainsSchema {
  return {
    version: NSKDOMAINS_SCHEMA_VERSION,
    last_google_sync_at: null,
    items: [],
  };
}

export function isDomainStatusId(value: string): value is DomainStatusId {
  return DOMAIN_STATUS_IDS.includes(value as DomainStatusId);
}
