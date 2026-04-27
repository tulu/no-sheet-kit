import type { AppId } from "@/lib/apps/catalog";

export type UpcomingNotificationRow = {
  /** Stable key for React lists. */
  id: string;
  appId: AppId;
  /** Sort ascending (soonest first). */
  sortTime: number;
  /** What the date means (e.g. review due, expiring soon, date type). */
  kindLabel: string;
  /** Entity name (domain, task title, link label, …). */
  itemTitle: string;
  /** Formatted calendar date. */
  dateLabel: string;
  href: string;
};
