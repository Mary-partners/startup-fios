// ============================================================
// Lightweight in-memory cache for serverless API routes.
// TTL-based, per-tenant keying, auto-evicts stale entries.
// Keeps Neon queries low under traffic spikes.
// ============================================================

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 30 * 1000; // 30 seconds
const MAX_ENTRIES = 500;

/**
 * Get a cached value or compute it.
 * Key should include tenantId to ensure data isolation.
 *
 * Usage:
 *   const metrics = await cached(`dashboard:${companyId}`, 60_000, () => fetchMetrics(companyId));
 */
export async function cached<T>(
  key: string,
  ttlMs: number | undefined,
  compute: () => Promise<T>
): Promise<T> {
  const ttl = ttlMs ?? DEFAULT_TTL_MS;
  const now = Date.now();

  const existing = store.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.data;
  }

  const data = await compute();

  // Evict oldest entries if we hit the cap
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }

  store.set(key, { data, expiresAt: now + ttl });
  return data;
}

/** Invalidate a specific cache key (call after mutations). */
export function invalidate(key: string): void {
  store.delete(key);
}

/** Invalidate all keys matching a prefix (e.g., all entries for a tenant). */
export function invalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
