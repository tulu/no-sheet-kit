/** Canonical site origin for metadata, Open Graph, sitemap, and robots. */
export function getMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    const normalized = fromEnv.replace(/\/$/, "");
    return new URL(`${normalized}/`);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}/`);
  }
  return new URL("http://localhost:3000/");
}

export const siteName = "NoSheetKit";

/** Logo in `public/` — used for Open Graph, Twitter, and JSON-LD. */
export const siteLogoPath = "/nsk-iso.svg";
