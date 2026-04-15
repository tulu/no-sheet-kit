import { load, type CheerioAPI } from "cheerio";
import {
  generateAutoTags,
  isPrivateHostname,
  normalizeUrlInput,
  toValidHttpUrl,
  type LinkAutoTagHints,
} from "./links-helpers";

/** Large SPAs often emit `<meta property="og:*">` late in a huge HTML document. */
const MAX_RESPONSE_BYTES = 2_800_000;
const REQUEST_TIMEOUT_MS = 8000;
/** Scan start of HTML for og/twitter meta before full parse (helps when body is huge and response is byte-capped). */
const OG_IMAGE_PREFIX_SCAN_BYTES = 400_000;

const JSONLD_IMAGE_KEYS = new Set(["image", "thumbnailurl", "logo", "thumbnail"]);

export type EnrichedLinkData = {
  url: string;
  canonical_url?: string;
  site_origin?: string;
  hostname?: string;
  title?: string;
  description?: string;
  image_url?: string;
  favicon_url?: string;
  auto_tags: string[];
};

function resolveUrl(base: string, value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const u = new URL(value.trim(), base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    if (isPrivateHostname(u.hostname)) return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

function decodeEntity(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function cleanText(input?: string): string | undefined {
  if (!input) return undefined;
  const t = decodeEntity(input).replace(/\s+/g, " ").trim();
  return t || undefined;
}

function normalizeTitle(input?: string): string | undefined {
  return cleanText(input);
}

async function readResponseTextWithByteCap(
  response: Response,
  maxBytes: number,
  signal: AbortSignal
): Promise<string> {
  const body = response.body;
  if (!body) {
    const text = await response.text();
    const enc = new TextEncoder();
    const bytes = enc.encode(text);
    const capped = bytes.byteLength > maxBytes ? bytes.slice(0, maxBytes) : bytes;
    return new TextDecoder("utf-8", { fatal: false }).decode(capped);
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (total < maxBytes) {
      if (signal.aborted) throw new Error("Aborted");
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.length) continue;
      const room = maxBytes - total;
      if (value.length <= room) {
        chunks.push(value);
        total += value.length;
      } else {
        chunks.push(value.subarray(0, room));
        total += room;
        await reader.cancel().catch(() => {});
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

function metaContent($: CheerioAPI, prop: string): string | undefined {
  const v = $(`meta[property="${prop}"]`).first().attr("content");
  return cleanText(v);
}

function metaName($: CheerioAPI, name: string): string | undefined {
  const v = $(`meta[name="${name}"]`).first().attr("content");
  return cleanText(v);
}

function linkHref($: CheerioAPI, relNeedle: string): string | undefined {
  const needle = relNeedle.toLowerCase();
  const exact = $(`link[rel="${relNeedle}"]`).first().attr("href");
  if (exact) return cleanText(exact);
  const loose = $("link[rel]").filter((_, el) => {
    const rel = ($(el).attr("rel") ?? "").toLowerCase();
    const parts = rel.split(/\s+/).filter(Boolean);
    if (needle === "icon") {
      return rel.includes("icon") && !rel.includes("apple-touch");
    }
    return parts.includes(needle) || rel === needle;
  });
  return cleanText(loose.first().attr("href"));
}

function collectLdTypes(node: unknown, acc: Set<string>): void {
  if (node === null || node === undefined) return;
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") return;
  if (Array.isArray(node)) {
    for (const n of node) collectLdTypes(n, acc);
    return;
  }
  if (typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  const t = o["@type"];
  if (typeof t === "string") acc.add(t);
  else if (Array.isArray(t)) {
    for (const x of t) {
      if (typeof x === "string") acc.add(x);
    }
  }
  if (Array.isArray(o["@graph"])) collectLdTypes(o["@graph"], acc);
  for (const key of Object.keys(o)) {
    if (key === "@context" || key === "@type" || key === "@graph") continue;
    collectLdTypes(o[key], acc);
  }
}

function parseJsonLdTypes($: CheerioAPI): string[] {
  const acc = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as unknown;
      collectLdTypes(data, acc);
    } catch {
      // ignore invalid JSON-LD blocks
    }
  });
  return [...acc];
}

/** Microdata / RDFa: `itemtype` and `typeof` often use `https://schema.org/SoftwareSourceCode` (no JSON-LD). */
function extractSchemaOrgLocalNames(typeAttr: string): string[] {
  const names: string[] = [];
  for (const token of typeAttr.trim().split(/\s+/)) {
    const m = token.match(/schema\.org\/([^/#?"']+)/i);
    if (m?.[1]) names.push(m[1]);
  }
  return names;
}

function parseMicrodataSchemaTypes($: CheerioAPI): string[] {
  const acc = new Set<string>();
  $("[itemtype], [typeof]").each((_, el) => {
    const raw = ($(el).attr("itemtype") ?? $(el).attr("typeof"))?.trim();
    if (!raw) return;
    for (const n of extractSchemaOrgLocalNames(raw)) acc.add(n);
  });
  return [...acc];
}

function mergeSchemaTypeHints($: CheerioAPI): string[] {
  return dedupeStrings([...parseJsonLdTypes($), ...parseMicrodataSchemaTypes($)]);
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Best-effort og/twitter image from the first chunk of HTML (handles truncation / late body). */
function extractOgImageFromHtmlPrefix(html: string, baseUrl: string): string | undefined {
  const slice = html.slice(0, Math.min(html.length, OG_IMAGE_PREFIX_SCAN_BYTES));
  const patterns: RegExp[] = [
    /property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image:secure_url["']/i,
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    /name=["']twitter:image:src["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image:src["']/i,
  ];
  for (const re of patterns) {
    const m = slice.match(re);
    if (m?.[1]) {
      const resolved = resolveUrl(baseUrl, cleanText(m[1]));
      if (resolved) return resolved;
    }
  }
  return undefined;
}

function pushJsonLdImageishValue(val: unknown, acc: string[]): void {
  if (val === null || val === undefined) return;
  if (typeof val === "string") {
    const t = val.trim();
    if (t.startsWith("http://") || t.startsWith("https://")) acc.push(t);
    return;
  }
  if (Array.isArray(val)) {
    for (const x of val) pushJsonLdImageishValue(x, acc);
    return;
  }
  if (typeof val !== "object") return;
  const o = val as Record<string, unknown>;
  for (const k of ["url", "contentUrl"]) {
    const u = o[k];
    if (typeof u === "string") {
      const t = u.trim();
      if (t.startsWith("http://") || t.startsWith("https://")) acc.push(t);
    }
  }
}

function walkJsonLdForImageStrings(node: unknown, acc: string[]): void {
  if (node === null || node === undefined) return;
  if (typeof node === "string") {
    const t = node.trim();
    if (t.startsWith("http://") || t.startsWith("https://")) acc.push(t);
    return;
  }
  if (Array.isArray(node)) {
    for (const el of node) walkJsonLdForImageStrings(el, acc);
    return;
  }
  if (typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  for (const [key, val] of Object.entries(o)) {
    if (key === "@context") continue;
    const lower = key.toLowerCase();
    if (JSONLD_IMAGE_KEYS.has(lower)) {
      pushJsonLdImageishValue(val, acc);
    }
    walkJsonLdForImageStrings(val, acc);
  }
}

function extractFirstJsonLdImage($: CheerioAPI, baseUrl: string): string | undefined {
  const acc: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as unknown;
      walkJsonLdForImageStrings(data, acc);
    } catch {
      // ignore invalid JSON-LD
    }
  });
  for (const raw of dedupeStrings(acc)) {
    const resolved = resolveUrl(baseUrl, cleanText(raw) ?? raw);
    if (resolved) return resolved;
  }
  return undefined;
}

function buildHints($: CheerioAPI, ldTypes: string[]): LinkAutoTagHints {
  const articleTags: string[] = [];
  $('meta[property="article:tag"]').each((_, el) => {
    const c = $(el).attr("content");
    if (c?.trim()) articleTags.push(c.trim());
  });

  const kwRaw = metaName($, "keywords");
  const keywords = kwRaw ? [kwRaw] : undefined;

  return {
    ogType: metaContent($, "og:type"),
    twitterCard: metaName($, "twitter:card"),
    articleTags: articleTags.length ? articleTags : undefined,
    keywords,
    ldTypes: ldTypes.length ? ldTypes : undefined,
  };
}

function extractMetadata(html: string, finalUrl: string): EnrichedLinkData {
  const $ = load(html);
  const ldTypes = mergeSchemaTypeHints($);
  const hints = buildHints($, ldTypes);

  const canonical = resolveUrl(finalUrl, linkHref($, "canonical"));
  const ogTitle = metaContent($, "og:title");
  const twTitle = metaName($, "twitter:title");
  const description =
    metaContent($, "og:description") ?? metaName($, "description") ?? metaName($, "twitter:description");
  const fromPrefix = extractOgImageFromHtmlPrefix(html, finalUrl);
  const fromMeta =
    resolveUrl(finalUrl, metaContent($, "og:image:secure_url")) ??
    resolveUrl(finalUrl, metaContent($, "og:image")) ??
    resolveUrl(finalUrl, metaName($, "twitter:image")) ??
    resolveUrl(finalUrl, cleanText($("meta[name='twitter:image:src']").first().attr("content")));
  const fromJsonLd = extractFirstJsonLdImage($, finalUrl);
  const image =
    fromPrefix ??
    fromMeta ??
    fromJsonLd ??
    resolveUrl(
      finalUrl,
      cleanText(
        $("img[src]")
          .not('[src^="data:"]')
          .first()
          .attr("src")
      )
    );

  const favicon =
    resolveUrl(finalUrl, linkHref($, "apple-touch-icon")) ??
    resolveUrl(finalUrl, linkHref($, "icon")) ??
    resolveUrl(finalUrl, linkHref($, "shortcut icon")) ??
    resolveUrl(finalUrl, "/favicon.ico");

  const titleEl = $("title").first().text();
  const title = normalizeTitle(cleanText(titleEl) ?? ogTitle ?? twTitle);

  const final = new URL(finalUrl);
  return {
    url: finalUrl,
    canonical_url: canonical,
    site_origin: final.origin,
    hostname: final.hostname,
    title,
    description,
    image_url: image,
    favicon_url: favicon,
    auto_tags: generateAutoTags(title, description, hints),
  };
}

export async function enrichUrl(inputUrl: string): Promise<EnrichedLinkData> {
  const normalized = normalizeUrlInput(inputUrl);
  if (!normalized) {
    throw new Error("Invalid URL");
  }
  const parsed = toValidHttpUrl(normalized);
  if (!parsed) throw new Error("Invalid URL");
  if (isPrivateHostname(parsed.hostname)) {
    throw new Error("Private hosts are not allowed");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "NoSheetKitBot/1.0 (+https://nosheetkit.local)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    const finalUrl = response.url || parsed.toString();
    let finalParsed: URL;
    try {
      finalParsed = new URL(finalUrl);
    } catch {
      throw new Error("Invalid redirect URL");
    }
    if (finalParsed.protocol !== "http:" && finalParsed.protocol !== "https:") {
      throw new Error("Invalid redirect URL");
    }
    if (isPrivateHostname(finalParsed.hostname)) {
      throw new Error("Private hosts are not allowed");
    }
    const html = await readResponseTextWithByteCap(response, MAX_RESPONSE_BYTES, controller.signal);
    return extractMetadata(html, finalUrl);
  } finally {
    clearTimeout(timeoutId);
  }
}
