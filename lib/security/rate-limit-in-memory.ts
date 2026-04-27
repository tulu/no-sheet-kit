type Bucket = { count: number; windowStart: number };

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX = 30;

const store = new Map<string, Bucket & { windowMs: number; max: number }>();

function prune(now: number): void {
  if (store.size < 5000) return;
  for (const [k, v] of store) {
    if (now - v.windowStart >= v.windowMs) store.delete(k);
  }
}

/** Returns false if rate limited. */
export function checkInMemoryRateLimit(
  key: string,
  opts?: { windowMs?: number; max?: number },
  now: number = Date.now()
): boolean {
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const max = opts?.max ?? DEFAULT_MAX;
  prune(now);
  const existing = store.get(key);
  if (!existing || now - existing.windowStart >= existing.windowMs) {
    store.set(key, { count: 1, windowStart: now, windowMs, max });
    return true;
  }
  const maxAllowed = existing.max;
  existing.count += 1;
  if (existing.count > maxAllowed) {
    return false;
  }
  store.set(key, existing);
  return true;
}
