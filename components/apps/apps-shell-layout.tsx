"use client";

import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { AppsShellHeader } from "./apps-shell-header";

export function AppsShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppsShellHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <LandingFooter />
    </div>
  );
}
