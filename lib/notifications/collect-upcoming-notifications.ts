import { getAppHref } from "@/lib/apps/catalog";
import type { AppId } from "@/lib/apps/catalog";
import type { Messages } from "@/lib/i18n/messages";
import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import type { DateTypeId } from "@/lib/dates/schema";
import { getNextOccurrenceDate, isUpcomingWithin30Days } from "@/lib/dates/dates-helpers";
import { readNSKDatesStorage } from "@/lib/dates/storage";
import { readNSKDomainsStorage } from "@/lib/domains/storage";
import { readNSKLinksStorage } from "@/lib/links/storage";
import { readNSKTasksStorage } from "@/lib/tasks/storage";
import { isYmdInNext30DaysInclusive, parseYmdLocal, startOfLocalDay } from "@/lib/notifications/date-window";
import type { UpcomingNotificationRow } from "@/lib/notifications/types";

function formatMediumDate(d: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(getIntlLocaleTag(locale), {
    dateStyle: "medium",
  }).format(d);
}

function hrefForApp(appId: AppId): string {
  return getAppHref(appId) ?? "/apps";
}

function sortStampFromYmd(ymd: string): number {
  const d = parseYmdLocal(ymd);
  return d ? d.getTime() : Number.MAX_SAFE_INTEGER;
}

function dateTypeLabel(t: Messages, typeId: DateTypeId): string {
  return t.dates.types[typeId];
}

export function collectUpcomingNotifications(args: {
  sessionSuffix: string;
  now: Date;
  locale: Locale;
  t: Messages;
}): UpcomingNotificationRow[] {
  const { sessionSuffix, now, locale, t } = args;
  const n = t.apps.notifications;
  const rows: UpcomingNotificationRow[] = [];

  const datesSchema = readNSKDatesStorage(sessionSuffix);
  for (const item of datesSchema.items) {
    if (!isUpcomingWithin30Days(item, now)) continue;
    const next = getNextOccurrenceDate(item, now);
    if (!next) continue;
    rows.push({
      id: `dates:${item.id}`,
      appId: "dates",
      sortTime: startOfLocalDay(next).getTime(),
      kindLabel: dateTypeLabel(t, item.type_id),
      itemTitle: item.label,
      dateLabel: formatMediumDate(next, locale),
      href: hrefForApp("dates"),
    });
  }

  const domainsSchema = readNSKDomainsStorage(sessionSuffix);
  for (const item of domainsSchema.items) {
    if (!isYmdInNext30DaysInclusive(item.expires_on, now)) continue;
    rows.push({
      id: `domains:${item.id}`,
      appId: "domains",
      sortTime: sortStampFromYmd(item.expires_on),
      kindLabel: n.kindDomainsExpiring,
      itemTitle: item.domain_name,
      dateLabel: formatMediumDate(parseYmdLocal(item.expires_on)!, locale),
      href: hrefForApp("domains"),
    });
  }

  const tasksSchema = readNSKTasksStorage(sessionSuffix);
  for (const task of tasksSchema.tasks) {
    if (task.archived) continue;
    if (task.status === "done") continue;
    const due = task.due_date?.trim();
    if (!due || !isYmdInNext30DaysInclusive(due, now)) continue;
    const d = parseYmdLocal(due);
    if (!d) continue;
    rows.push({
      id: `tasks:${task.id}`,
      appId: "tasks",
      sortTime: d.getTime(),
      kindLabel: n.kindTaskDue,
      itemTitle: task.title,
      dateLabel: formatMediumDate(d, locale),
      href: hrefForApp("tasks"),
    });
  }

  const linksSchema = readNSKLinksStorage(sessionSuffix);
  for (const item of linksSchema.items) {
    const due = item.review_due_date?.trim();
    if (!due || !isYmdInNext30DaysInclusive(due, now)) continue;
    const d = parseYmdLocal(due);
    if (!d) continue;
    const itemTitle =
      (item.title && item.title.trim()) ||
      (item.hostname && item.hostname.trim()) ||
      item.url;
    rows.push({
      id: `links:${item.id}`,
      appId: "links",
      sortTime: d.getTime(),
      kindLabel: n.kindLinkReview,
      itemTitle,
      dateLabel: formatMediumDate(d, locale),
      href: hrefForApp("links"),
    });
  }

  rows.sort((a, b) => a.sortTime - b.sortTime || a.itemTitle.localeCompare(b.itemTitle));
  return rows;
}
