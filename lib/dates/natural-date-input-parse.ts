import { casual as enCasual, type Chrono } from "chrono-node";
import { casual as deCasual } from "chrono-node/de";
import { casual as esCasual } from "chrono-node/es";
import { casual as frCasual } from "chrono-node/fr";
import { casual as itCasual } from "chrono-node/it";
import { casual as ptCasual } from "chrono-node/pt";

const CHRONOS: Chrono[] = [enCasual, esCasual, ptCasual, frCasual, deCasual, itCasual];

export type NaturalDateHit = {
  date: Date;
  /** Substring matched by chrono. */
  text: string;
  index: number;
};

function parseIsoDateOnly(trimmed: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  const date = new Date(`${trimmed}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Collapses internal whitespace; does not lowercase (month names are case-insensitive in compare). */
export function normalizeNaturalDateWhitespace(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function compareKey(hit: NaturalDateHit): string {
  return `${hit.index}|${hit.text}|${hit.date.getTime()}`;
}

/** All distinct parse hits from bundled chrono locales (independent of app UI language). */
export function collectNaturalDateHits(text: string, ref: Date = new Date()): NaturalDateHit[] {
  const trimmed = normalizeNaturalDateWhitespace(text);
  if (!trimmed) return [];

  const hits: NaturalDateHit[] = [];
  const seen = new Set<string>();
  for (const chrono of CHRONOS) {
    for (const r of chrono.parse(trimmed, ref)) {
      const d = r.start?.date();
      if (!d || Number.isNaN(d.getTime())) continue;
      const hit: NaturalDateHit = { date: d, text: r.text, index: r.index };
      const key = compareKey(hit);
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(hit);
    }
  }
  return hits;
}

/** True when the hit covers the entire trimmed input from the start (one expression, no trailing junk). */
export function isNaturalDateFullSpanMatch(trimmedNormalized: string, hit: NaturalDateHit): boolean {
  if (hit.index !== 0) return false;
  const a = trimmedNormalized.toLowerCase();
  const b = normalizeNaturalDateWhitespace(hit.text).toLowerCase();
  return a === b;
}

/**
 * Date to commit to storage: only when the user string is a complete ISO day or a single
 * natural-language span that exactly matches the parsed text (avoids committing "2 may" with implied year while the user still types " 2026").
 */
export function resolveNaturalDateFullMatch(text: string, ref: Date = new Date()): Date | undefined {
  const trimmed = normalizeNaturalDateWhitespace(text);
  if (!trimmed) return undefined;

  const iso = parseIsoDateOnly(trimmed);
  if (iso) return iso;

  const hits = collectNaturalDateHits(trimmed, ref);
  for (const h of hits) {
    if (isNaturalDateFullSpanMatch(trimmed, h)) return h.date;
  }
  return undefined;
}

/** Best-effort date for calendar preview: longest match starting at index 0, else ISO line. */
export function resolveNaturalDatePreview(text: string, ref: Date = new Date()): Date | undefined {
  const trimmed = normalizeNaturalDateWhitespace(text);
  if (!trimmed) return undefined;

  const iso = parseIsoDateOnly(trimmed);
  if (iso) return iso;

  const atStart = collectNaturalDateHits(trimmed, ref).filter((h) => h.index === 0);
  if (atStart.length === 0) return undefined;
  return atStart.reduce((a, b) => (b.text.length > a.text.length ? b : a)).date;
}
