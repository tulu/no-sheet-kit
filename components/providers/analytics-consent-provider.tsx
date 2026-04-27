"use client";

import Link from "next/link";
import Script from "next/script";
import { useLayoutEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  persistTrackingConsent,
  readStoredTrackingConsent,
  type TrackingConsentState,
} from "@/lib/analytics/consent-state";

export function AnalyticsConsentProvider() {
  const { t } = useI18n();
  /** `null` until client reads localStorage (SSR/hydration must not lock consent to "unknown"). */
  const [consent, setConsent] = useState<TrackingConsentState | null>(null);

  useLayoutEffect(() => {
    // One-time read after mount: server has no localStorage; useSyncExternalStore would need a misleading getServerSnapshot for the banner.
    queueMicrotask(() => {
      setConsent(readStoredTrackingConsent());
    });
  }, []);

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
  const gaEnabled = Boolean(measurementId);

  function acceptTracking() {
    persistTrackingConsent("accepted");
    setConsent("accepted");
  }

  function rejectTracking() {
    persistTrackingConsent("rejected");
    setConsent("rejected");
  }

  const shouldLoadGa = gaEnabled && consent === "accepted";
  const shouldShowBanner = gaEnabled && consent === "unknown";

  return (
    <>
      {shouldLoadGa ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}');`}
          </Script>
        </>
      ) : null}

      {shouldShowBanner ? (
        <div className="fixed right-4 bottom-4 z-50 w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-4 shadow-xl">
          <h2 className="text-sm font-semibold text-foreground">{t.common.tracking.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.common.tracking.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            <Link href="/privacy" className="underline underline-offset-2">
              {t.common.tracking.privacyLink}
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={rejectTracking}
              className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
            >
              {t.common.tracking.reject}
            </button>
            <button
              type="button"
              onClick={acceptTracking}
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-95"
            >
              {t.common.tracking.accept}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
