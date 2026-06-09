import { readNSKCollectionsStorage, writeNSKCollectionsStorage } from "@/lib/collections/storage";
import { readNSKDatesStorage, writeNSKDatesStorage } from "@/lib/dates/storage";
import { readNSKDomainsStorage, writeNSKDomainsStorage } from "@/lib/domains/storage";
import { readNSKLinksStorage, writeNSKLinksStorage } from "@/lib/links/storage";
import { readNSKLoansStorage, writeNSKLoansStorage } from "@/lib/loans/storage";
import { readNSKTasksStorage, writeNSKTasksStorage } from "@/lib/tasks/storage";
import { readNSKTrackerStorage, writeNSKTrackerStorage } from "@/lib/tracker/storage";
import { clearPendingDriveSync } from "@/lib/storage/pending-drive-sync";

/** After a successful Drive upload, set the same `last_google_sync_at` on every list-app payload and clear pending. */
export function applyDriveSyncTimestampToAllListApps(sessionSuffix: string, syncedAt: string): void {
  if (typeof window === "undefined") return;

  const loans = readNSKLoansStorage(sessionSuffix);
  writeNSKLoansStorage(sessionSuffix, { ...loans, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  const dates = readNSKDatesStorage(sessionSuffix);
  writeNSKDatesStorage(sessionSuffix, { ...dates, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  const links = readNSKLinksStorage(sessionSuffix);
  writeNSKLinksStorage(sessionSuffix, { ...links, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  const domains = readNSKDomainsStorage(sessionSuffix);
  writeNSKDomainsStorage(sessionSuffix, { ...domains, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  const tasks = readNSKTasksStorage(sessionSuffix);
  writeNSKTasksStorage(sessionSuffix, { ...tasks, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  const collections = readNSKCollectionsStorage(sessionSuffix);
  writeNSKCollectionsStorage(sessionSuffix, { ...collections, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  const tracker = readNSKTrackerStorage(sessionSuffix);
  writeNSKTrackerStorage(sessionSuffix, { ...tracker, last_google_sync_at: syncedAt }, {
    skipPendingDriveMark: true,
  });

  clearPendingDriveSync(sessionSuffix);
}
