"use client";

import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { AnonymousSessionBanner } from "./anonymous-session-banner";
import { AppsShellHeader } from "./apps-shell-header";

type AppsShellLayoutProps = {
  children: ReactNode;
  showAnonymousBanner?: boolean;
};

export function AppsShellLayout({ children, showAnonymousBanner = false }: AppsShellLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 flex flex-col border-b border-border bg-background/90 backdrop-blur-md">
        {showAnonymousBanner ? <AnonymousSessionBanner /> : null}
        <AppsShellHeader />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <LandingFooter />
    </div>
  );
}
