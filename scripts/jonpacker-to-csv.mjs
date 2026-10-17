// Converts an MBCC beer list from mbcc.jonpacker.com into the CSV format the
// /admin page accepts for temporary venues.
//
//   pnpm venues:jonpacker [source] [output.csv]
//
// source: URL or local file (default https://mbcc.jonpacker.com/latest.json)
// output: CSV path (default mbcc.csv)
//
// The source has no Untappd styles, so each beer's style is scraped from its
// public Untappd page, throttled (see the MBCC_SCRAPE_* env vars). If the output
// CSV already exists, its styles are reused and only new beers are scraped.
import { existsSync } from "node:fs";
import { readFile, rename, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

const [sourceArg, outArg] = process.argv.slice(2);
const source = sourceArg ?? "https://mbcc.jonpacker.com/latest.json";
const outPath = outArg ?? "mbcc.csv";

const scrapeEnabled = process.env.MBCC_SCRAPE_STYLES !== "0";
const scrapeConcurrency = Number(process.env.MBCC_SCRAPE_CONCURRENCY ?? "2");
const scrapeDelayMs = Number(process.env.MBCC_SCRAPE_DELAY_MS ?? "1200");
const scrapeAttempts = Number(process.env.MBCC_SCRAPE_ATTEMPTS ?? "3");
const scrapeRetryBaseDelayMs = Number(
	process.env.MBCC_SCRAPE_RETRY_BASE_DELAY_MS ?? "1500",
);
const scrapeRateLimitCooldownMs = Number(
	process.env.MBCC_SCRAPE_RATE_LIMIT_COOLDOWN_MS ?? "60000",
);

const sessionNames = {
	yellow: "Yellow session",
	blue: "Blue session",
	red: "Red session",
	green: "Green session",
};

const columns = [
	"menu",
	"bid",
	"name",
	"brewery",
	"style",
	"abv",
	"country",
	"rating",
];

const sleep = async (ms) => {
	if (ms <= 0) {
		return;
	}

	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

const createBeerLink = (beerId) => {
	return `https://untappd.com/beer/${beerId}`;
};

const scrapeBeerData = async (beerId) => {
	const response = await fetch(createBeerLink(beerId), {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (compatible; untappd-wos-mbcc-style-scraper/1.0)",
			Accept: "text/html",
		},
	});

	if (!response.ok) {
		const error = new Error(
			`Failed to fetch Untappd page (${response.status})`,
		);
		error.status = response.status;
		throw error;
	}

	const html = await response.text();
	const $ = cheerio.load(html);

	const iosUrl = $('meta[property="al:ios:url"]').attr("content");
	const pageBeerId = iosUrl?.replace("untappd://beer/", "");
	if (pageBeerId && pageBeerId !== String(beerId)) {
		throw new Error(`ID mismatch for ${beerId}; page had ${pageBeerId}`);
	}

	const style = $(".name .style").text().trim();
	const name = $(".name h1").text().trim();
	const breweryName = $(".name .brewery a").text().trim();

	return {
		style,
		name,
		breweryName,
	};
};

const mapWithConcurrency = async (items, concurrency, mapper) => {
	const maxWorkers = Math.max(1, Number(concurrency) || 1);
	const out = new Array(items.length);
	let index = 0;

	const worker = async () => {
		while (index < items.length) {
			const current = index;
			index += 1;
			out[current] = await mapper(items[current], current);
		}
	};

	await Promise.all(Array.from({ length: maxWorkers }, () => worker()));
	return out;
};

const scrapeStylesByBid = async (bids) => {
	const uniqueBids = [...new Set(bids)].filter(
		(bid) => Number.isFinite(bid) && bid > 0,
	);
	const stylesByBid = new Map();

	if (!scrapeEnabled || uniqueBids.length === 0) {
		return stylesByBid;
	}

	const startedAt = Date.now();
	let completed = 0;
	const total = uniqueBids.length;
	let rateLimitedUntil = 0;
	let consecutive403s = 0;

	const formatDuration = (ms) => {
		if (!Number.isFinite(ms) || ms < 0) {
			return "0s";
		}

		const totalSeconds = Math.round(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${seconds}s`;
		}

		if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		}

		return `${seconds}s`;
	};

	const logProgress = () => {
		const elapsedMs = Date.now() - startedAt;
		const rate = completed > 0 ? completed / (elapsedMs / 1000) : 0;
		const remaining = Math.max(0, total - completed);
		const etaMs = rate > 0 ? (remaining / rate) * 1000 : 0;
		const percent =
			total > 0 ? ((completed / total) * 100).toFixed(1) : "100.0";

		console.log(
			`Scrape progress: ${completed}/${total} (${percent}%) | elapsed ${formatDuration(
				elapsedMs,
			)} | eta ${formatDuration(etaMs)} | ${rate.toFixed(2)} beers/s`,
		);
	};

	const getErrorStatus = (error) => {
		const fromProperty = Number(error?.status);
		if (Number.isFinite(fromProperty) && fromProperty > 0) {
			return fromProperty;
		}

		const message = String(error?.message ?? "");
		const match = message.match(/\((\d{3})\)/);
		if (!match) {
			return 0;
		}

		return Number(match[1]);
	};

	const waitForRateLimitWindow = async () => {
		const waitMs = rateLimitedUntil - Date.now();
		if (waitMs > 0) {
			console.warn(
				`Rate limit cooldown active: waiting ${formatDuration(waitMs)}`,
			);
			await sleep(waitMs);
		}
	};

	const scrapeBeerDataWithRetries = async (bid) => {
		let lastError;

		for (
			let attempt = 1;
			attempt <= Math.max(1, scrapeAttempts);
			attempt += 1
		) {
			await waitForRateLimitWindow();

			try {
				const data = await scrapeBeerData(bid);
				consecutive403s = 0;
				return data;
			} catch (error) {
				lastError = error;
				const status = getErrorStatus(error);
				const hasMoreAttempts = attempt < Math.max(1, scrapeAttempts);

				if (status === 403) {
					consecutive403s += 1;
					const multiplier = Math.min(consecutive403s, 4);
					const cooldownMs = scrapeRateLimitCooldownMs * multiplier;
					rateLimitedUntil = Math.max(
						rateLimitedUntil,
						Date.now() + cooldownMs,
					);

					console.warn(
						`Untappd returned 403 for bid ${bid} (attempt ${attempt}/${scrapeAttempts}); cooldown ${formatDuration(cooldownMs)}`,
					);
				}

				if (!hasMoreAttempts) {
					break;
				}

				const jitterMs = Math.floor(Math.random() * 500);
				const retryDelayMs = scrapeRetryBaseDelayMs * attempt + jitterMs;
				await sleep(retryDelayMs);
			}
		}

		throw lastError;
	};

	console.log(`Scraping Untappd styles for ${uniqueBids.length} MBCC beers...`);

	await mapWithConcurrency(uniqueBids, scrapeConcurrency, async (bid, idx) => {
		try {
			const scraped = await scrapeBeerDataWithRetries(bid);
			if (scraped.style) {
				stylesByBid.set(bid, scraped.style);
			}
		} catch (error) {
			console.warn(
				`Style scrape failed for bid ${bid}:`,
				error?.message ?? error,
			);
		} finally {
			completed += 1;
			if (completed % 25 === 0 || completed === total) {
				logProgress();
			}
		}

		if (idx < uniqueBids.length - 1) {
			await sleep(scrapeDelayMs);
		}
	});

	const elapsedMs = Date.now() - startedAt;
	console.log(
		`Untappd style scrape complete: ${stylesByBid.size}/${uniqueBids.length} resolved in ${elapsedMs}ms`,
	);

	return stylesByBid;
};

const readSource = async () => {
	const payload = /^https?:\/\//.test(source)
		? await fetch(source).then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to fetch ${source} (${response.status})`);
				}
				return response.json();
			})
		: JSON.parse(await readFile(source, "utf8"));

	if (!Array.isArray(payload?.beers)) {
		throw new Error("Source schema invalid: missing beers array");
	}
	return payload.beers;
};

