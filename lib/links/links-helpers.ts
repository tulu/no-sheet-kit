import { getIntlLocaleTag } from "@/lib/i18n/locale-display";
import type { Locale } from "@/lib/i18n/types";
import type { NSKLinkItem } from "./schema";

const TAG_SPLIT_RE = /[,\n]/;
const MAX_AUTO_TAGS = 6;

const KEYWORD_TAGS: Record<string, string[]> = {
  javascript: ["dev", "javascript"],
  typescript: ["dev", "typescript"],
  react: ["dev", "react"],
  nextjs: ["dev", "nextjs"],
  tailwind: ["dev", "css"],
  css: ["css", "design"],
  design: ["design"],
  ux: ["design", "ux"],
  product: ["product"],
  marketing: ["marketing"],
  seo: ["marketing", "seo"],
  ai: ["ai"],
  openai: ["ai"],
  anthropic: ["ai"],
  finance: ["finance"],
  money: ["finance"],
  startup: ["business"],
  business: ["business"],
  news: ["news"],
  tutorial: ["learning"],
  guide: ["learning"],
  docs: ["docs"],
};

/** Hints built only from standard metadata (OG, Twitter, JSON-LD, article tags). No hostname rules. */
export type LinkAutoTagHints = {
  ogType?: string;
  twitterCard?: string;
  articleTags?: string[];
  keywords?: string[];
  ldTypes?: string[];
};

export function toValidHttpUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw) return null;
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function normalizeUrlInput(input: string): string | null {
  const parsed = toValidHttpUrl(input);
  return parsed ? parsed.toString() : null;
}

/** Blocks localhost, .local, loopback, and common private IPv4 ranges (metadata / SSRF hygiene). */
export function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    if (a === 10 || a === 127) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }
  return h === "::1";
}

/** Normalizes http(s) URLs and drops private/local hosts (for canonical, OG image, favicon, etc.). */
export function normalizeOptionalPublicHttpUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const normalized = normalizeUrlInput(trimmed);
  if (!normalized) return undefined;
  try {
    const u = new URL(normalized);
    if (isPrivateHostname(u.hostname)) return undefined;
    return normalized;
  } catch {
    return undefined;
  }
}

