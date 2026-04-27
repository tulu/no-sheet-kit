export const GA_CONSENT_STORAGE_KEY = "nsk_tracking_consent_v1";

export type TrackingConsentState = "unknown" | "accepted" | "rejected";

export function readStoredTrackingConsent(): TrackingConsentState {
  if (typeof window === "undefined") return "unknown";
  const raw = window.localStorage.getItem(GA_CONSENT_STORAGE_KEY);
  return raw === "accepted" || raw === "rejected" ? raw : "unknown";
}

export function persistTrackingConsent(next: Exclude<TrackingConsentState, "unknown">): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GA_CONSENT_STORAGE_KEY, next);
}
