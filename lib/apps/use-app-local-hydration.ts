"use client";

import type { Dispatch, SetStateAction } from "react";
import { useLayoutEffect } from "react";
import { readAppViewBundlePreference, type AppViewPersistenceKey } from "@/lib/apps/view-persistence";

export type AppViewCookieOptions<TView extends string> = {
  appViewKey: AppViewPersistenceKey;
  validModes: readonly TView[];
  defaultView: TView;
  setViewMode: Dispatch<SetStateAction<TView>>;
};

/**
 * One-shot client hydration: read localStorage + optional view preference from the shared views cookie, then commit in a microtask
 * (same pattern across NSK list apps; avoids setState-in-effect lint issues).
 */
export function useAppLocalHydration<TStore, TView extends string>(
  readStore: () => TStore,
  setStore: Dispatch<SetStateAction<TStore>>,
  setHydrated: Dispatch<SetStateAction<boolean>>,
  viewCookie: AppViewCookieOptions<TView>
): void {
  useLayoutEffect(() => {
    const nextStore = readStore();
    const fromView =
      readAppViewBundlePreference(viewCookie.appViewKey, viewCookie.validModes) ?? viewCookie.defaultView;
    queueMicrotask(() => {
      setStore(nextStore);
      viewCookie.setViewMode(fromView);
      setHydrated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; readStore / setters stable for app lifetime
  }, []);
}
