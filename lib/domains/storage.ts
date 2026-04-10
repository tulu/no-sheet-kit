"use client";

import {
  createEmptyNSKDomainsSchema,
  isDomainStatusId,
  NSKDOMAINS_SCHEMA_VERSION,
  NSKDOMAINS_STORAGE_KEY,
  type DomainStatusId,
  type NSKDomainItem,
  type NSKDomainsSchema,
} from "./schema";

function normalizeItems(rawItems: unknown): NSKDomainItem[] {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.reduce<NSKDomainItem[]>((acc, raw) => {
    if (!raw || typeof raw !== "object") return acc;
    const item = raw as Partial<NSKDomainItem>;

    if (typeof item.domain_name !== "string" || item.domain_name.trim().length === 0) return acc;
    if (typeof item.expires_on !== "string" || item.expires_on.trim().length === 0) return acc;

    let purchasedAt = typeof item.purchased_at === "string" ? item.purchased_at.trim() : "";
    if (purchasedAt && !/^\d{4}-\d{2}-\d{2}$/.test(purchasedAt)) {
      purchasedAt = "";
    }
    const statusId =
      typeof item.status_id === "string" && isDomainStatusId(item.status_id)
        ? item.status_id
        : ("active" satisfies DomainStatusId);

    const createdAt =
      typeof item.created_at === "string" ? item.created_at : new Date().toISOString();
    const updatedAt = typeof item.updated_at === "string" ? item.updated_at : createdAt;

    const normalized: NSKDomainItem = {
      id:
        typeof item.id === "string" && item.id.trim().length > 0 ? item.id : crypto.randomUUID(),
      domain_name: item.domain_name.trim(),
      registrar: typeof item.registrar === "string" ? item.registrar.trim() : "",
      purchased_at: purchasedAt,
      expires_on: item.expires_on,
      status_id: statusId,
      auto_renew: Boolean(item.auto_renew),
      price: typeof item.price === "string" ? item.price : "",
      notes: typeof item.notes === "string" ? item.notes : undefined,
      created_at: createdAt,
      updated_at: updatedAt,
    };

    acc.push(normalized);
    return acc;
  }, []);
}

export function readNSKDomainsStorage(): NSKDomainsSchema {
  if (typeof window === "undefined") return createEmptyNSKDomainsSchema();

  const raw = window.localStorage.getItem(NSKDOMAINS_STORAGE_KEY);
  if (!raw) return createEmptyNSKDomainsSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKDomainsSchema> & { items?: unknown };

    const normalized: NSKDomainsSchema = {
      version: NSKDOMAINS_SCHEMA_VERSION,
      last_google_sync_at:
        typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
      items: normalizeItems(parsed.items),
    };
    return normalized;
  } catch {
    return createEmptyNSKDomainsSchema();
  }
}

export function writeNSKDomainsStorage(next: NSKDomainsSchema) {
  if (typeof window === "undefined") return;

  const toPersist: NSKDomainsSchema = {
    version: NSKDOMAINS_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    items: normalizeItems(next.items),
  };
  window.localStorage.setItem(NSKDOMAINS_STORAGE_KEY, JSON.stringify(toPersist));
}
