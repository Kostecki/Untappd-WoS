interface SearchResponseBeer {
  bid: number;
  beer_name: string;
  beer_label: string;
  beer_abv: number;
  beer_slug: string;
  beer_ibu: number;
  beer_description: string;
  created_at: string;
  beer_style: string;
  in_production: number;
}

interface SearchResponseBrewery {
  brewery_id: number;
  brewery_name: string;
  brewery_slug: string;
  brewery_page_url: string;
  brewery_type: string;
  brewery_label: string;
  country_name: string;
  contact: {
    twitter: string;
    facebook: string;
    instagram: string;
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

interface SearchResponse {
  beer: SearchResponseBeer;
  brewery: SearchResponseBrewery;
  checkin_count: number;
  have_had: boolean;
  your_count: number;
}