// Minimal CSV parsing for our own output (quoted fields, "" escapes)
const parseCsvLine = (line) => {
	const cells = [];
	let cell = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (quoted && char === '"' && line[i + 1] === '"') {
			cell += '"';
			i++;
		} else if (char === '"') {
			quoted = !quoted;
		} else if (char === "," && !quoted) {
			cells.push(cell);
			cell = "";
		} else {
			cell += char;
		}
	}
	cells.push(cell);
	return cells;
};

/** Styles from a previous run of this script, so they aren't scraped again */
const readPreviousStyles = async () => {
	const styles = new Map();
	if (!existsSync(outPath)) return styles;

	const [header, ...lines] = (await readFile(outPath, "utf8"))
		.split(/\r?\n/)
		.filter(Boolean);
	const keys = parseCsvLine(header);
	const bidIndex = keys.indexOf("bid");
	const styleIndex = keys.indexOf("style");
	const scrapedIndex = keys.indexOf("style_source");

	for (const line of lines) {
		const cells = parseCsvLine(line);
		// Only reuse styles that actually came from Untappd
		if (cells[scrapedIndex] === "untappd" && cells[styleIndex]) {
			styles.set(Number(cells[bidIndex]), cells[styleIndex]);
		}
	}
	return styles;
};

const csvCell = (value) => {
	const text = value === null || value === undefined ? "" : String(value);
	return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

// Homebrew beers show their style as "Homebrew, <style>" on Untappd
const cleanStyle = (style) => style.replace(/^Homebrew,\s*/i, "").trim();

const main = async () => {
	const sourceBeers = await readSource();
	const previousStyles = await readPreviousStyles();

	const beers = sourceBeers.filter(
		(beer) => sessionNames[beer?.session] && Number(beer.ut_bid) > 0,
	);
	const skipped = sourceBeers.length - beers.length;

	const toScrape = beers
		.map((beer) => Number(beer.ut_bid))
		.filter((bid) => !previousStyles.has(bid));
	console.log(
		`${beers.length} beers, ${previousStyles.size} styles reused from ${outPath}, ${new Set(toScrape).size} to scrape`,
	);
	const scrapedStyles = await scrapeStylesByBid(toScrape);

	const seen = new Set();
	const rows = [];
	let fallbacks = 0;

	for (const beer of beers) {
		const bid = Number(beer.ut_bid);
		const menu = sessionNames[beer.session];
		// The same beer listed twice in one session is shown once anyway
		if (seen.has(`${menu}:${bid}`)) continue;
		seen.add(`${menu}:${bid}`);

		const untappdStyle = previousStyles.get(bid) ?? scrapedStyles.get(bid);
		if (!untappdStyle) fallbacks++;

		rows.push({
			menu,
			bid,
			name: beer.name,
			brewery: beer.brewery,
			// Falls back to jonpacker's own style name, shown as unknown on upload
			style: untappdStyle ? cleanStyle(untappdStyle) : beer.superstyle,
			abv: beer.percent,
			country: beer.breweryCountryCode,
			rating: beer.ut_rating,
			style_source: untappdStyle ? "untappd" : "jonpacker",
		});
	}

	const header = [...columns, "style_source"];
	const csv = [
		header.join(","),
		...rows.map((row) => header.map((key) => csvCell(row[key])).join(",")),
	].join("\n");

	await writeFile(`${outPath}.tmp`, `${csv}\n`, "utf8");
	await rename(`${outPath}.tmp`, outPath);

	console.log(
		`Wrote ${rows.length} rows to ${outPath} (${skipped} source beers without session or bid skipped)`,
	);
	if (fallbacks > 0) {
		console.warn(
			`${fallbacks} beers have no Untappd style and use jonpacker's style name; run again to retry them`,
		);
	}
};

main().catch((error) => {
	console.error("Failed to convert MBCC data", error);
	process.exitCode = 1;
});
