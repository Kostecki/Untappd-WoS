import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const outPath =
  process.env.MBCC_COMPILED_PATH ??
  path.resolve(process.cwd(), "data/mbcc-2026.compiled.json");
const sourceURL =
  process.env.MBCC_SOURCE_URL ?? "https://mbcc.jonpacker.com/latest.json";
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

const sessionMeta = {
  yellow: { id: -202601, title: "Yellow" },
  blue: { id: -202602, title: "Blue" },
  red: { id: -202603, title: "Red" },
  green: { id: -202604, title: "Green" },
};
const mbccVenueId = -202600;

const baseVenue = {
  venue_slug: "mbcc-2026",
  venue_address: "Øksnehallen",
  venue_city: "København",
  venue_state: "Hovedstaden",
  venue_country: "Danmark",
  venue_icon: { sm: "", md: "", lg: "" },
  is_verified: true,
  is_closed: 0,
  primary_category: "Festival",
  location: "55.6694, 12.5621",
  has_beer: 1,
  has_food: 1,
  has_wine: 0,
  has_spirits: 0,
};

const isSession = (value) => {
  return (
    value === "yellow" ||
    value === "blue" ||
    value === "red" ||
    value === "green"
  );
};

const parseRating = (value) => {
  const rating = Number(value);
  return Number.isFinite(rating) ? rating : 0;
};

const parseNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const sleep = async (ms) => {
  if (ms <= 0) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const slugify = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const fetchSourceBeers = async () => {
  const response = await fetch(sourceURL);
  if (!response.ok) {
    throw new Error(`Failed to fetch MBCC source (${response.status})`);
  }

  const payload = await response.json();
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.beers)
  ) {
    throw new Error("MBCC source schema invalid: missing beers array");
  }

  return payload.beers;
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

const mapBeerToSectionItem = (rawBeer, generatedAt, scrapedStyles) => {
  const bid = parseNumber(rawBeer.ut_bid);
  const beerName = String(rawBeer.name || "Unknown Beer");
  const breweryName = String(rawBeer.brewery || "Unknown Brewery");
  const beerSlug = slugify(beerName) || `beer-${bid}`;
  const brewerySlug = slugify(breweryName) || `brewery-${rawBeer.id ?? bid}`;
  const scrapedStyle = scrapedStyles.get(bid);

  return {
    created_at: generatedAt,
    price: { value: "0", currency: "DKK", currency_symbol: "kr" },
    serving_type: "taster",
    beer: {
      bid,
      beer_name: beerName,
      beer_label: String(rawBeer.logo || ""),
      beer_abv: parseNumber(rawBeer.percent),
      beer_ibu: 0,
      beer_slug: beerSlug,
      beer_description: String(rawBeer.desc || ""),
      // MBCC-only enhancement: prefer scraped Untappd style by bid.
      beer_style: String(scrapedStyle || rawBeer.superstyle || "Unknown"),
      // Source does not provide Untappd style ids, use synthetic stable marker.
      beer_style_id: -1,
      is_in_production: rawBeer.disabled ? 0 : 1,
      rating_score: parseRating(rawBeer.ut_rating),
      rating_count: parseNumber(rawBeer.ut_rating_count),
    },
    brewery: {
      brewery_id: parseNumber(rawBeer.id) || bid,
      brewery_name: breweryName,
      brewery_slug: brewerySlug,
      brewery_page_url: "",
      brewery_label: String(rawBeer.breweryLogo || ""),
      country_name: String(rawBeer.breweryCountryCode || "Unknown"),
      location: {
        brewery_city: "",
        brewery_state: "",
        lat: 0,
        lng: 0,
      },
    },
  };
};

const buildCompiled = async (sourceBeers) => {
  const generatedAt = new Date().toISOString();
  const sessions = Object.keys(sessionMeta);
  const scrapeBids = sourceBeers
    .filter((rawBeer) => isSession(rawBeer?.session))
    .map((rawBeer) => parseNumber(rawBeer.ut_bid))
    .filter((bid) => bid > 0);
  const scrapedStyles = await scrapeStylesByBid(scrapeBids);

  const groupedBeers = {
    yellow: [],
    blue: [],
    red: [],
    green: [],
  };
  const seenInSession = {
    yellow: new Set(),
    blue: new Set(),
    red: new Set(),
    green: new Set(),
  };

  let unresolvedBeers = 0;

  for (const rawBeer of sourceBeers) {
    if (!isSession(rawBeer?.session)) {
      unresolvedBeers += 1;
      continue;
    }

    const session = rawBeer.session;
    const bid = parseNumber(rawBeer.ut_bid);
    if (!bid) {
      unresolvedBeers += 1;
      continue;
    }

    if (seenInSession[session].has(bid)) {
      continue;
    }

    seenInSession[session].add(bid);
    groupedBeers[session].push(
      mapBeerToSectionItem(rawBeer, generatedAt, scrapedStyles),
    );
  }

  const venues = [
    {
      venue_id: mbccVenueId,
      venue_name: "MBCC 2026",
      mbcc_event: true,
      url: "https://mbcc.jonpacker.com",
      ...baseVenue,
    },
  ];

  const menus = sessions.reduce((acc, session) => {
    const { id, title } = sessionMeta[session];
    const items = groupedBeers[session] ?? [];
    acc[session] = [
      {
        menu_id: id,
        menu_name: title,
        menu_description: `Beer list for the ${title} Session at MBCC 2026`,
        created_at: generatedAt,
        updated_at: generatedAt,
        total_item_count: items.length,
        sections: {
          count: 1,
          items: [
            {
              section_id: id,
              section_name: "All beers",
              section_description: "",
              count: items.length,
              items,
            },
          ],
        },
        mbcc_event: true,
        mbcc_session: session,
      },
    ];
    return acc;
  }, {});

  const resolvedBeers =
    groupedBeers.yellow.length +
    groupedBeers.blue.length +
    groupedBeers.red.length +
    groupedBeers.green.length;

  return {
    event_id: "mbcc-2026",
    generated_at: generatedAt,
    venues,
    menus,
    diagnostics: {
      source_version: sourceURL,
      resolved_beers: resolvedBeers,
      unresolved_beers: unresolvedBeers,
    },
  };
};

const main = async () => {
  const sourceBeers = await fetchSourceBeers();
  const compiled = await buildCompiled(sourceBeers);
  const outDir = path.dirname(outPath);
  await mkdir(outDir, { recursive: true });

  const tempPath = `${outPath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(compiled, null, 2)}\n`, "utf8");
  await rename(tempPath, outPath);

  console.log(`MBCC compiled data written: ${outPath}`);
};

main().catch((error) => {
  console.error("Failed to precompile MBCC data", error);
  process.exitCode = 1;
});
