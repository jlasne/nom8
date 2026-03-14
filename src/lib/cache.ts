/**
 * Hybrid cache: in-memory (per serverless instance) + CDN headers (Vercel edge).
 *
 * In-memory cache handles warm function instances — multiple requests
 * hitting the same instance share cached data. CDN cache headers
 * (set on API routes) handle the edge layer so Vercel doesn't even
 * invoke the function for repeated identical requests.
 *
 * Together: in-memory avoids redundant DB calls within an instance,
 * and CDN headers avoid invoking the function at all.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Get a value from cache, or fetch it if expired/missing.
 * @param key       unique cache key
 * @param _tags     cache tags (reserved for future use)
 * @param ttlSec    time-to-live in seconds
 * @param fetcher   async function that produces fresh data
 */
export async function cached<T>(
  key: string,
  _tags: string[],
  ttlSec: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }

  // Deduplicate concurrent requests for the same key
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetcher().then((data) => {
    store.set(key, { data, expiresAt: Date.now() + ttlSec * 1000 });
    inflight.delete(key);
    return data;
  }).catch((err) => {
    inflight.delete(key);
    throw err;
  });

  inflight.set(key, promise);
  return promise;
}

/**
 * Invalidate all cache entries with a given tag.
 * Clears all entries whose key starts with the tag prefix.
 */
export function invalidateTag(tag: string) {
  for (const key of store.keys()) {
    if (key.startsWith(tag)) store.delete(key);
  }
}
