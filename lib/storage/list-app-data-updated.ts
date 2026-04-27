/** Same-tab and cross-tab listeners can refresh UI that reads list-app localStorage. */
export const LIST_APP_DATA_UPDATED_EVENT = "nsk-list-app-data-updated";

export type ListAppDataUpdatedDetail = {
  sessionSuffix: string;
};

export function emitListAppDataUpdated(sessionSuffix: string): void {
  if (typeof window === "undefined") return;
  // Defer so listeners (e.g. header notifications bump) do not setState on another
  // tree while a parent is still in setState / commit (e.g. write inside useState updaters).
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent<ListAppDataUpdatedDetail>(LIST_APP_DATA_UPDATED_EVENT, {
        detail: { sessionSuffix },
      })
    );
  });
}
