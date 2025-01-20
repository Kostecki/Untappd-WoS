interface Container {
  container_id: number;
  container_name: string;
  container_image_url: string;
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

interface BreweryContact {
  twitter: string;
  facebook: string;
  url: string;
}

interface BreweryLocation {
  brewery_city: string;
  brewery_state: string;
  lat: number;
  lng: number;
}

interface Brewery {
  brewery_id: number;
  brewery_name: string;
  brewery_slug: string;
  brewery_page_url: string;
  brewery_label: string;
  country_name: string;
  contact: BreweryContact;
  location: BreweryLocation;
  brewery_active: number;
}

interface FullBeer {
  beer: Beer;
  brewery: Brewery;
}
