import { lookup } from "node:dns/promises";
import { isPrivateHostname } from "@/lib/links/links-helpers";
import { isPrivateResolvedAddress } from "@/lib/security/is-private-ip";

/**
 * Ensures hostname resolves only to public addresses (mitigates DNS rebinding to private IPs).
 * Call after hostname string checks (e.g. isPrivateHostname).
 */
export async function assertPublicResolvableHost(hostname: string): Promise<void> {
  const h = hostname.trim().toLowerCase();
  if (!h || isPrivateHostname(h)) {
    throw new Error("Private hosts are not allowed");
  }

  let records: { address: string; family: number }[];
  try {
    records = await lookup(h, { all: true, verbatim: true });
  } catch {
    throw new Error("Invalid host");
  }
  if (!records.length) {
    throw new Error("Invalid host");
  }

  for (const r of records) {
    const fam = r.family === 6 ? 6 : 4;
    if (isPrivateResolvedAddress(r.address, fam)) {
      throw new Error("Private hosts are not allowed");
    }
  }
}
