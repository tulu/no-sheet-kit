import { readStoredTrackingConsent } from "@/lib/analytics/consent-state";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GtagParams = Record<string, string | number | boolean>;

/**
 * Sends a GA4 custom event via gtag when the user has accepted tracking and gtag is loaded.
 */
export function trackGtagEvent(eventName: string, params?: GtagParams): void {
  if (typeof window === "undefined") return;
  if (readStoredTrackingConsent() !== "accepted") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag("event", eventName, params ?? {});
}
