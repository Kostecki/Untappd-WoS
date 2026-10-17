// Small in-memory cache for Untappd calls; the app runs as a single process
const maxEntries = 1000;

const entries = new Map<string, { expires: number; value: Promise<unknown> }>();

const sweep = (now: number) => {
	for (const [key, entry] of entries) {
		if (entry.expires <= now) entries.delete(key);
	}
	// Still too many: drop the oldest (Map keeps insertion order)
	for (const key of entries.keys()) {
		if (entries.size <= maxEntries) break;
		entries.delete(key);
	}
};

/**
 * Returns the cached result of `load` for `key`, or calls it. The promise is
 * cached, so concurrent callers share one request; failures are not cached.
 */
const cached = <T>(
	key: string,
	ttlMs: number,
	load: () => Promise<T>,
): Promise<T> => {
	const now = Date.now();
	const hit = entries.get(key);
	if (hit && hit.expires > now) {
		return hit.value as Promise<T>;
	}

	const value = load();
	entries.set(key, { expires: now + ttlMs, value });
	value.catch(() => {
		if (entries.get(key)?.value === value) entries.delete(key);
	});

	if (entries.size > maxEntries) sweep(now);

	return value;
};

export { cached };
