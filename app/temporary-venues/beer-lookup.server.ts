import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { getBeerSummary } from "~/untappd/api.server";
import { isInvalidToken } from "~/untappd/client.server";

type BeerSummary = Awaited<ReturnType<typeof getBeerSummary>>;

// Looked-up beers are kept on disk so re-uploads don't fetch them again
const cacheFile = path.join(
	path.resolve(process.env.DATA_DIR ?? "data"),
	"beer-cache.json",
);
const cacheTtlMs = 30 * 24 * 60 * 60 * 1000;
const concurrency = 3;

/** Most beers one upload may look up, to keep bursts on the account sane */
const maxLookups = 250;

type CacheEntry = BeerSummary & { fetchedAt: number };

const readCache = async (): Promise<Record<string, CacheEntry>> => {
	try {
		return JSON.parse(await readFile(cacheFile, "utf8"));
	} catch {
		return {};
	}
};

const writeCache = async (cache: Record<string, CacheEntry>) => {
	await mkdir(path.dirname(cacheFile), { recursive: true });
	await writeFile(`${cacheFile}.tmp`, JSON.stringify(cache));
	await rename(`${cacheFile}.tmp`, cacheFile);
};

/**
 * Untappd details for each bid; null for bids Untappd doesn't know.
 * Throws when more than `maxLookups` beers would have to be fetched.
 */
const lookupBeers = async (
	bids: number[],
	accessToken: string,
): Promise<Map<number, BeerSummary | null>> => {
	const cache = await readCache();
	const now = Date.now();
	const results = new Map<number, BeerSummary | null>();

	const toFetch = [...new Set(bids)].filter((bid) => {
		const hit = cache[bid];
		if (hit && now - hit.fetchedAt < cacheTtlMs) {
			results.set(bid, hit);
			return false;
		}
		return true;
	});

	if (toFetch.length > maxLookups) {
		throw new TooManyLookupsError(toFetch.length);
	}

	let next = 0;
	const worker = async () => {
		while (next < toFetch.length) {
			const bid = toFetch[next++];
			try {
				const beer = await getBeerSummary(accessToken, bid);
				results.set(bid, beer);
				cache[bid] = { ...beer, fetchedAt: Date.now() };
			} catch (error) {
				if (isInvalidToken(error)) throw error;
				// Untappd answers unknown bids with 500 invalid_param
				results.set(bid, null);
			}
		}
	};
	await Promise.all(Array.from({ length: concurrency }, worker));

	if (toFetch.length > 0) await writeCache(cache);
	return results;
};

class TooManyLookupsError extends Error {
	constructor(readonly count: number) {
		super(`${count} beers need looking up; the limit is ${maxLookups}`);
	}
}

export type { BeerSummary };
export { lookupBeers, maxLookups, TooManyLookupsError };
