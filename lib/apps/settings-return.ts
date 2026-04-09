/** Internal path safe to use as Settings "back" target (must stay under /apps, not settings). */
export function safeSettingsReturnTo(raw: string | null): string {
  if (raw == null || raw === "") return "/apps";
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return "/apps";
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/apps";
  if (!decoded.startsWith("/apps")) return "/apps";
  if (decoded.startsWith("/apps/settings")) return "/apps";
  return decoded;
}
