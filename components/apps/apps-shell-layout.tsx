"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { AnonymousSessionBanner } from "./anonymous-session-banner";
import { AppsShellHeader } from "./apps-shell-header";
import { GoogleDriveRestoreBootstrap } from "./google-drive-restore-bootstrap";
import { SessionStorageSuffixProvider } from "@/lib/storage/session-storage-context";

type AppsShellLayoutProps = {
  children: ReactNode;
  showAnonymousBanner?: boolean;
  sessionKind: "anonymous" | "google";
  storageSuffix: string;
  googleEmail?: string;
  googleSub?: string;
  googleName?: string;
  googlePicture?: string;
};

export function AppsShellLayout({
  children,
  showAnonymousBanner = false,
  sessionKind,
  storageSuffix,
  googleEmail,
  googleSub,
  googleName,
  googlePicture,
}: AppsShellLayoutProps) {
  return (
    <SessionStorageSuffixProvider suffix={storageSuffix} sessionKind={sessionKind}>
      <div className="flex min-h-screen flex-col bg-background">
        <Suspense fallback={null}>
          <GoogleDriveRestoreBootstrap isGoogleSession={sessionKind === "google"} />
        </Suspense>
        <div className="sticky top-0 z-40 flex flex-col border-b border-border bg-background/90 backdrop-blur-md">
          {showAnonymousBanner ? <AnonymousSessionBanner /> : null}
          <AppsShellHeader
            sessionKind={sessionKind}
            storageSuffix={storageSuffix}
            googleEmail={googleEmail}
            googleSub={googleSub}
            googleName={googleName}
            googlePicture={googlePicture}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <LandingFooter />
      </div>
    </SessionStorageSuffixProvider>
  );
}
