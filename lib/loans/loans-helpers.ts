import { tokensMatchHaystack } from "@/lib/apps/filter-items-by-search";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import type { LoanFilterId, LoanDirection, NSKLoanItem } from "./schema";

const loanNumberFormatters = new Map<string, Intl.NumberFormat>();

const AMOUNT_EPSILON = 0.009;

/** Parse user amount string (comma or dot decimals). */
export function parseAmount(value: string): number {
  const t = value.trim().replace(",", ".");
  if (!t) return 0;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

/** Locale-aware grouping for loan amounts shown in UI (not for persisted strings). */
export function formatLoanNumber(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return "0";
  const tag = getIntlLocaleTag(locale);
  let fmt = loanNumberFormatters.get(tag);
  if (!fmt) {
    fmt = new Intl.NumberFormat(tag, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    loanNumberFormatters.set(tag, fmt);
  }
  return fmt.format(value);
}

export function totalPaid(loan: NSKLoanItem): number {
  let sum = 0;
  for (const p of loan.payments) {
    sum += parseAmount(p.amount);
  }
  return sum;
}

export function outstandingBalance(loan: NSKLoanItem): number {
  const loanAmount = parseAmount(loan.amount);
  return Math.max(0, loanAmount - totalPaid(loan));
}

/** Remaining loan principal capacity for a new or edited payment (`excludePaymentId` skips that row when editing). */
export function maxAdditionalPayment(loan: NSKLoanItem, excludePaymentId: string | null): number {
  const cap = parseAmount(loan.amount);
  let sum = 0;
  for (const p of loan.payments) {
    if (excludePaymentId && p.id === excludePaymentId) continue;
    sum += parseAmount(p.amount);
  }
  return Math.max(0, cap - sum);
}

export function isLoanActive(loan: NSKLoanItem): boolean {
  return outstandingBalance(loan) > AMOUNT_EPSILON;
}

export function isLoanSettled(loan: NSKLoanItem): boolean {
  return parseAmount(loan.amount) > 0 && !isLoanActive(loan);
}

/** Active loans first, then settled; within each group, newest `updated_at` first. */
export function compareLoansForDisplay(a: NSKLoanItem, b: NSKLoanItem): number {
  const aActive = isLoanActive(a);
  const bActive = isLoanActive(b);
  if (aActive !== bActive) return aActive ? -1 : 1;
  const byUpdated = b.updated_at.localeCompare(a.updated_at);
  if (byUpdated !== 0) return byUpdated;
  return a.counterparty_name.localeCompare(b.counterparty_name);
}

export function loanMatchesFilter(loan: NSKLoanItem, filter: LoanFilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "lent":
      return loan.direction === "lent";
    case "borrowed":
      return loan.direction === "borrowed";
    case "active":
      return isLoanActive(loan);
    case "settled":
      return isLoanSettled(loan);
    default:
      return true;
  }
}

/** Sum outstanding for loans matching predicate, grouped by trimmed upper currency. */
export function aggregateOutstandingByCurrency(
  loans: NSKLoanItem[],
  predicate: (loan: NSKLoanItem) => boolean
): Map<string, number> {
  const map = new Map<string, number>();
  for (const loan of loans) {
    if (!predicate(loan)) continue;
    const cur = loan.currency.trim().toUpperCase() || "—";
    const out = outstandingBalance(loan);
    if (out <= AMOUNT_EPSILON) continue;
    map.set(cur, (map.get(cur) ?? 0) + out);
  }
  return map;
}

export function mapToSortedEntries(map: Map<string, number>): { currency: string; value: number }[] {
  return [...map.entries()]
    .map(([currency, value]) => ({ currency, value }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

/** Net per currency: lent outstanding (receivable) minus borrowed outstanding (payable). */
export function balanceByCurrency(loans: NSKLoanItem[]): Map<string, number> {
  const lent = aggregateOutstandingByCurrency(loans, (l) => l.direction === "lent");
  const borrowed = aggregateOutstandingByCurrency(loans, (l) => l.direction === "borrowed");
  const keys = new Set([...lent.keys(), ...borrowed.keys()]);
  const out = new Map<string, number>();
  for (const k of keys) {
    out.set(k, (lent.get(k) ?? 0) - (borrowed.get(k) ?? 0));
  }
  return out;
}

export function directionSemantic(direction: LoanDirection): string {
  return direction === "lent" ? "loan_lent" : "loan_borrowed";
}

export function statusSemantic(loan: NSKLoanItem): string {
  return isLoanActive(loan) ? "loan_active" : "loan_settled";
}

function loanSearchHaystack(item: NSKLoanItem): string {
  const pay = item.payments.map((p) => `${p.amount} ${p.date}`).join(" ");
  return [
    item.counterparty_name,
    item.currency,
    item.amount,
    item.date,
    item.direction,
    item.notes ?? "",
    pay,
  ]
    .join(" ")
    .toLowerCase();
}

export function loanMatchesSearch(item: NSKLoanItem, rawQuery: string): boolean {
  return tokensMatchHaystack(rawQuery, loanSearchHaystack(item));
}
