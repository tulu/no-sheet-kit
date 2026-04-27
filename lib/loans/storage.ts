"use client";

import { emitListAppDataUpdated } from "@/lib/storage/list-app-data-updated";
import { markPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { buildNskListAppStorageKey } from "@/lib/storage/session-storage-keys";
import {
  createEmptyNSKLoansSchema,
  isLoanDirection,
  NSKLOANS_SCHEMA_VERSION,
  type LoanPayment,
  type NSKLoanItem,
  type NSKLoansSchema,
} from "./schema";

function normalizePayments(raw: unknown): LoanPayment[] {
  if (!Array.isArray(raw)) return [];
  const out: LoanPayment[] = [];
  for (const p of raw) {
    if (!p || typeof p !== "object") continue;
    const row = p as Partial<LoanPayment>;
    if (typeof row.amount !== "string" || typeof row.date !== "string") continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date.trim())) continue;
    out.push({
      id: typeof row.id === "string" && row.id.trim() ? row.id.trim() : crypto.randomUUID(),
      amount: row.amount.trim(),
      date: row.date.trim(),
    });
  }
  return out;
}

function normalizeItems(rawItems: unknown): NSKLoanItem[] {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.reduce<NSKLoanItem[]>((acc, raw) => {
    if (!raw || typeof raw !== "object") return acc;
    const item = raw as Partial<NSKLoanItem> & { principal?: string; start_date?: string };

    if (typeof item.counterparty_name !== "string" || item.counterparty_name.trim().length === 0)
      return acc;
    if (typeof item.direction !== "string" || !isLoanDirection(item.direction)) return acc;

    const amountRaw =
      typeof item.amount === "string" && item.amount.trim().length > 0
        ? item.amount.trim()
        : typeof item.principal === "string" && item.principal.trim().length > 0
          ? item.principal.trim()
          : "";
    if (!amountRaw) return acc;

    const dateRaw =
      typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date.trim())
        ? item.date.trim()
        : typeof item.start_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.start_date.trim())
          ? item.start_date.trim()
          : "";
    if (!dateRaw) return acc;

    const createdAt =
      typeof item.created_at === "string" ? item.created_at : new Date().toISOString();
    const updatedAt = typeof item.updated_at === "string" ? item.updated_at : createdAt;

    const normalized: NSKLoanItem = {
      id:
        typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : crypto.randomUUID(),
      direction: item.direction,
      counterparty_name: item.counterparty_name.trim(),
      currency: typeof item.currency === "string" ? item.currency.trim() : "",
      amount: amountRaw,
      date: dateRaw,
      notes: typeof item.notes === "string" && item.notes.trim() ? item.notes.trim() : undefined,
      payments: normalizePayments(item.payments),
      created_at: createdAt,
      updated_at: updatedAt,
    };

    acc.push(normalized);
    return acc;
  }, []);
}

export function readNSKLoansStorage(sessionSuffix: string): NSKLoansSchema {
  if (typeof window === "undefined") return createEmptyNSKLoansSchema();

  const key = buildNskListAppStorageKey("loans", sessionSuffix);
  const raw = window.localStorage.getItem(key);
  if (!raw) return createEmptyNSKLoansSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKLoansSchema> & { items?: unknown };
    return {
      version: NSKLOANS_SCHEMA_VERSION,
      last_google_sync_at:
        typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
      items: normalizeItems(parsed.items),
    };
  } catch {
    return createEmptyNSKLoansSchema();
  }
}

export function writeNSKLoansStorage(
  sessionSuffix: string,
  next: NSKLoansSchema,
  opts?: { skipPendingDriveMark?: boolean }
) {
  if (typeof window === "undefined") return;
  const key = buildNskListAppStorageKey("loans", sessionSuffix);
  const toPersist: NSKLoansSchema = {
    version: NSKLOANS_SCHEMA_VERSION,
    last_google_sync_at: next.last_google_sync_at ?? null,
    items: normalizeItems(next.items),
  };
  window.localStorage.setItem(key, JSON.stringify(toPersist));
  emitListAppDataUpdated(sessionSuffix);
  if (!opts?.skipPendingDriveMark) markPendingDriveSync(sessionSuffix);
}
