import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { DateTypeId } from "@/lib/dates/schema";
import type { NSKDateItem } from "@/lib/dates/schema";
import type { NSKDomainItem } from "@/lib/domains/schema";
import type { NSKLinkItem } from "@/lib/links/schema";
import type { NSKTask } from "@/lib/tasks/schema";

function formatYmdMedium(ymd: string, locale: Locale): string {
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), { dateStyle: "medium" }).format(d);
}

function tpl(template: string, vars: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(v);
  }
  return s;
}

function joinBlocks(detailParts: string[], footer: string): string {
  const head = detailParts.filter(Boolean).join("\n\n");
  return head.length > 0 ? `${head}\n\n${footer}` : footer;
}

export function buildDateCalendarCopy(args: {
  item: Pick<NSKDateItem, "label" | "type_id" | "date" | "notes">;
  t: Messages;
  locale: Locale;
}): { summary: string; description: string } {
  const { item, t, locale } = args;
  const gc = t.googleCalendar;
  const typeLabel = t.dates.types[item.type_id as DateTypeId];
  const dateStr = formatYmdMedium(item.date, locale);
  const summary = tpl(gc.titleDates, { typeLabel, label: item.label, date: dateStr });
  const detail: string[] = [];
  if (item.notes?.trim()) {
    detail.push(`${gc.descNotes}: ${item.notes.trim()}`);
  }
  const description = joinBlocks(detail, gc.eventCreatedAutomaticallyFooter);
  return { summary, description };
}

export function buildDomainCalendarCopy(args: {
  item: Pick<NSKDomainItem, "domain_name" | "expires_on" | "registrar" | "purchased_at" | "notes">;
  t: Messages;
  locale: Locale;
}): { summary: string; description: string } {
  const { item, t, locale } = args;
  const gc = t.googleCalendar;
  const dateStr = formatYmdMedium(item.expires_on, locale);
  const summary = tpl(gc.titleDomains, { domain: item.domain_name, date: dateStr });
  const detail: string[] = [];
  if (item.registrar?.trim()) {
    detail.push(`${gc.descRegistrar}: ${item.registrar.trim()}`);
  }
  if (item.purchased_at?.trim()) {
    detail.push(`${gc.descPurchased}: ${formatYmdMedium(item.purchased_at, locale)}`);
  }
  if (item.notes?.trim()) {
    detail.push(`${gc.descNotes}: ${item.notes.trim()}`);
  }
  const description = joinBlocks(detail, gc.eventCreatedAutomaticallyFooter);
  return { summary, description };
}

export function buildLinkCalendarCopy(args: {
  item: Pick<NSKLinkItem, "url" | "title" | "hostname" | "review_due_date">;
  t: Messages;
  locale: Locale;
}): { summary: string; description: string } {
  const { item, t, locale } = args;
  const gc = t.googleCalendar;
  const due = item.review_due_date ?? "";
  const dateStr = formatYmdMedium(due, locale);
  let title = item.title?.trim() || item.hostname?.trim();
  if (!title) {
    try {
      title = new URL(item.url).hostname;
    } catch {
      title = item.url;
    }
  }
  const summary = tpl(gc.titleLinks, { title, date: dateStr });
  const detail: string[] = [`${gc.descUrl}: ${item.url}`];
  const description = joinBlocks(detail, gc.eventCreatedAutomaticallyFooter);
  return { summary, description };
}

export function buildTaskCalendarCopy(args: {
  task: Pick<NSKTask, "title" | "description" | "due_date">;
  spaceName: string | null | undefined;
  t: Messages;
  locale: Locale;
}): { summary: string; description: string } {
  const { task, spaceName, t, locale } = args;
  const gc = t.googleCalendar;
  const due = task.due_date ?? "";
  const dateStr = formatYmdMedium(due, locale);
  const summary = tpl(gc.titleTasks, { title: task.title, date: dateStr });
  const detail: string[] = [];
  if (spaceName?.trim()) {
    detail.push(`${gc.descSpace}: ${spaceName.trim()}`);
  }
  if (task.description?.trim()) {
    detail.push(`${gc.descDescription}: ${task.description.trim()}`);
  }
  const description = joinBlocks(detail, gc.eventCreatedAutomaticallyFooter);
  return { summary, description };
}
