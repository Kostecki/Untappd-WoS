interface Price {
  value: string;
  currency: string;
  curreny_symbol: string;
  currency_symbol: string;
}

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

interface SearchableBeer {
  bid: number;
  beer_name: string;
  beer_slug: string;
  beer_style: string;
  beer_label: string;
  beer_abv: number;
  beer_description: string;
  brewery_id: number;
  brewery_name: string;
  hadBeer: boolean;
  hadStyle: boolean;
}

interface FullBeer {
  created_at: string;
  price: Price;
  serving_type: string;
  beer: Beer;
  brewery: Brewery;
}
