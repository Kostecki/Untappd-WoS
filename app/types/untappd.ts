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
  venue: VenueDetails;
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
  beer_abv: number;
  beer_ibu: number;
  beer_slug: string;
  beer_description: string;
  beer_style: string;
  beer_style_id?: number;
  is_in_production: number;
  rating_score: number;
  rating_count: number;
}

interface BeerWithBrewery {
  beer: Beer;
  brewery: Brewery;
}

interface BarcodeAPIResponse extends BeerWithBrewery {}

interface BeerInfoResponse extends BeerWithBrewery {
  beer: Beer & { stats: Stats };
}

interface BeerStringSearchResponse {
  checkin_count: number;
  have_had: boolean;
  your_count: number;
  beer: Beer;
  brewery: Brewery;
}

type BeerWithStylesHad = (BarcodeAPIResponse | BeerInfoResponse) & {
  beer: Beer & { style_had: boolean };
};

// Menu and User
interface SectionItem {
  created_at: string;
  price: {
    value: string;
    currency: string;
    currency_symbol: string;
  };
  serving_type: string;
  beer: Beer;
  brewery: Brewery;
}

interface MenuSection {
  section_id: number;
  section_name: string;
  section_description: string;
  count: number;
  items: SectionItem[];
}

interface FlattednedMenuData {
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

interface Badge {
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
