# Untappd mobile API reference (from Android app 5.0.0)

Reverse-engineered statically from `untappd_5.0.0.xapk` → `com.untappdllc.app.apk` →
`assets/index.android.bundle` (Hermes bytecode v96, decompiled with `hermes-dec`).
No requests were made to the API. The app is React Native / Expo (SDK 55); the
JS still reports itself as `utv=4.0.0`.

Confidence notes:

- **Paths, methods, param names, request body keys, response accessor**
  (`.then(r => r.response.X)`): read directly from decompiled code.
- **Response shapes**: only where the bundle ships a fixture or where the UI
  maps fields explicitly. Everything else is "returns `response.X`" with no
  further shape guarantee.
- Endpoints the current web app uses that are **not referenced** by 5.0.0:
  `GET /search/venue` and `GET /inventory/view/{venue_id}`. They may still
  work (legacy), but the official app no longer calls them — see
  [Search](#search-algolia) and [Menus](#menus-new-api) for the replacements.

---

## Clients

All defined in one module (`userClient`, `v5Client`, `appClient`,
`nextClient`, `oznrClient`, `customClient`).

| Client | Base | Notes |
|---|---|---|
| `userClient` | `${API_URL}/v4` (`https://api.untappd.com/v4`) | Almost everything. |
| `v5Client` | `${API_URL}/v5` | Feed, notifications, blog, drink stats, favourites, badge statuses. |
| `appClient` | `/v4`, no user token | `/ping`, country list. |
| `nextClient` | `NEXT_API_URL` (`https://next.untappd.com`) | Shop (`/api/shop/*`, `/api/v2/shop/*`). |
| `oznrClient` | separate service | `/location/nearby` (gated by `oznr_enabled`). |

Dev hosts use `.beer` (`https://untappd.beer`, `https://next.untappd.beer`);
the app checks `includes('.beer')` to detect dev.

### Request decoration (`userClient`)

Query string (via `qs`, `addQueryPrefix`), merged into every request:

```
client_id=<UNTAPPD_CLIENT_ID_ANDROID>
client_secret=<UNTAPPD_CLIENT_SECRET_ANDROID>
utv=4.0.0
...params
```

Headers:

```
Authorization: Bearer <accessToken>
Accept: application/json; charset=utf-8
Accept-Encoding: gzip, deflate
Accept-Language: <i18n language>
X-Untappd-App: android
X-Untappd-App-Version: <app version>
X-React-Native: 1
Content-Type: application/x-www-form-urlencoded   (default for body)
Content-Type: application/json                     (when contentType: 'json')
```

`CF-Access-Client-Id` / `CF-Access-Client-Secret` are added only for dev
environments. Default method is `get`. Bodies are `qs.stringify`'d unless
`contentType: 'json'`. A `stripBase` option drops the `/v4` prefix (used by
`/flairs`, `/user/flair`).

Error handling: `MAINTENANCE_MODE` error → maintenance overlay. Every response
may carry `notifications.unread_count`, which the client pushes into the
notification badge.

> Note: the web app currently sends `access_token=` as a query param. The
> mobile app uses `Authorization: Bearer` instead.

### Paginated lists

Several list calls are described as `{url, key, nextUrl, params}` and handled
by a shared `generateListRoute` helper: response is
`response[key] = { count, items, pagination: { next_url, ... } }`. The next
page is fetched by calling `pagination.next_url` directly.

---

## Auth / app bootstrap

| Method | Path | Request | Returns |
|---|---|---|---|
| POST | `/xauth` | body: `user_name, user_password, device_udid, device_name, device_version, device_platform, app_version, multi_account` | `response` (access token) |
| POST | `/xauth/validate_username` | body | `response` |
| GET | `/helpers/appInit` | — (raced against a timeout) | `response.features`, `response.settings.user`, `response.keys.algolia { app_id, beer_secured_search_key }`, `is_anonymous`, `is_supporter` |
| POST | `/helpers/register` / `/helpers/removedevice` / `/account/updatepush` | push device registration | |
| POST | `/helpers/store_user_app_version`, `/helpers/upsert_device_lang` | | |
| GET | `/ping` (appClient) | | |

---

## Beer

| Method | Path | Params / body | Returns |
|---|---|---|---|
| GET | `/beer/info/{bid}` | `compact=enhanced, featuredPhotos=true, include_checkins=false, lat, lng, dist_pref, radius` | `response.beer` |
| GET | `/beer/vintage_family/{bid}` | | `response.vintage_family` |
| GET | `/beer/checkins/{bid}` (list, key `checkins`) | `type`, `has_comment`, `limit` | `response.checkins` |
| GET | `/beer/find/{bid}` | `buy_it_now, lat, lng, dis_pref, mode=enhanced, radius` | `verifiedVenues`, `unverifiedVenues` |
| GET | `/beer/flavor_profile/{bid}` | | `response.items` |
| GET | `/beer/ratings/{bid}` | `breakdown` | `response` |
| GET | `/beer/userrating/{bid}` | | `response.rating_score` |
| GET | `/beer/variants/{bid}` | `limit, max_id` | `response` |
| GET | `/beer/styleGuide/{style}` | `show_source` | `response` |
| GET | `/beer/trending` | `lat, lng, radius, bounds, dis_pref, type_id, in_production, styles, sort, type (local/global), range, countries, country_id, region_id` | `response` |
| GET | `/beer/recommend` | `limit, lat, lng, offset, radius, dist_pref` | `response.beers.items` |
| GET | `/beer/recently_purchased` | | `response` |
| GET | `/beer/top_rated` | | |
| GET | `/beer/checkbarcodemultiple` | `upc` | `response` (`verified`, `unverified`, `count`) |
| POST | `/beer/proposenewbarcode` | body | |
| POST | `/beer/add` | body | |
| POST | `/beer/subscribe/{bid}` | | `response.subscribe` |
| GET | `/beer/subscribes` | `offset, q, brewery_id, type_id, country_id, sort, styles, breweries, countries` | `response` |
| POST | `/beer/subscribewish` | | |
| GET | `/helpers/list_beer_types` | | `response.items` (`type_id, type_name, parent_id`) |
| GET | `/helpers/top_rated_filters` | `country_id, type` | `response` |
| GET | `/helpers/qr_item_view/checkin` | `bid, vid` | `response.beer`, `response.venue` |

## Brewery

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/brewery/info/{id}` | `collaborations, featuredPhotos=true, include_checkins=false, lat, lng, radius, dist_pref` | `response.brewery` |
| GET | `/brewery/beer_list/{id}` | `offset, q, type_id, sort, hasNotHadBefore, showAllBeers, untappd_community_awards, styles` | `response` |
| GET | `/brewery/collaborations/{id}` | `offset, q, sort, type_id, country_id, brewery_id, hasNotHadBefore, showAllBeers, styles, countries, breweries` | `response` |
| GET | `/brewery/checkins/{id}` (list) | | `response.checkins` |
| GET | `/brewery/find/{id}` | `dis_pref, lat, lng, radius, limit` | `response.items` |
| GET | `/brewery/top_rated` | `country_id, region_id, brewery_type` | `response.breweries.items`, `response.countries.items` |
| GET | `/brewery/top_rated_local` | `dis_pref, limit, brewery_type, radius, sort, lat, lng` | `response.breweries.items` |
| GET | `/brewery/{id}/recommendations` | `limit` | `response` |
| GET | `/helpers/list_brewery_types` | | `response.items` |
| POST | `/brewery/add` | body | |
| POST/DELETE | `/v5/breweries/{id}/favorite` (v5Client) | | |

## Venue

| Method | Path | Params / body | Returns |
|---|---|---|---|
| GET | `/venue/info/{vid}` | `multipleHours=1, track=false, compact=venue_menu_compact, timezone` | `response.venue` |
| GET | `/venue/checkins/{vid}` (list) | | `response.checkins` |
| GET | `/venue/around` / `/venue/aroundretail` | `lat, lng, limit, q, dist_pref, recent, include_foursquare_id` | `response` (`venues`, `recentVenues`, `foursquare`, `request_id`) |
| GET | `/venue/map` | `lat, lng, dist_pref=m, limit=60, mode=v3, categories=true, sub_category_id, menu_offering_filters, radius, bounds` | `response` |
| GET | `/venue/breweries` | `lat, lng, dist_pref=m, categories=true, limit=60, mode=v3, brewery_type_id, radius, bounds` | `response` |
| GET | `/venue/trending` | `lat, lng, radius, dis_pref, range` | `response` |
| GET | `/venue/suggested_beers/{vid}` | | `response` |
| GET | `/venue/recently_added_beers/{vid}` | | `response` |
| GET | `/venue/currentevents/{vid}` | | `response` |
| GET | `/venue/{vid}/recommendations` | `limit` | `response` |
| POST | `/venue/subscribe/{vid}` | body: `notification_type, source` | |
| GET | `/venue/subscribes` | `q, offset, categories, sort, sub_category_id` | |
| POST | `/venue/recent_photos` | | |
| POST | `/helpers/suggest_verified_venue/{vid}` | `lat, lng` | |
| GET | `/location/coords` | `q` | `response` (location search) |

### Menus (new API)

The 5.0.0 app no longer uses `/inventory/view/{vid}`. Venue menus go through:

| Method | Path | Params / body | Returns |
|---|---|---|---|
| GET | `/menus/menus_count` | `venue_id` | `response` |
| GET | `/menus/filters?venue_id={vid}` | | `response.filters { breweries, styles, types, serving_types, countries }` — each an object map of id → `{ *_name, total_count }` |
| POST | `/menus/sections` | **JSON** body, see below | `response.sections` |
| GET | `/inventory/viewspecialmenu/{id}` | | `{ venue, updated_at, total_count, menu_name, section_name, items }` |
| POST | `/helpers/track_menu` | | |

`/menus/sections` body (`flatten_when_filtering` is always sent).

> **Verified against the live API (2026-10-16):** the body must be sent
> **form-encoded**; a JSON body returns HTTP 200 with
> `response.response_code: 403`. Sections are paged at 10 items by default;
> `limit=100` returns whole sections. `types[]=Items::Beer` drops spirits/wine.
> Each item carries per-user `has_had` and `on_list`. `name`/`style` are the
> venue's display values (e.g. `"1. Darkness (Nitro)"`); use
> `original_name`/`original_style` for Untappd values. `/inventory/view` and
> `/search/venue` still work, and `Authorization: Bearer` is accepted.


```ts
{
  venue_id: number;
  flatten_when_filtering: true;
  // optional filters
  q?: string;
  menu_id?: number;
  brewery?: number[];
  styles?: number[];
  types?: number[];
  serving_styles?: number[];
  countries?: number[];
  beverage_tags?: number[];
  beverage_subtags?: number[];
  has_not_had_before?: boolean;
  untappd_community_awards?: boolean;
  recommended_for_user?: boolean;
  sort?: string;
  limit?: number;
  // pagination of one section ("show more")
  section_id?: number;
  page?: number;
}
```

Response, as consumed by `useSections`:

```ts
{
  sections: {
    filtered: boolean;
    sections: Array<{
      section_id: number;
      menu_id: number;
      section_name: string;
      section_description: string;
      total_count: number;
      next_page: number | null;
      items: MenuItem[];
    }>;
    next_page?: number | null;
  };
  tier: unknown;
  item_counts: unknown;
}
```

### Events

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/inventory/event/{id}` | | `response.event` |
| GET | `/inventory/events/…`, `/inventory/nearby_events` | `lat, lng, dis_pref, radius, limit, timezone, sort, offset, show_recents` | `response` |
| POST | `/inventory/event/attend/{id}` | body: `attend_type` | |
| GET | `/inventory/event/attending/` | `filter, attend_type` | |
| GET | `/inventory/event/checkins/{id}` (list) | | |
| GET | `/user/events/{…}` | `timezone, limit, offset, type` (e.g. `past`) | |

## Check-ins

| Method | Path | Params / body | Returns |
|---|---|---|---|
| POST | `/checkin/add` | see below | `response` (see fixture type) |
| POST | `/checkin/edit/{id}` | body: `rating, gmt_offset, …` | |
| POST | `/checkin/delete/{id}` | | |
| GET | `/checkin/view/{id}` | `cacheBust` | `response.checkin` |
| GET | `/checkin/recent` (list) | `limit` | `response.checkins` (friends feed, v4) |
| GET | `/thepub/local` (list) | `lat, lng, limit` | `response.checkins` |
| GET | `/user/checkins/{user}` (list) | `limit` | `response.checkins` |
| POST | `/checkin/toast/{id}` | | |
| GET | `/checkin/viewtoasts/{id}` | `offset` | `response.toasts` |
| POST | `/checkin/addcomment/{id}` | body: `comment, users_id` | `response.comments` |
| POST | `/checkin/editcomment/{id}`, `/checkin/deletecomment/{id}` | | |
| GET | `/checkin/translate/{id}` | | |
| GET | `/checkin/serving_types` | | `response.items` |
| GET | `/v5/checkin/serving_types/{bid}` (v5Client) | | serving types for a beer |
| POST | `/checkin/flavor_profiles` | | |
| GET | `/checkin/validatelocation/` | | |
| GET | `/checkin/instagram_share/{id}` | | image |
| POST | `/checkin/removecheckinfriendtag/{id}` | | |
| GET | `/photo/signedUrl/{ext}` → `POST /photo/uploadComplete` | presigned photo upload | |
| POST | `/photo/delete/{id}` | | |
| GET | `/v5/feed` (v5Client) | `cursor, limit, types` | `{ items, count, nextCursor, sourceErrors }` |

`/checkin/add` body (form-encoded). The client always merges
`{ rating, platform: 'android', gmt_offset, promo_v2: true, dyk_enabled: true, app_theme }`
into the caller payload, which is built from:

```
bid, rating, shout, timezone, geolat, geolng,
foursquare_id, purchase_foursquare_id,
flavor_profiles, checkin_tags, users_id (tagged friends),
container_id, vintage_year, is_reco, created_at, event_id
```

## User

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/user/info/{username}` | `compact=enhanced, badges=true, badgeLimit=5, rating_breakdown=light` | `response.user` |
| GET | `/user/info_by_id/{uid}?compact=true` | | `response.user` |
| GET | `/user/beers/{username}` | `offset, q, sort, rating_score, brewery_id, type_id, container_id, country_id, region_id, start_date, end_date, timezoneOffset` | `response` (distinct beers) |
| GET | `/user/beers_filter/{username}` | `country_id, timezoneOffset` | `{ breweries, containers, countries, ratings, regions, styles, beverageTags }` |
| GET | `/user/user_beer_list` | `mode=v3` | ids of beers the user has had |
| GET | `/user/stats` | `start_date, end_date, v2, gmt_offset` | `response.stats` |
| GET | `/v5/users/{uid}/drink_stats` (v5Client) | | |
| GET | `/user/ratings_histogram` | `users_id` | `response.items` |
| GET | `/user/map` | `start_date, end_date (yyyy-MM-dd), gmt_offset` | `response.checkins` |
| GET | `/user/venues/{username}` | `offset, limit, sub_category_id, sort, q, verifiedVenueOnly, categories` | |
| GET | `/user/friends/{username}`, `/user/friends` | `limit, offset` | |
| GET | `/user/friends?friendTaggingLimit=&intent=` | | |
| GET | `/user/friends_in_common/{username}` | `offset` | |
| GET | `/user/recently_tagged` | `friendTaggingLimit` | `response.items` |
| GET | `/user/relationship/{uid}` | `limit` | `response.relationship` |
| GET | `/user/nearby` | `lat, lng, radius, limit` | `response.items` |
| GET | `/user/pending` | | |
| GET | `/user/prefs` / POST `/user/prefs` | | `response.items` |
| GET | `/user/blockusers`, `/user/muteusers` | | `response.items` |
| POST | `/user/mute/{uid}` | body: `period_of_time, mute_forever` | |
| POST | `/user/unmute/{uid}` | | |
| POST | `/user/subscribe/{uid}` | body: `notification_type` | |
| GET | `/user/subscribes` | `offset, type, limit` | |
| GET | `/user/name_tag` | | |
| GET/PUT | `/user/flair`, GET `/flairs` (no `/v4`) | body: `flair_id` | `response.flair(s)` |
| POST | `/user/update_favorite_beers` | | |
| POST | `/user/wishlist/clear_list` | | |
| GET | `/v5/users/{uid}/links`, PUT `/v5/me/links` (JSON) | | |
| PUT | `/v5/me/personalization` | | |
| POST | `/friend/request/{uid}`, `/friend/accept/{uid}`, `/friend/reject/{uid}`, `/friend/remove/{uid}`, `/friend/removerequest/{uid}` | | `response.target_user` (request) |

### Account

`/account/*` (mostly POST, form body): `add`, `addsigninwithapple`,
`addsigninwithgoogle`, `appleidstatus`, `googleidstatus`, `block`,
`changepassword`, `checksigninwithapple`, `checksigninwithgoogle`, `delete`,
`delete_recently_added`, `deletecover`, `devices` (GET, `response.items`),
`devices/{id}` (POST remove), `emailavailable`, `recently_added` (GET/POST),
`removesigninwithapple`, `removesigninwithgoogle`, `removesocial`,
`retroactive_badges`, `supporter` (GET), `toggle_rating_bump`,
`update_parent_style_opt_outs`, `user_parent_style_opt_outs` (GET, `mode=v2`),
`updateavatar`, `updatecountry`, `updatecover`, `updateemailpromptdate`,
`updateprofile`, `updatepush`, `updatesettings`, `updateusername`,
`usersettings` (GET, `response.user`), `validatebirthday`.

## Badges

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/user/badges/{username}` | index: `method=index, limit=3, mode=v2`; list: `method, segment (full/beer/venue/special/…), sort, offset, limit, mode=v2` | `response` (`retro_status`, `stats`, `beer`, `venue`, `special`, `local_badges` for index) |
| GET | `/badges/view/{user_badge_id}` | `authUser=true, limit=25` | `response.badge` |
| GET | `/badges/status/{badge_id}` | `authUser=true, limit=25` | `response.badge` |
| GET | `/v5/badges/status` (v5Client) | `badge_ids` | statuses for several badges |
| GET | `/badges/item_list/{id}` | `offset, limit, item_type, type` | |
| GET | `/badges/qualifying_items/{id}` | `offset, limit` | `{ count, items }` (beer or venue variant) |
| GET | `/badges/friends_badges/{id}` | `sort, q, offset, limit` | |
| GET | `/badges/styles_not_had` | `user_id` | Wheel of Styles: `{ actual_count, current, percentage, required, status }` defaults |
| GET | `/search/badges/` | `limit, q, sort=all` | |

## Lists

| Method | Path | Params / body | Returns |
|---|---|---|---|
| GET | `/custom_lists/userlists/{username}` | `offset, limit, vid, brewery_id, bid` (pass an item id to get "is in list" state) | `response` |
| GET | `/custom_lists/view/{list_id}` | `offset, q, brewery_id, type_id, country_id, sort, filter_type, hasNotHadBefore, styles, breweries, countries, brewery_countries, filters, mode=v2, shop_catalog` | `response` |
| GET | `/custom_lists/viewitemenhanced/{id}` | | |
| GET | `/custom_lists/nearby/{list_id}` | `lat, lng, radius, dist_pref, sort` | which nearby venues carry list items |
| POST | `/custom_lists/add` | body | |
| POST | `/custom_lists/edit/{id}`, `/custom_lists/delete/{id}`, `/custom_lists/duplicatelist/{id}` | | |
| POST | `/custom_lists/additemenhanced/{list_id}` | body: `item_id, item_type (beer/brewery/venue)` | |
| POST | `/custom_lists/removeitemenhanced/{list_id}` | body: `item_id, item_type` | |
| POST | `/custom_lists/moveitem/{id}` | body: `list_id` | |
| POST | `/custom_lists/upsertitem/{id}`, `/custom_lists/updatequantity` | body | |
| POST | `/custom_lists/addphoto/…`, `/custom_lists/deletephoto/{id}` | | |

Activity groups: `/activitylist` (list, key `lists`), `/activitylist/create`,
`/activitylist/edit/{id}` (`list_name, add_users, remove_users`),
`/activitylist/delete/{id}`, `/activitylist/members/{id}`,
`/activitylist/addfriend/{id}` (`users_id`), `/activitylist/view/{id}`.

## Discover / misc

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/helpers/discover_page` | `limit, dist_pref, radius, gmt_offset, lat, lng` | `{ top_banner, discover_items }` |
| POST | `/helpers/hideTile` | | |
| GET | `/notifications` | | `response.news` / `response.notifications` |
| GET | `/v5/notifications` (v5Client) | `cursor, limit, type` | `{ items, count, nextCursor, unread }` |
| POST | `/notifications/clear` | | |
| GET | `/notifications/subscriptions` | | `response.items` |
| GET | `/promotions/view/{id}` | | |
| GET/POST | `/v5/blog/{id}`, `/v5/blog/{id}/toast` | | |
| GET | `/helpers/list_user_countries` (appClient) | | `response.items` |
| GET | `/helpers/ip` | | |
| GET | `/helpers/create_drink_data` | | |
| POST | `/helpers/shorten`, `/helpers/short_to_long`, `/helpers/track_short_link` | | |
| POST | `/helpers/check_user_name` | body: `user_name` | |
| GET | `/location/nearby` (oznrClient) | `state` | |

Shop (`nextClient`, `/api/shop/*` and `/api/v2/shop/*`): init, catalogs,
catalog items, carts, cart items, coupon codes, addresses, payments (Stripe),
orders, recommendations, summaries. Not relevant to this app; skipped.

---

## Search (Algolia)

Typed search no longer goes through `/search/beer` for the main search UI;
`/search/beer` is only used for exact-name dupe checks (`q, brewery_id,
search_type=exact`) when adding a beer.

- `GET /helpers/appInit` → `response.keys.algolia.{ app_id, beer_secured_search_key }`.
- Beer search uses that per-user **secured** key (`setBeerSearchSecuredKey`).
- User / brewery / venue search use a static `ALGOLIA_APP_ID` +
  `ALGOLIA_SEARCH_KEY` from the app config, with indices `user`, `brewery`,
  `venue`, and headers `Referer: https://android.untappd.com`,
  `X-Untappd-App-Version`.
- The beer index name was not recovered from the bundle.

---

## Types from shipped fixtures

The bundle ships a full mock `/checkin/add` response (used for dev
"fake badges/promos") and a shop item fixture. These are real field names:

```ts
interface CheckinAddResponse {
  result: "success";
  badge_valid: boolean;
  checkin_id: number;
  created_at: string;           // RFC 2822, e.g. "Thu, 09 Apr 2020 14:34:36 +0000"
  checkin_comment: string;
  rating_score: number;
  stats: { beer: string; beer_month: string }; // ordinal strings, "3rd"
  user: CheckinUser;
  beer: CheckinBeer;
  brewery: CheckinBrewery;
  venue: Venue | [];             // [] when none
  retail_venue: RetailVenue;
  recommendations: unknown[];
  distance: number;
  media: { is_photo: boolean; photo_data: unknown; photo_key: string };
  media_allowed: boolean;
  is_custom_time: number;
  source: { app_name: string; app_website: string };
  follow_status: { is_follow: boolean; status: boolean; hash: string; uid: number };
  flavor_profile: { posted: unknown[]; data: unknown[] };
  checkin_tags: { posted: unknown[]; data: unknown[] };
  checkin_mentions: unknown[];
  list_remove_options: Count<{
    list_id: number; list_item_id: number; list_name: string;
    item_type: "beer"; quantity_to_remove: number; quantity: number;
  }>;
  promotions: Count<Promotion>;
  badges: Count<EarnedBadge>;
}

interface Count<T> { count: number; items: T[] }

interface CheckinUser {
  uid: number; user_name: string; first_name: string; last_name: string;
  location: string; url: string; bio: string; user_avatar: string;
  account_type: "user"; is_private: 0 | 1;
  contact: { twitter?: string; foursquare?: string };
  email_prefs: { is_friend_request: 0 | 1; is_toast: 0 | 1; is_comment: 0 | 1 };
}

interface CheckinBeer {
  bid: number; beer_name: string; beer_label: string;
  beer_abv: number; beer_ibu: number; beer_slug: string;
  beer_description: string; is_in_production: 0 | 1;
  beer_style_id: number; beer_style: string;
  auth_rating: number; wish_list: boolean; beer_active: 0 | 1;
}

interface CheckinBrewery {
  brewery_id: number; brewery_name: string; brewery_slug: string;
  brewery_page_url: string; brewery_label: string;
  country_name: string; country_id: string;
  contact: { twitter?: string; facebook?: string; url?: string };
  location: { brewery_city: string; brewery_state: string; lat: number; lng: number };
  brewery_active: 0 | 1;
}

interface RetailVenue {
  venue_id: number; venue_name: string; venue_slug: string;
  primary_category_key: string; primary_category: string; parent_category_id: string;
  categories: Count<{ category_key: string; category_name: string; category_id: string; is_primary: boolean }>;
  location: { venue_address: string; venue_city: string; venue_state: string; venue_country: string; lat: number; lng: number };
  contact: { twitter: string; venue_url: string };
  foursquare: { foursquare_id: string; foursquare_url: string };
  venue_icon: { sm: string; md: string; lg: string };
  is_verified: boolean;
}

interface EarnedBadge {
  user_badge_id: number; badge_id: number;
  badge_name: string; badge_description: string;
  is_local_badge: boolean; is_level_badge: boolean;
  venue_name: string; venue_id?: number;
  subscribe_status?: { is_subscribed: 0 | 1; subscribe_type: string } | null;
  badge_image: { sm: string; md: string; lg: string };
}

interface Promotion {
  promo_type: "standard" | "verified_venue";
  promo_type_enhanced: string; // did_you_know, new_verified_venue, reused_verified_venue, verified_venue_festival, standard
  promo_name: string; promo_legal: string; promo_description: string;
  promo_image: { image: string; size: { height: number | string; width: number } };
  local_badges: Count<unknown>;
  venue?: { group_id: number; venue_id: number; venue_name: string;
            subscribe_status: { is_subscribed: 0 | 1; subscribe_type: string } };
}
```

Search-result beer (from a search-results fixture):
`bid, beer_name, beer_label, beer_abv, beer_ibu, beer_description,
beer_style, is_in_production, rating_count, rating_score, beer_slug`.

---

## Ideas for this app

- **Venue menus**: switch `app/routes/untappd/venue.ts` from
  `/inventory/view/{vid}` to `POST /menus/sections` (JSON body). It supports
  server-side `styles` / `has_not_had_before` filters, which fits the Wheel of
  Styles use case well.
- **Wheel of Styles**: `/badges/styles_not_had` takes a `user_id`, so you can
  look at a friend's missing styles. `/user/user_beer_list?mode=v3` returns the IDs
  of every beer the user has had, which helps for "not had" checks.
- **Lists**: `/custom_lists/nearby/{list_id}` returns nearby venues that carry
  list items.
- **Auth**: move from the `access_token` query param to
  `Authorization: Bearer` and send `utv`, like the app does.
