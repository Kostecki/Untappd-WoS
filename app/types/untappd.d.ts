declare global {
	// Location and Venue
	interface BreweryLocation {
		brewery_city: string;
		brewery_state: string;
		lat: number;
		lng: number;
	}

	interface Venue {
		venue_id: number;
		venue_name: string;
		venue_slug: string;
		venue_address: string;
		venue_city: string;
		venue_state: string;
		venue_country: string;
		venue_icon: { sm?: string; md?: string; lg?: string };
		is_verified: boolean;
		is_closed: number;
		primary_category: string;
		location: string;
	}

	interface VenueDetails extends Venue {
		has_beer: number;
		has_food: number;
		has_wine: number;
		has_spirits: number;
		url: string;
	}

	interface VenueSearchAPIResponse {
		venue: Venue;
	}

	type MBCCSession = "yellow" | "blue" | "red" | "green";

	interface MBCCVenueDetails extends VenueDetails {
		mbcc_event: true;
	}

	interface VenueMenuDetails {
		menu_id: number;
		menu_name: string;
		menu_description: string;
		created_at: string;
		updated_at: string;
		total_item_count: number;
		sections: {
			count: number;
			items: MenuSection[];
		};
	}

	interface VenueDetailsAPIResponse {
		menu: VenueMenuDetails;
	}

	interface MBCCVenueMenuDetails extends VenueMenuDetails {
		mbcc_event: true;
		mbcc_session: MBCCSession;
	}

	interface MBCCCompiledData {
		event_id: "mbcc-2026";
		generated_at: string;
		venues: MBCCVenueDetails[];
		menus: Record<MBCCSession, MBCCVenueMenuDetails[]>;
		diagnostics: {
			source_version: string;
			resolved_beers: number;
			unresolved_beers: number;
		};
	}

	// Beer and Brewery
	interface Brewery {
		brewery_id: number;
		brewery_name: string;
		brewery_slug: string;
		brewery_page_url: string;
		brewery_label: string;
		country_name: string;
		location: BreweryLocation;
		brewery_type?: string;
		brewery_active?: number;
	}

	interface Beer {
		bid: number;
		beer_name: string;
		beer_label: string;
		beer_label_hd?: string;
		beer_abv: number;
		beer_ibu: number;
		beer_slug: string;
		beer_description: string;
		beer_style: string;
		beer_style_id?: number;
		is_in_production: number;
		is_homebrew?: number;
		created_at?: string;
		rating_score: number;
		rating_count: number;
	}

	interface BeerWithBrewery {
		beer: Beer;
		brewery: Brewery;
	}

	interface BarcodeAPIResponse extends BeerWithBrewery {}

	// /beer/info/{bid}?compact=enhanced (subset)
	interface BeerInfo extends Beer {
		stats: Stats;
		auth_rating: number;
		wish_list: boolean;
		parent_style_id: number;
		parent_style_name: string;
		is_non_alcoholic: boolean;
		friends_ratings: { rating_score: number; rating_count: number };
	}

	interface BeerInfoResponse extends BeerWithBrewery {
		beer: BeerInfo;
	}

	// Item from /search/beer: lighter beer object than /beer/info
	interface BeerStringSearchResponse {
		checkin_count: number;
		have_had: boolean;
		your_count: number;
		beer: Pick<
			Beer,
			| "bid"
			| "beer_name"
			| "beer_label"
			| "beer_abv"
			| "beer_ibu"
			| "beer_slug"
			| "beer_description"
			| "beer_style"
			| "created_at"
		> & { in_production: number; is_non_alcoholic: boolean };
		brewery: Brewery;
	}

	type BeerWithStylesHad = (BarcodeAPIResponse | BeerInfoResponse) & {
		beer: Beer & { style_had: boolean };
	};

	// Menu and User
	interface SectionItem {
		created_at: string;
		price?: {
			value: string;
			currency: string;
			currency_symbol: string;
		};
		serving_type: string;
		beer: Beer;
		brewery: Pick<
			Brewery,
			| "brewery_id"
			| "brewery_name"
			| "brewery_slug"
			| "brewery_page_url"
			| "brewery_label"
			| "country_name"
		> &
			Partial<Brewery>;
		// Only from /menus/sections, per logged-in user
		has_had?: boolean;
		on_list?: boolean;
		tap_number?: string;
	}

	// POST /menus/sections (form-encoded), see docs/untappd-api.md
	interface MenuSectionContainer {
		id: number;
		name: string;
		price: string;
		currency: string;
		currency_symbol: string;
		container_size: { id: number; name: string; ounces: string };
	}

	interface MenuSectionItem {
		id: number;
		name: string;
		original_name: string;
		style: string;
		original_style: string;
		short_style: string;
		type: string;
		abv: string;
		ibu: string;
		rating: string;
		rating_count: number;
		description: string;
		label_image: string;
		label_image_hd: string;
		in_production: boolean;
		is_non_alcoholic: boolean;
		nitro: boolean;
		cask: boolean;
		tap_number: string;
		created_at: string;
		updated_at: string;
		untappd_id: number;
		untappd_beer_slug: string;
		brewery: string;
		brewery_country: string;
		brewery_location: string;
		untappd_brewery_id: number;
		untappd_brewery_slug: string;
		untappd_brewery_page_url: string;
		containers: MenuSectionContainer[];
		has_had: boolean;
		on_list: boolean;
	}

	interface MenuSectionsSection {
		menu_id: number;
		menu_name: string;
		menu_description: string;
		section_id: number;
		section_name: string;
		section_description: string;
		section_position: number;
		filtered: boolean;
		total_count: number;
		total_pages: number;
		current_page: number;
		next_page: number | null;
		items: MenuSectionItem[];
	}

	interface MenuSectionsResponse {
		sections: MenuSectionsSection[];
		item_counts: Record<string, number>;
		tier: string;
	}

	interface MenuSection {
		section_id: number;
		section_name: string;
		section_description: string;
		count: number;
		items: SectionItem[];
	}

	interface FlattenedMenuData {
		menu_id: number;
		menu_name: string;
		menu_description: string;
		total_item_count: number;
		created_at: string;
		updated_at: string;
		items: SectionItem[];
	}

	interface UserListItemImage {
		count: number;
		items: { beer_label: string }[];
	}

	interface UserLists {
		list_id: number;
		list_name: string;
		list_description: string;
		total_item_count: number;
		list_image: UserListItemImage;
		is_wish_list: boolean;
		is_public: number;
		is_notes: boolean;
		is_quantity: boolean;
		is_photos: boolean;
		is_serving_style: boolean;
		is_remove_checkin: boolean;
		is_purchase_date: boolean;
		is_purchase_price: boolean;
		is_purchase_location: boolean;
		is_bottled_date: boolean;
		is_best_by_date: boolean;
		edit_item_view: boolean;
		updated_at: string;
		created_at: string;
		unix_updated_at: number;
	}

	// User Stats
	interface Level {
		currentLevel: number;
		progressToNext: number;
		checkInsPerLevel: number;
		maxLevel: number;
	}

	interface UserStats {
		hadCount: number;
		notHadCount: number;
		totalCount: number;
		level: Level;
	}

	// Statistics
	interface Stats {
		total_count: number;
		monthly_count: number;
		total_user_count: number;
		user_count: number;
	}

	// Styles
	interface StyleList {
		total_count: number;
		type_id: number;
		type_name: string;
	}

	// Badges
	interface BadgeSpecialStatusItem {
		first_created_at: string;
		created_at: string;
		item_id: number;
		item_name: string;
		total_count: number;
	}

	interface BadgeSpecialStatusGroup {
		name: string;
		group_type: string;
		count: number;
		items: BadgeSpecialStatusItem[];
	}

	interface BadgeSpecialStatusList {
		count: number;
		items: BadgeSpecialStatusGroup[];
	}

	interface BadgeStatus {
		actual_count: number;
		status: string;
		current: number;
		required: number;
		percentage: number;
		badge_id: number;
		badge_hint: string;
	}

	// /badges/view/{user_badge_id} (subset)
	interface Badge {
		user_badge_id: number;
		badge_id: number;
		badge_name: string;
		badge_description: string;
		badge_created_at: string;
		is_level_badge: boolean;
		media: {
			badge_image_sm: string;
			badge_image_md: string;
			badge_image_lg: string;
		};
		badge_status: BadgeStatus;
		special_status_list: BadgeSpecialStatusList;
	}

	interface RelatedBeersResponse {
		beer: Beer;
		brewery: Brewery;
		distance: number;
		distinct_users: number;
		recent_created_at: string;
		venue: Venue | null;
		your_count: number;
	}

	// User (subset of /user/info?compact=enhanced)
	interface UntappdUser {
		id: number;
		uid: number;
		user_name: string;
		first_name: string;
		last_name: string;
		user_avatar: string;
		user_avatar_hd: string;
		user_cover_photo: string;
		untappd_url: string;
		location: string;
		bio: string;
		is_private: number;
		is_supporter: number;
		date_joined: string;
		stats: {
			total_badges: number;
			total_friends: number;
			total_checkins: number;
			total_beers: number;
			total_created_beers: number;
			total_followings: number;
			total_photos: number;
		};
		settings: { email_address: string; is_email_verified: number };
	}

	// Item from /user/badges
	interface UserBadge {
		user_badge_id: number;
		badge_id: number;
		badge_name: string;
		badge_description: string;
		is_local_badge?: boolean;
		is_level_badge?: boolean;
		badge_image?: { sm: string; md: string; lg: string };
	}

	// /custom_lists/view/{id}?styles=true
	interface ListViewResponse {
		list: UserLists;
		items: BeerWithBrewery[];
		styles: { count?: number; items: StyleList[] };
	}

	// Payload of the /api/list/:listId route
	interface ListDetailsPayload {
		list_name: string;
		listItems: BeerWithBrewery[];
		styleIds: number[];
	}

	interface StylesInfo {
		styles: {
			styleId: number;
			styleName: string;
			had: boolean;
		}[];
		stats: UserStats;
	}
}

export {};
