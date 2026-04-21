/** Filter `items` by search when `rawQuery` is non-empty; `matches` receives the raw query string. */
export function filterItemsBySearch<T>(
  items: T[],
  rawQuery: string,
  matches: (item: T, rawQuery: string) => boolean
): T[] {
  if (!rawQuery.trim()) return items;
  return items.filter((item) => matches(item, rawQuery));
}

/** Same token rule as links: whitespace-separated tokens, all must appear in haystack (case-insensitive). */
export function tokensMatchHaystack(rawQuery: string, haystack: string): boolean {
  const h = haystack.toLowerCase();
  const tokens = rawQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((t) => h.includes(t));
}