export function parseTagsInput(input: string): string[] {
  return dedupeTags(
    input
      .split(TAG_SPLIT_RE)
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function tagsInputValue(tags: string[]): string {
  return tags.join(", ");
}

export function dedupeTags(tags: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const t = tag.trim().toLowerCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function mergeTags(manualTags: string[], autoTags: string[]): string[] {
  return dedupeTags([...manualTags, ...autoTags]);
}

function normalizeHintTag(raw: string): string | undefined {
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/[#]+/g, "")
    .replace(/[^a-z0-9+.-]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t || t.length > 48) return undefined;
  return t.replace(/\s+/g, "-");
}

function tagsFromLdTypes(ldTypes: string[] | undefined): string[] {
  if (!ldTypes?.length) return [];
  const out: string[] = [];
  for (const raw of ldTypes) {
    const t = raw.replace(/\s+/g, "").toLowerCase();
    if (t.includes("videoobject") || t === "clip" || t === "movie") out.push("video");
    if (
      t.includes("article") ||
      t.includes("newsarticle") ||
      t.includes("blogposting") ||
      t.includes("techarticle")
    ) {
      out.push("article");
    }
    if (t.includes("softwaresourcecode")) out.push("dev", "repository");
    if (t.includes("coderepository") || t === "repository") out.push("repository");
    if (t.includes("podcast") || t.includes("podcastepisode")) out.push("podcast");
    if (t.includes("music") && (t.includes("recording") || t.includes("album"))) out.push("music");
  }
  return out;
}

function tagsFromOgType(ogType: string | undefined): string[] {
  if (!ogType?.trim()) return [];
  const o = ogType.trim().toLowerCase();
  const out: string[] = [];
  if (o.includes("video")) out.push("video");
  if (o.includes("article")) out.push("article");
  if (o.startsWith("music.") || o.includes("music")) out.push("music");
  if (o.includes("book")) out.push("book");
  return out;
}

function tagsFromTwitterCard(card: string | undefined): string[] {
  const c = card?.trim().toLowerCase();
  if (c === "player") return ["video"];
  return [];
}

function keywordTokensFromMeta(keywords: string[] | undefined): string[] {
  if (!keywords?.length) return [];
  const out: string[] = [];
  for (const line of keywords) {
    for (const part of line.split(TAG_SPLIT_RE)) {
      const n = normalizeHintTag(part);
      if (n) out.push(n);
    }
  }
  return out;
}

export function generateAutoTags(
  title?: string,
  description?: string,
  hints?: LinkAutoTagHints
): string[] {
  const ordered: string[] = [];

  ordered.push(...tagsFromLdTypes(hints?.ldTypes));
  ordered.push(...tagsFromOgType(hints?.ogType));
  ordered.push(...tagsFromTwitterCard(hints?.twitterCard));
  ordered.push(...keywordTokensFromMeta(hints?.keywords));

  const textSource = `${title ?? ""} ${description ?? ""}`.toLowerCase();
  const fromDict: string[] = [];
  if (textSource.trim()) {
    const tokens = textSource
      .split(/[^a-z0-9+#.-]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    for (const token of tokens) {
      const mapped = KEYWORD_TAGS[token];
      if (mapped) fromDict.push(...mapped);
    }
  }

  const fromArticleMeta: string[] = [];
  for (const tag of hints?.articleTags ?? []) {
    const n = normalizeHintTag(tag);
    if (n) fromArticleMeta.push(n);
  }

  return dedupeTags([...ordered, ...fromDict, ...fromArticleMeta]).slice(0, MAX_AUTO_TAGS);
}

export function linkDisplayTitle(item: NSKLinkItem): string {
  if (item.title?.trim()) return item.title.trim();
  if (item.hostname?.trim()) return item.hostname.trim();
  return item.url;
}

function stripWwwHost(host: string): string {
  return host.replace(/^www\./i, "");
}

/**
 * Site label for cards: registrable hostname only (no scheme, path, or query), consistent for every link.
 */
export function linkCardSiteLabel(item: NSKLinkItem): string {
  const stored = item.hostname?.trim();
  if (stored) return stripWwwHost(stored.toLowerCase());
  for (const raw of [item.canonical_url, item.url]) {
    const s = raw?.trim();
    if (!s) continue;
    try {
      return stripWwwHost(new URL(s).hostname.toLowerCase());
    } catch {
      continue;
    }
  }
  return "";
}

/** Full URL for tooltips (canonical when present). */
export function linkCardSourceTitle(item: NSKLinkItem): string {
  const full = (item.canonical_url?.trim() || item.url?.trim() || "").trim();
  if (full) return full;
  return linkCardSiteLabel(item);
}

export function linkFaviconSources(rawUrl: string, explicitFaviconUrl?: string): string[] {
  const out: string[] = [];
  if (explicitFaviconUrl?.trim()) out.push(explicitFaviconUrl.trim());
  try {
    const parsed = new URL(rawUrl);
    out.push(new URL("/favicon.ico", parsed).toString());
    out.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=64`
    );
  } catch {
    // ignore fallback URL generation
  }
  out.push("/nsk-iso.svg");
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const src of out) {
    const key = src.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(key);
  }
  return unique;
}

export function tagsWithCount(items: NSKLinkItem[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    for (const tag of mergeTags(item.manual_tags, item.auto_tags)) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count - a.count !== 0 ? b.count - a.count : a.tag.localeCompare(b.tag)));
}

export function itemHasTag(item: NSKLinkItem, tag: string): boolean {
  return mergeTags(item.manual_tags, item.auto_tags).includes(tag.toLowerCase().trim());
}

/** Lowercased concatenation of stored link fields for substring search. */
export function linkSearchHaystack(item: NSKLinkItem): string {
  const parts: (string | undefined)[] = [
    item.id,
    item.url,
    item.canonical_url,
    item.site_origin,
    item.hostname,
    item.title,
    item.description,
    item.image_url,
    item.favicon_url,
    item.error_message,
    item.status,
    item.created_at,
    item.updated_at,
    item.reviewed_at,
    item.review_due_date,
    ...item.manual_tags,
    ...item.auto_tags,
  ];
  return parts
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .join(" ")
    .toLowerCase();
}

/** Every whitespace-separated token must appear somewhere in the haystack (AND). */
export function linkMatchesSearch(item: NSKLinkItem, query: string): boolean {
  const haystack = linkSearchHaystack(item);
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((token) => haystack.includes(token));
}

export function formatDateShort(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(getIntlLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function encodeTagFilter(tag: string): string {
  return `tag:${encodeURIComponent(tag)}`;
}

export function decodeTagFilter(filterId: string): string | null {
  if (!filterId.startsWith("tag:")) return null;
  try {
    return decodeURIComponent(filterId.slice(4));
  } catch {
    return null;
  }
}
