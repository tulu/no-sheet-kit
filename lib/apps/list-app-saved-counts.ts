"use client";

import type { AppId } from "@/lib/apps/catalog";
import { readNSKCollectionsStorage } from "@/lib/collections/storage";
import { readNSKDatesStorage } from "@/lib/dates/storage";
import { readNSKDomainsStorage } from "@/lib/domains/storage";
import { readNSKLinksStorage } from "@/lib/links/storage";
import { readNSKLoansStorage } from "@/lib/loans/storage";
import { readNSKTasksStorage } from "@/lib/tasks/storage";
import { isTaskInUserSpace } from "@/lib/tasks/tasks-helpers";
import { readNSKEventsStorage } from "@/lib/events/storage";
import { readNSKTrackerStorage } from "@/lib/tracker/storage";

/** Count of user-visible “things” stored for each list app (same rules as normalized storage reads). */
export function getSavedElementCountForApp(appId: AppId, sessionSuffix: string): number {
  switch (appId) {
    case "loans":
      return readNSKLoansStorage(sessionSuffix).items.length;
    case "dates":
      return readNSKDatesStorage(sessionSuffix).items.length;
    case "links":
      return readNSKLinksStorage(sessionSuffix).items.length;
    case "domains":
      return readNSKDomainsStorage(sessionSuffix).items.length;
    case "tasks": {
      const schema = readNSKTasksStorage(sessionSuffix);
      return schema.tasks.filter((t) => isTaskInUserSpace(schema, t)).length;
    }
    case "collections": {
      const s = readNSKCollectionsStorage(sessionSuffix);
      return s.collections.length + s.items.length;
    }
    case "tracker":
      return readNSKTrackerStorage(sessionSuffix).entries.length;
    case "events":
      return readNSKEventsStorage(sessionSuffix).events.length;
    default:
      return 0;
  }
}
