"use client";

import { emitListAppDataUpdated } from "@/lib/storage/list-app-data-updated";
import { markPendingDriveSync } from "@/lib/storage/pending-drive-sync";
import { buildNskListAppStorageKey } from "@/lib/storage/session-storage-keys";
import { parseAmount } from "@/lib/loans/loans-helpers";
import {
  isValidEventDate,
  isValidEventTime,
} from "./events-helpers";
import {
  createEmptyNSKEventsSchema,
  isEventGuestRsvpStatus,
  NSKEVENTS_SCHEMA_VERSION,
  type NSKEvent,
  type NSKEventExpense,
  type NSKEventFamily,
  type NSKEventGuest,
  type NSKEventPayment,
  type NSKEventsSchema,
  type EventGuestRsvpStatus,
} from "./schema";

function normalizeEvents(raw: unknown): NSKEvent[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const list = raw.reduce<NSKEvent[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const e = row as Partial<NSKEvent>;
    if (typeof e.name !== "string" || e.name.trim().length === 0) return acc;
    if (typeof e.tasks_space_id !== "string" || !e.tasks_space_id.trim()) return acc;
    const createdAt = typeof e.created_at === "string" ? e.created_at : now;
    const updatedAt = typeof e.updated_at === "string" ? e.updated_at : createdAt;
    const start_date =
      typeof e.start_date === "string" && isValidEventDate(e.start_date) ? e.start_date : undefined;
    const start_time =
      typeof e.start_time === "string" && isValidEventTime(e.start_time)
        ? e.start_time
        : undefined;
    acc.push({
      id: typeof e.id === "string" && e.id.trim() ? e.id : crypto.randomUUID(),
      name: e.name.trim(),
      tasks_space_id: e.tasks_space_id.trim(),
      start_date,
      start_time,
      location: typeof e.location === "string" && e.location.trim() ? e.location.trim() : undefined,
      order: typeof e.order === "number" && Number.isFinite(e.order) ? e.order : acc.length,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
  list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return list;
}

function normalizeFamilies(raw: unknown, validEventIds: Set<string>): NSKEventFamily[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKEventFamily[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const f = row as Partial<NSKEventFamily>;
    if (typeof f.event_id !== "string" || !validEventIds.has(f.event_id)) return acc;
    if (typeof f.name !== "string" || f.name.trim().length === 0) return acc;
    const createdAt = typeof f.created_at === "string" ? f.created_at : now;
    const updatedAt = typeof f.updated_at === "string" ? f.updated_at : createdAt;
    acc.push({
      id: typeof f.id === "string" && f.id.trim() ? f.id : crypto.randomUUID(),
      event_id: f.event_id,
      name: f.name.trim(),
      invitation_sent: Boolean(f.invitation_sent),
      rsvp_status:
        typeof f.rsvp_status === "string" && isEventGuestRsvpStatus(f.rsvp_status)
          ? f.rsvp_status
          : "pending",
      order: typeof f.order === "number" && Number.isFinite(f.order) ? f.order : acc.length,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

function normalizeGuests(
  raw: unknown,
  validEventIds: Set<string>,
  validFamilyIds: Set<string>
): NSKEventGuest[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKEventGuest[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const g = row as Partial<NSKEventGuest>;
    if (typeof g.event_id !== "string" || !validEventIds.has(g.event_id)) return acc;
    if (typeof g.name !== "string" || g.name.trim().length === 0) return acc;
    const familyId =
      typeof g.family_id === "string" && validFamilyIds.has(g.family_id)
        ? g.family_id
        : undefined;
    const createdAt = typeof g.created_at === "string" ? g.created_at : now;
    const updatedAt = typeof g.updated_at === "string" ? g.updated_at : createdAt;
    acc.push({
      id: typeof g.id === "string" && g.id.trim() ? g.id : crypto.randomUUID(),
      event_id: g.event_id,
      family_id: familyId,
      name: g.name.trim(),
      last_name: typeof g.last_name === "string" && g.last_name.trim() ? g.last_name.trim() : undefined,
      email: typeof g.email === "string" && g.email.trim() ? g.email.trim() : undefined,
      phone: typeof g.phone === "string" && g.phone.trim() ? g.phone.trim() : undefined,
      dietary_restrictions:
        typeof g.dietary_restrictions === "string" && g.dietary_restrictions.trim()
          ? g.dietary_restrictions.trim()
          : undefined,
      is_kid: Boolean(g.is_kid),
      invitation_sent: Boolean(g.invitation_sent),
      rsvp_status:
        typeof g.rsvp_status === "string" && isEventGuestRsvpStatus(g.rsvp_status)
          ? g.rsvp_status
          : "pending",
      order: typeof g.order === "number" && Number.isFinite(g.order) ? g.order : acc.length,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

function normalizePayments(raw: unknown): NSKEventPayment[] {
  if (!Array.isArray(raw)) return [];
  return raw.reduce<NSKEventPayment[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const p = row as Partial<NSKEventPayment>;
    if (typeof p.amount !== "string" || parseAmount(p.amount) <= 0) return acc;
    if (typeof p.date !== "string" || !isValidEventDate(p.date)) return acc;
    acc.push({
      id: typeof p.id === "string" && p.id.trim() ? p.id : crypto.randomUUID(),
      amount: p.amount.trim(),
      date: p.date,
      note: typeof p.note === "string" && p.note.trim() ? p.note.trim() : undefined,
    });
    return acc;
  }, []);
}

function normalizeExpenses(raw: unknown, validEventIds: Set<string>): NSKEventExpense[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  return raw.reduce<NSKEventExpense[]>((acc, row) => {
    if (!row || typeof row !== "object") return acc;
    const e = row as Partial<NSKEventExpense>;
    if (typeof e.event_id !== "string" || !validEventIds.has(e.event_id)) return acc;
    if (typeof e.name !== "string" || e.name.trim().length === 0) return acc;
    if (typeof e.total_amount !== "string" || parseAmount(e.total_amount) < 0) return acc;
    const currency =
      typeof e.currency === "string" && e.currency.trim()
        ? e.currency.trim().toUpperCase()
        : "USD";
    const createdAt = typeof e.created_at === "string" ? e.created_at : now;
    const updatedAt = typeof e.updated_at === "string" ? e.updated_at : createdAt;
    acc.push({
      id: typeof e.id === "string" && e.id.trim() ? e.id : crypto.randomUUID(),
      event_id: e.event_id,
      name: e.name.trim(),
      total_amount: e.total_amount.trim(),
      currency,
      payments: normalizePayments(e.payments),
      order: typeof e.order === "number" && Number.isFinite(e.order) ? e.order : acc.length,
      created_at: createdAt,
      updated_at: updatedAt,
    });
    return acc;
  }, []);
}

function normalizeSchema(parsed: Partial<NSKEventsSchema> & Record<string, unknown>): NSKEventsSchema {
  const events = normalizeEvents(parsed.events);
  const validEventIds = new Set(events.map((e) => e.id));
  const families = normalizeFamilies(parsed.families, validEventIds);
  const validFamilyIds = new Set(families.map((f) => f.id));
  const guests = normalizeGuests(parsed.guests, validEventIds, validFamilyIds);
  const expenses = normalizeExpenses(parsed.expenses, validEventIds);
  return {
    version: NSKEVENTS_SCHEMA_VERSION,
    last_google_sync_at:
      typeof parsed.last_google_sync_at === "string" ? parsed.last_google_sync_at : null,
    events,
    families,
    guests,
    expenses,
  };
}

export function readNSKEventsStorage(sessionSuffix: string): NSKEventsSchema {
  if (typeof window === "undefined") return createEmptyNSKEventsSchema();

  const key = buildNskListAppStorageKey("events", sessionSuffix);
  const raw = window.localStorage.getItem(key);
  if (!raw) return createEmptyNSKEventsSchema();

  try {
    const parsed = JSON.parse(raw) as Partial<NSKEventsSchema> & Record<string, unknown>;
    return normalizeSchema(parsed);
  } catch {
    return createEmptyNSKEventsSchema();
  }
}

export function writeNSKEventsStorage(
  sessionSuffix: string,
  next: NSKEventsSchema,
  opts?: { skipPendingDriveMark?: boolean }
) {
  if (typeof window === "undefined") return;
  const key = buildNskListAppStorageKey("events", sessionSuffix);
  const payload = normalizeSchema(next);
  window.localStorage.setItem(key, JSON.stringify(payload));
  emitListAppDataUpdated(sessionSuffix);
  if (!opts?.skipPendingDriveMark) markPendingDriveSync(sessionSuffix);
}
