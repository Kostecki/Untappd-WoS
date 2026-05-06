# Wheel of Styles
##### Keep track of your progress towards completing the Wheel of Styles badge

- View your level progress
- Check specific beers
- Check the menu of venues
- See remaning styles and related beers

![screenshot](https://github.com/user-attachments/assets/12dc7f95-c9b4-495d-9094-bdcf37d68698)

## MBCC precompile

The MBCC data file is generated into `data/mbcc-2026.compiled.json` using:

```bash
pnpm mbcc:precompile
```

For MBCC, style is enriched by scraping the public Untappd beer page by `bid`.
The scraper is intentionally throttled and can be tuned with env vars:

- `MBCC_SCRAPE_STYLES` (`1` by default, set to `0` to disable scraping)
- `MBCC_SCRAPE_CONCURRENCY` (`2` by default)
- `MBCC_SCRAPE_DELAY_MS` (`400` by default)
- `MBCC_SOURCE_URL` (defaults to `https://mbcc.jonpacker.com/latest.json`)
- `MBCC_COMPILED_PATH` (defaults to `data/mbcc-2026.compiled.json`)

## Schedule with cron

Use the cron-safe wrapper script:

```bash
pnpm mbcc:precompile:cron
```

Or run directly:

```bash
./scripts/mbcc-precompile-cron.sh
```

The wrapper:

- prevents overlapping runs with a lock directory
- writes logs to `data/logs/`
- exits cleanly if a previous run is still active

Example crontab (every hour at minute 5):

```cron
5 * * * * cd /Users/jacob/Dev/personal/untappd-wos && /bin/bash ./scripts/mbcc-precompile-cron.sh
```
