import { isIPv4, isIPv6 } from "node:net";

/** True if IPv4 address is loopback, link-local, private, CGNAT, or unspecified. */
export function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((x) => Number(x));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 127) return true;
  if (a === 10) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 203 && b === 0) return true;
  if (a >= 224) return true;
  return false;
}

/** True if IPv6 is loopback, link-local, unique local, or IPv4-mapped private. */
export function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("::ffff:")) {
    const v4 = lower.slice("::ffff:".length);
    if (isIPv4(v4)) return isPrivateIpv4(v4);
  }
  return false;
}

export function isPrivateResolvedAddress(address: string, family: 4 | 6): boolean {
  if (family === 4) {
    if (!isIPv4(address)) return true;
    return isPrivateIpv4(address);
  }
  if (!isIPv6(address)) return true;
  return isPrivateIpv6(address);
}
