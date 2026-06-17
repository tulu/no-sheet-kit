import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import { parseAmount, formatLoanNumber } from "@/lib/loans/loans-helpers";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import type { NSKTask } from "@/lib/tasks/schema";
import {
  type EventGuestRsvpStatus,
  type NSKEvent,
  type NSKEventExpense,
  type NSKEventFamily,
  type NSKEventGuest,
  type NSKEventsSchema,
} from "./schema";

const AMOUNT_EPSILON = 0.009;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidEventDate(value: string): boolean {
  return DATE_RE.test(value);
}

export function isValidEventTime(value: string): boolean {
  return TIME_RE.test(value);
}

function formatEventDateLabel(iso: string, locale: Locale): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEventStartLabel(
  event: Pick<NSKEvent, "start_date" | "start_time">,
  locale: Locale
): string | undefined {
  if (!event.start_date || !isValidEventDate(event.start_date)) return undefined;
  const dateLabel = formatEventDateLabel(event.start_date, locale);
  if (event.start_time && isValidEventTime(event.start_time)) {
    return `${dateLabel} ${event.start_time}`;
  }
  return dateLabel;
}

export function formatEventSidebarSubtitle(
  event: Pick<NSKEvent, "start_date" | "start_time" | "location">,
  locale: Locale
): string | undefined {
  const parts: string[] = [];
  const start = formatEventStartLabel(event, locale);
  if (start) parts.push(start);
  const location = event.location?.trim();
  if (location) parts.push(location);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function sortEvents(events: NSKEvent[]): NSKEvent[] {
  return [...events].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function familiesInEvent(families: NSKEventFamily[], eventId: string): NSKEventFamily[] {
  return families
    .filter((f) => f.event_id === eventId)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function guestsInEvent(guests: NSKEventGuest[], eventId: string): NSKEventGuest[] {
  return guests
    .filter((g) => g.event_id === eventId)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function expensesInEvent(expenses: NSKEventExpense[], eventId: string): NSKEventExpense[] {
  return expenses
    .filter((e) => e.event_id === eventId)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function guestSummary(guests: NSKEventGuest[], families: NSKEventFamily[]) {
  return {
    guestCount: guests.length,
    familyCount: families.length,
    kidCount: guests.filter((g) => g.is_kid).length,
  };
}

export type EventDashboardStats = {
  guests: {
    total: number;
    families: number;
    kids: number;
    rsvpConfirmed: number;
    rsvpPending: number;
    rsvpDeclined: number;
    invitationsSent: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    pending: number;
  };
  expenses: {
    count: number;
    byCurrency: ExpenseCurrencyTotals[];
  };
};

export type ExpenseCurrencyTotals = {
  currency: string;
  total: number;
  paid: number;
  pending: number;
};

export function eventDashboardStats(
  guests: NSKEventGuest[],
  families: NSKEventFamily[],
  tasks: NSKTask[],
  expenses: NSKEventExpense[]
): EventDashboardStats {
  const summary = guestSummary(guests, families);
  const expense = expenseTotalsByCurrency(expenses);
  const activeTasks = tasks.filter((t) => !t.archived);
  const todo = activeTasks.filter((t) => t.status === "todo").length;
  const inProgress = activeTasks.filter((t) => t.status === "in_progress").length;
  const done = activeTasks.filter((t) => t.status === "done").length;

  return {
    guests: {
      total: summary.guestCount,
      families: summary.familyCount,
      kids: summary.kidCount,
      rsvpConfirmed: guests.filter((g) => g.rsvp_status === "confirmed").length,
      rsvpPending: guests.filter((g) => g.rsvp_status === "pending").length,
      rsvpDeclined: guests.filter((g) => g.rsvp_status === "declined").length,
      invitationsSent: guests.filter((g) => g.invitation_sent).length,
    },
    tasks: {
      total: activeTasks.length,
      todo,
      inProgress,
      done,
      pending: todo + inProgress,
    },
    expenses: {
      count: expenses.length,
      byCurrency: expense,
    },
  };
}

export function expensePaidAmount(expense: NSKEventExpense): number {
  let sum = 0;
  for (const p of expense.payments) {
    sum += parseAmount(p.amount);
  }
  return sum;
}

export function expensePendingAmount(expense: NSKEventExpense): number {
  return Math.max(0, parseAmount(expense.total_amount) - expensePaidAmount(expense));
}

export function isExpenseFullyPaid(expense: NSKEventExpense): boolean {
  return expensePendingAmount(expense) <= AMOUNT_EPSILON;
}

export function expenseStatusSemantic(expense: NSKEventExpense): "expense_paid" | "expense_pending" {
  return isExpenseFullyPaid(expense) ? "expense_paid" : "expense_pending";
}

export function expenseMatchesSearch(expense: NSKEventExpense, query: string): boolean {
  if (!query.trim()) return true;
  const paymentHay = expense.payments
    .map((p) => [p.amount, p.date, p.note ?? ""].join(" "))
    .join("\n");
  return tokensMatchHaystack(query, [expense.name, expense.currency, paymentHay].join("\n"));
}

export function expenseCurrency(expense: NSKEventExpense): string {
  return expense.currency.trim().toUpperCase() || "USD";
}

export function expenseTotalsByCurrency(expenses: NSKEventExpense[]): ExpenseCurrencyTotals[] {
  const map = new Map<string, { total: number; paid: number }>();
  for (const e of expenses) {
    const cur = expenseCurrency(e);
    const entry = map.get(cur) ?? { total: 0, paid: 0 };
    entry.total += parseAmount(e.total_amount);
    entry.paid += expensePaidAmount(e);
    map.set(cur, entry);
  }
  return [...map.entries()]
    .map(([currency, { total, paid }]) => ({
      currency,
      total,
      paid,
      pending: Math.max(0, total - paid),
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}


export function formatEventMoney(amount: number, locale: Locale): string {
  return formatLoanNumber(amount, locale);
}

export function formatEventMoneyLabel(amount: number, currency: string, locale: Locale): string {
  const code = currency.trim().toUpperCase() || "USD";
  return `${code} ${formatLoanNumber(amount, locale)}`;
}

/** e.g. "25 de 500 USD pagado (5%)" */
export function formatExpensePaidOfCaption(
  row: { currency: string; total: number; paid: number },
  locale: Locale,
  template: string
): string {
  const currency = row.currency.trim().toUpperCase() || "USD";
  const percent = row.total > 0 ? Math.round((row.paid / row.total) * 100) : 0;
  return template
    .replace("{paid}", formatEventMoney(row.paid, locale))
    .replace("{total}", formatEventMoney(row.total, locale))
    .replace("{currency}", currency)
    .replace("{percent}", String(percent));
}

export function maxAdditionalExpensePayment(
  expense: NSKEventExpense,
  excludePaymentId: string | null
): number {
  const cap = parseAmount(expense.total_amount);
  let sum = 0;
  for (const p of expense.payments) {
    if (excludePaymentId && p.id === excludePaymentId) continue;
    sum += parseAmount(p.amount);
  }
  return Math.max(0, cap - sum);
}

export function applyFamilyInvitationCascade(
  schema: NSKEventsSchema,
  familyId: string,
  sent: boolean
): NSKEventsSchema {
  const now = new Date().toISOString();
  const families = schema.families.map((f) =>
    f.id === familyId ? { ...f, invitation_sent: sent, updated_at: now } : f
  );
  const guests = schema.guests.map((g) =>
    g.family_id === familyId ? { ...g, invitation_sent: sent, updated_at: now } : g
  );
  return { ...schema, families, guests };
}

export function applyFamilyRsvpCascade(
  schema: NSKEventsSchema,
  familyId: string,
  status: EventGuestRsvpStatus
): NSKEventsSchema {
  const now = new Date().toISOString();
  const families = schema.families.map((f) =>
    f.id === familyId ? { ...f, rsvp_status: status, updated_at: now } : f
  );
  const guests = schema.guests.map((g) =>
    g.family_id === familyId ? { ...g, rsvp_status: status, updated_at: now } : g
  );
  return { ...schema, families, guests };
}

export function guestDisplayName(guest: NSKEventGuest): string {
  const last = guest.last_name?.trim();
  return last ? `${guest.name} ${last}` : guest.name;
}

export function compareEventGuestsByName(a: NSKEventGuest, b: NSKEventGuest): number {
  const lastCmp = (a.last_name ?? "").trim().localeCompare((b.last_name ?? "").trim(), undefined, {
    sensitivity: "base",
  });
  if (lastCmp !== 0) return lastCmp;
  return a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: "base" });
}

export function sortEventGuestsByName(guests: NSKEventGuest[]): NSKEventGuest[] {
  return [...guests].sort(compareEventGuestsByName);
}

export function filterEventGuests(
  guests: NSKEventGuest[],
  families: NSKEventFamily[],
  query: string,
  filters: EventGuestListFilters = EMPTY_EVENT_GUEST_FILTERS
): NSKEventGuest[] {
  const q = query.trim().toLowerCase();
  let result = guests;

  if (q) {
    const matchingFamilyIds = new Set(
      families.filter((f) => f.name.toLowerCase().includes(q)).map((f) => f.id)
    );

    result = result.filter((guest) => {
      const full = guestDisplayName(guest).toLowerCase();
      if (full.includes(q) || guest.name.toLowerCase().includes(q)) return true;
      if (guest.last_name?.toLowerCase().includes(q)) return true;
      if (guest.email?.toLowerCase().includes(q)) return true;
      if (guest.family_id && matchingFamilyIds.has(guest.family_id)) return true;
      return false;
    });
  }

  return sortEventGuestsByName(applyEventGuestFilters(result, filters));
}

export type EventGuestKidFilter = "kid" | "adult";

export type EventGuestListFilters = {
  rsvpStatuses: EventGuestRsvpStatus[];
  invitationSent: boolean[];
  kidOptions: EventGuestKidFilter[];
};

export const EMPTY_EVENT_GUEST_FILTERS: EventGuestListFilters = {
  rsvpStatuses: [],
  invitationSent: [],
  kidOptions: [],
};

export function hasActiveGuestFilters(filters: EventGuestListFilters): boolean {
  return (
    filters.rsvpStatuses.length > 0 ||
    filters.invitationSent.length > 0 ||
    filters.kidOptions.length > 0
  );
}

export function countActiveGuestFilters(filters: EventGuestListFilters): number {
  return filters.rsvpStatuses.length + filters.invitationSent.length + filters.kidOptions.length;
}

function applyEventGuestFilters(
  guests: NSKEventGuest[],
  filters: EventGuestListFilters
): NSKEventGuest[] {
  if (!hasActiveGuestFilters(filters)) return guests;

  return guests.filter((guest) => {
    if (
      filters.rsvpStatuses.length > 0 &&
      !filters.rsvpStatuses.includes(guest.rsvp_status)
    ) {
      return false;
    }
    if (
      filters.invitationSent.length > 0 &&
      !filters.invitationSent.includes(guest.invitation_sent)
    ) {
      return false;
    }
    if (filters.kidOptions.length > 0) {
      const matchesKid = filters.kidOptions.includes("kid") && guest.is_kid;
      const matchesAdult = filters.kidOptions.includes("adult") && !guest.is_kid;
      if (!matchesKid && !matchesAdult) return false;
    }
    return true;
  });
}

export function familyNameById(
  families: NSKEventFamily[],
  familyId: string | undefined
): string | undefined {
  if (!familyId) return undefined;
  return families.find((f) => f.id === familyId)?.name;
}

export type FamilyGuestSection = {
  family: NSKEventFamily;
  members: NSKEventGuest[];
};

export function buildFamilyGuestSections(
  families: NSKEventFamily[],
  filteredGuests: NSKEventGuest[],
  search: string
): FamilyGuestSection[] {
  const q = search.trim().toLowerCase();
  return families
    .map((family) => {
      const members = filteredGuests.filter((g) => g.family_id === family.id);
      const nameMatches = q.length > 0 && family.name.toLowerCase().includes(q);
      if (members.length === 0 && !nameMatches) return null;
      return { family, members };
    })
    .filter((row): row is FamilyGuestSection => row != null)
    .sort((a, b) =>
      a.family.name.localeCompare(b.family.name, undefined, { sensitivity: "base" })
    );
}

export function countFamilyMembersByKid(members: NSKEventGuest[]): { adults: number; kids: number } {
  let adults = 0;
  let kids = 0;
  for (const member of members) {
    if (member.is_kid) kids += 1;
    else adults += 1;
  }
  return { adults, kids };
}

export type FamilyRsvpStatusCounts = {
  confirmed: number;
  pending: number;
  declined: number;
};

export type FamilyKidRsvpBreakdown = {
  adults: FamilyRsvpStatusCounts;
  kids: FamilyRsvpStatusCounts;
};

function emptyRsvpStatusCounts(): FamilyRsvpStatusCounts {
  return { confirmed: 0, pending: 0, declined: 0 };
}

export function familyRsvpBreakdownByKid(members: NSKEventGuest[]): FamilyKidRsvpBreakdown {
  const adults = emptyRsvpStatusCounts();
  const kids = emptyRsvpStatusCounts();
  for (const member of members) {
    const bucket = member.is_kid ? kids : adults;
    bucket[member.rsvp_status] += 1;
  }
  return { adults, kids };
}

export function formatFamilyRsvpBreakdown(
  counts: FamilyRsvpStatusCounts,
  rsvpLabels: { confirmed: string; pending: string; declined: string }
): string {
  return [
    `${counts.confirmed} ${rsvpLabels.confirmed}`,
    `${counts.pending} ${rsvpLabels.pending}`,
    `${counts.declined} ${rsvpLabels.declined}`,
  ].join(" · ");
}
