# Wheel of Styles
##### Keep track of your progress towards completing the Wheel of Styles badge

- View your level progress
- Check specific beers
- Check the menu of venues
- See remaning styles and related beers

![screenshot](https://github.com/user-attachments/assets/12dc7f95-c9b4-495d-9094-bdcf37d68698)

## Temporary venues

Festivals and other venues that aren't on Untappd can be uploaded on `/admin`
(only for the user in `ADMIN_USER_ID`). While active and until their last day,
they're suggested as soon as the venue search is focused and listed at the top
of every search, matching ones first.

Uploads are an Excel file or a CSV with one beer per row and a header row.
Required columns: `bid` (Untappd beer id), `name`, `brewery`, `style` (the
Untappd style name). Optional: `menu` (groups beers into menus), `abv`,
`country`, `rating`. The admin page has a template (`/admin/template.xlsx`)
with a dropdown of all Untappd styles.

Venues are stored as JSON files in `DATA_DIR` (`/app/data` in the Docker image,
`./data` otherwise). Mount a volume there so they survive redeploys. A named
volume (`wos-data:/app/data`) gets the right owner automatically; a bind mount
must be writable by the container user (uid 1001).

### MBCC

`pnpm venues:jonpacker [source] [output.csv]` converts the beer list from
[mbcc.jonpacker.com](https://mbcc.jonpacker.com) (default
`https://mbcc.jonpacker.com/latest.json`) into an upload file. The source has no
Untappd styles, so they're scraped from each beer's public Untappd page,
throttled via `MBCC_SCRAPE_CONCURRENCY` (default `2`), `MBCC_SCRAPE_DELAY_MS`
(default `1200`) and related `MBCC_SCRAPE_*` env vars. Re-running reuses the
styles already in the output file and only scrapes new beers.
