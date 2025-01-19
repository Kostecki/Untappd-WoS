interface Beer {
  bid: number;
  beer_name: string;
  beer_label: string;
  beer_abv: number;
  beer_ibu: number;
  beer_slug: string;
  beer_description: string;
  is_in_production: number;
  beer_style_id: number;
  beer_style: string;
  rating_score: number;
  rating_count: number;
  count: number;
  beer_active: number;
  on_list: boolean;
  has_had: boolean;
}

interface Brewery {
  brewery_id: number;
  brewery_name: string;
  brewery_slug: string;
  brewery_page_url: string;
  brewery_label: string;
  country_name: string;
  contact: {
    twitter: string;
    facebook: string;
    url: string;
  };
  location: {
    brewery_city: string;
    brewery_state: string;
    lat: number;
    lng: number;
  };
  brewery_active: number;
}

interface FullBeer {
  beer: Beer;
  brewery: Brewery;
}

interface BadgeMedia {
  badge_image_sm: string;
  badge_image_md: string;
  badge_image_lg: string;
}

interface Badge {
  badge_id: number;
  user_badge_id: number;
  checkin_id: number;
  badge_name: string;
  badge_description: string;
  badge_hint: string;
  badge_active_status: number;
  media: BadgeMedia;
  earned_at: string;
  created_at: string;
  is_level: boolean;
  category_id: number;
}
