"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SESSION_SUFFIX_ANONYMOUS } from "./session-storage-keys";

const SessionStorageSuffixContext = createContext<string>(SESSION_SUFFIX_ANONYMOUS);

export function SessionStorageSuffixProvider({
  suffix,
  children,
}: {
  suffix: string;
  children: ReactNode;
}) {
  return (
    <SessionStorageSuffixContext.Provider value={suffix}>{children}</SessionStorageSuffixContext.Provider>
  );
}

export function useSessionStorageSuffix(): string {
  return useContext(SessionStorageSuffixContext);
}
