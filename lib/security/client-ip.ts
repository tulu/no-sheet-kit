/** First public client IP from common proxy headers (best-effort). */
export function getClientIpFromRequest(request: Request): string | undefined {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.split(",")[0]?.trim();
  const xri = request.headers.get("x-real-ip")?.trim();
  if (xri) return xri.split(",")[0]?.trim();
  const xff = request.headers.get("x-forwarded-for")?.trim();
  if (xff) return xff.split(",")[0]?.trim();
  return undefined;
}
