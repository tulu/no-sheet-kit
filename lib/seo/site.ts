/** Official production origin for canonical URLs, sitemap, Open Graph, and JSON-LD. */
export const CANONICAL_PRODUCTION_ORIGIN = "https://www.nosheetkit.com";

/** Logo in `public/` — used for Open Graph, Twitter, and JSON-LD. */
export const siteLogoPath = "/nsk-iso.svg";

/** PNG logo — preferred for social crawlers that handle raster images better than SVG. */
export const siteLogoPngPath = "/nsk-iso.png";

export const siteName = "NoSheetKit";

/** Use www on the official domain so canonicals match https://www.nosheetkit.com */
function applyCanonicalWwwHost(url: URL): URL {
  const host = url.hostname.toLowerCase();
  if (host === "nosheetkit.com") {
    const canonical = new URL(url.href);
    canonical.hostname = "www.nosheetkit.com";
    return canonical;
  }
  return url;
}

/** Canonical site origin for metadata, Open Graph, sitemap, and robots. */
export function getMetadataBase(): URL {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    const normalized = fromEnv.replace(/\/$/, "");
    return applyCanonicalWwwHost(new URL(`${normalized}/`));
  }
  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, "");
    return applyCanonicalWwwHost(new URL(`https://${host}/`));
  }
  return new URL("http://localhost:3000/");
}

/** Origin string without trailing slash (e.g. https://www.nosheetkit.com). */
export function getCanonicalOrigin(): string {
  return getMetadataBase().origin.replace(/\/$/, "");
}
