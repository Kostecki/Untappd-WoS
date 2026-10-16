import { untappd } from "./client.server";
import { APP_VERSION, DEVICE, getDeviceUdid } from "./config.server";

// Endpoints and params mirror the official Android app 5.0.0, see docs/untappd-api.md

// Auth

/**
 * With multi_account, credentials matching several accounts (e.g. a shared
 * email) return `multiple_users` instead of a token; the app then shows an
 * account picker
 */
type LoginResponse =
	| { access_token: string; username: string; multiple_users?: undefined }
	| { access_token?: undefined; multiple_users: unknown };

const login = (userName: string, password: string) =>
	untappd<LoginResponse>("/xauth", {
		method: "POST",
		// Same fields as the app's login screen
		body: {
			user_name: userName,
			user_password: password,
			device_udid: getDeviceUdid(userName),
			device_name: DEVICE.name,
			device_version: DEVICE.systemVersion,
			device_platform: DEVICE.systemName,
			app_version: APP_VERSION,
			multi_account: true,
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

// Styles

/** All Untappd beer styles (id + name) */
const getBeerTypes = (accessToken: string) =>
	untappd<{
		items: { type_id: number; type_name: string; parent_id: number }[];
	}>("/helpers/list_beer_types", { accessToken }).then(
		(response) => response.items,
	);

// Lists

// /custom_lists/view returns 25 items per page
const listPageSize = 25;
const maxListPages = 20;

// Lists that remove beers on check-in (like the wish list) keep returning
// those beers with on_list: false
const isOnList = (item: ListViewResponse["items"][number]) =>
	item.beer.on_list !== false;

/** A list with all of its items; the `styles` summary always covers the whole list */
const getListView = async (accessToken: string, listId: string | number) => {
	const firstPage = await untappd<ListViewResponse>(
		`/custom_lists/view/${listId}`,
		{ accessToken, params: { styles: true } },
	);
	const items = firstPage.items.filter(isOnList);
	let fetched = firstPage.items.length;

	for (
		let page = 1;
		page < maxListPages &&
		fetched === page * listPageSize &&
		items.length < firstPage.total_count;
		page++
	) {
		const { items: pageItems } = await untappd<ListViewResponse>(
			`/custom_lists/view/${listId}`,
			{ accessToken, params: { offset: page * listPageSize } },
		);
		fetched += pageItems.length;
		items.push(...pageItems.filter(isOnList));
	}

	return { ...firstPage, items };
};

// Beer

const searchBeers = (accessToken: string, query: string) =>
	untappd<{ beers: { items: BeerStringSearchResponse[] } }>("/search/beer", {
		accessToken,
		params: { q: query },
	}).then((response) => response.beers.items);

const getBeerInfo = (accessToken: string, beerId: string | number) =>
	untappd<{ beer: BeerInfo & { brewery: Brewery } }>(`/beer/info/${beerId}`, {
		accessToken,
		params: { compact: "enhanced", include_checkins: false },
	}).then((response) => response.beer);

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

/** Top rated beers of a style worldwide, only those still in production */
const getTopRatedBeers = (accessToken: string, typeId: number | string) =>
	untappd<{ beers: { items: TopRatedBeer[] } }>("/beer/top_rated", {
		accessToken,
		params: { type_id: typeId, in_production: 1 },
	}).then((response) => response.beers.items);

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
	getBadge,
	getBeerInfo,
	getBeerTypes,
	getListView,
	getStylesNotHad,
	getTopRatedBeers,
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
