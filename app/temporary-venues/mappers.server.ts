// Temporary venues in the shapes the venue search and venue view already use

const toVenueDetails = (venue: TemporaryVenue): VenueDetails => ({
	venue_id: venue.id,
	venue_name: venue.name,
	venue_slug: "",
	venue_address: venue.location ?? "",
	venue_city: venue.location ?? "",
	venue_state: "",
	venue_country: "",
	venue_icon: {},
	is_verified: true,
	is_closed: 0,
	primary_category: "Temporary",
	location: "",
	has_beer: 1,
	has_food: 0,
	has_wine: 0,
	has_spirits: 0,
	url: venue.url ?? "",
	temporary: true,
});

const toSectionItem = (
	beer: TemporaryVenueBeer,
	updatedAt: string,
): SectionItem => ({
	created_at: updatedAt,
	serving_type: "",
	beer: {
		bid: beer.bid,
		beer_name: beer.name,
		beer_label: "",
		beer_abv: beer.abv ?? 0,
		beer_ibu: 0,
		// Untappd redirects /b/-/{bid} to the beer's page
		beer_slug: "-",
		beer_description: "",
		beer_style: beer.style,
		beer_style_id: beer.styleId ?? undefined,
		is_in_production: 1,
		rating_score: beer.rating ?? 0,
		rating_count: 0,
	},
	brewery: {
		brewery_id: 0,
		brewery_name: beer.brewery,
		brewery_slug: "",
		brewery_page_url: "",
		brewery_label: "",
		country_name: beer.country ?? "",
	},
});

const toMenus = (venue: TemporaryVenue): VenueMenuDetails[] =>
	venue.menus.map((menu) => ({
		menu_id: menu.id,
		menu_name: menu.name,
		menu_description: "",
		created_at: venue.createdAt,
		updated_at: venue.updatedAt,
		total_item_count: menu.items.length,
		sections: {
			count: 1,
			items: [
				{
					section_id: menu.id,
					section_name: menu.name,
					section_description: "",
					count: menu.items.length,
					items: menu.items.map((beer) => toSectionItem(beer, venue.updatedAt)),
				},
			],
		},
	}));

export { toMenus, toVenueDetails };
