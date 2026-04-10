/** Build https URL for opening the site in a new tab; strips duplicate protocol. */
export function normalizeDomainSiteUrl(domainName: string): string {
  let host = domainName.trim();
  if (!host) return "";
  host = host.replace(/^https?:\/\//i, "");
  const slash = host.indexOf("/");
  if (slash >= 0) host = host.slice(0, slash);
  return `https://${host}`;
}
