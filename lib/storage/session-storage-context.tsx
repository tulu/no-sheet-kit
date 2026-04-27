"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SESSION_SUFFIX_ANONYMOUS } from "./session-storage-keys";

export type AppsSessionKind = "anonymous" | "google";

type SessionStorageContextValue = {
  suffix: string;
  sessionKind: AppsSessionKind;
};

const defaultValue: SessionStorageContextValue = {
  suffix: SESSION_SUFFIX_ANONYMOUS,
  sessionKind: "anonymous",
};

const SessionStorageContext = createContext<SessionStorageContextValue>(defaultValue);

export function SessionStorageSuffixProvider({
  suffix,
  sessionKind = "anonymous",
  children,
}: {
  suffix: string;
  sessionKind?: AppsSessionKind;
  children: ReactNode;
}) {
  return (
    <SessionStorageContext.Provider value={{ suffix, sessionKind }}>{children}</SessionStorageContext.Provider>
  );
}

export function useSessionStorageSuffix(): string {
  return useContext(SessionStorageContext).suffix;
}

export function useAppsSessionKind(): AppsSessionKind {
  return useContext(SessionStorageContext).sessionKind;
}
