const prefix = "nsk_google_profile_";

export function googleProfileStorageKey(sub: string): string {
  return `${prefix}${sub.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export type StoredGoogleProfile = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export function writeGoogleProfileLocal(sub: string, profile: StoredGoogleProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(googleProfileStorageKey(sub), JSON.stringify(profile));
  } catch {
    /* ignore quota */
  }
}

export function readGoogleProfileLocal(sub: string): StoredGoogleProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(googleProfileStorageKey(sub));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredGoogleProfile;
  } catch {
    return null;
  }
}

export function clearGoogleProfileLocal(sub: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(googleProfileStorageKey(sub));
}
