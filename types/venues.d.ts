interface Venue {
  is_closed: number;
  is_verified: boolean;
  location: string;
  primary_category: string;
  venue_address: string;
  venue_city: string;
  venue_country: string;
  venue_icon: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  venue_id: number;
  venue_name: string;
  venue_slug: string;
  venue_state: string;
  is_verified: boolean;
}

interface VenueResponse {
  venue: Venue;
}

interface VenueOffering {
  beers: FullBeer[];
  menu: string;
  venueId: number;
  venueName: string;
  venueSlug: string;
  isVerified: boolean;
}

interface Menu {
  count: number;
  created_at: string;
  items: FullBeer[];
  section_description: string;
  section_id: number;
  section_name: string;
  total_count: number;
}

interface MenuItem {
  menu: {
    created_at: string;
    menu_description: string;
    menu_id: number;
    menu_name: string;
    ng_menu_id: string;
    total_items_count: number;
    updated_at: string;
    sections: {
      count: number;
      items: Menu[];
    };
  };
}
