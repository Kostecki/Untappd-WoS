import { DEVICE_UDID } from "./config.server";
import { untappd } from "./client.server";

// Endpoints and params mirror the official Android app 5.0.0, see docs/untappd-api.md

// Auth

const login = (userName: string, password: string) =>
	untappd<{ access_token: string; username: string }>("/xauth", {
		method: "POST",
		body: {
			user_name: userName,
			user_password: password,
			device_udid: DEVICE_UDID,
		},
	});

// User

const getUserInfo = (accessToken: string, userName: string) =>
	untappd<{ user: UntappdUser }>(`/user/info/${userName}`, {
		accessToken,
		params: { compact: "enhanced" },
	}).then((response) => response.user);

const getUserBadges = (accessToken: string, offset = 0) =>
	untappd<{ count: number; items: UserBadge[] }>("/user/badges", {
		accessToken,
		params: { offset },
	});

const getUserLists = (accessToken: string) =>
	untappd<{ items: UserLists[] }>("/custom_lists/userlists", {
		accessToken,
	}).then((response) => response.items);

// Badges / Wheel of Styles

const getStylesNotHad = (accessToken: string, userId?: number) =>
	untappd<{ items: { style_id: number; style_name: string }[] }>(
		"/badges/styles_not_had",
		{ accessToken, params: { user_id: userId } },
	).then((response) => response.items);

const getBadge = (accessToken: string, userBadgeId: number) =>
	untappd<{ badge: Badge }>(`/badges/view/${userBadgeId}`, {
		accessToken,
	}).then((response) => response.badge);

// Lists

const getListView = (accessToken: string, listId: string | number) =>
	untappd<ListViewResponse>(`/custom_lists/view/${listId}`, {
		accessToken,
		params: { styles: true },
	});

// Beer

const searchBeers = (accessToken: string, query: string) =>
	untappd<{ beers: { items: BeerStringSearchResponse[] } }>("/search/beer", {
		accessToken,
		params: { q: query },
	}).then((response) => response.beers.items);

const getBeerInfo = (accessToken: string, beerId: string | number) =>
	untappd<{ beer: BeerInfo & { brewery: Brewery } }>(
		`/beer/info/${beerId}`,
		{
			accessToken,
			params: { compact: "enhanced", include_checkins: false },
		},
	).then((response) => response.beer);

const checkBarcode = (accessToken: string, upc: string) =>
	untappd<{ items: BarcodeAPIResponse[] }>("/beer/checkbarcodemultiple", {
		accessToken,
		params: { upc },
	}).then((response) => response.items);

interface NearbyOptions {
	lat: number;
	lng: number;
	/** In km */
	radius: number;
}

/** Beers of a style recently checked in nearby, with where they were seen */
const getTrendingBeers = (
	accessToken: string,
	{ lat, lng, radius, typeId }: NearbyOptions & { typeId: number | string },
) =>
	untappd<{ items: RelatedBeersResponse[] }>("/beer/trending", {
		accessToken,
		params: {
			lat,
			lng,
			radius,
			range: radius,
			dist_pref: "km",
			type_id: typeId,
			type: "local",
		},
	}).then((response) => response.items);

/**
 * Where a beer can be found nearby: `verified` = on a verified venue's menu,
 * `unverified` = recently checked in at a venue
 */
const findBeer = (
	accessToken: string,
	beerId: number | string,
	{ lat, lng, radius }: NearbyOptions,
) =>
	untappd<BeerFindResponse>(`/beer/find/${beerId}`, {
		accessToken,
		params: { lat, lng, radius, dis_pref: "km", mode: "enhanced" },
	});

// Venues

const searchVenues = (accessToken: string, query: string) =>
	untappd<{ venues: { items: VenueSearchAPIResponse[] } }>("/search/venue", {
		accessToken,
		params: { q: query },
	}).then((response) => response.venues.items);

/**
 * Beer menus of a venue via the menus API the 5.0 app uses. Must be sent
 * form-encoded (a JSON body is rejected with response_code 403). Items include
 * per-user `has_had` and `on_list`.
 */
const getVenueMenuSections = (accessToken: string, venueId: string | number) =>
	untappd<MenuSectionsResponse>("/menus/sections", {
		accessToken,
		method: "POST",
		body: {
			venue_id: venueId,
			flatten_when_filtering: true,
			// Default page size is 10 per section; 100 returns whole sections
			limit: 100,
			"types[]": "Items::Beer",
		},
	}).then((response) => response.sections);

/** Legacy menus endpoint, no longer used by the official app */
const getVenueMenus = (accessToken: string, venueId: string | number) =>
	untappd<{ items: VenueDetailsAPIResponse[] }>(`/inventory/view/${venueId}`, {
		accessToken,
	}).then((response) => response.items.map(({ menu }) => menu));

export {
	checkBarcode,
	findBeer,
	getBadge,
	getBeerInfo,
	getListView,
	getStylesNotHad,
	getTrendingBeers,
	getUserBadges,
	getUserInfo,
	getUserLists,
	getVenueMenuSections,
	getVenueMenus,
	login,
	searchBeers,
	searchVenues,
};
