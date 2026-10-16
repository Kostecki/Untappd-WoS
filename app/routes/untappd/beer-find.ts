import { userSessionGet } from "~/auth/user.server";
import { findBeer } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import { getLocationParams } from "~/untappd/location.server";
import type { Route } from "./+types/beer-find";

// Untappd/Foursquare categories for places that sell beer to take away
const shopCategories = [
	"bottle shop",
	"beer store",
	"liquor store",
	"wine shop",
	"supermarket",
	"grocery store",
	"convenience store",
	"market",
];

const isShop = (venue: NearbyVenue) =>
	venue.categories.items.some((category) => {
		const name = (category.category_name_en ?? category.category_name)
			.trim()
			.toLowerCase();
		return shopCategories.includes(name);
	});

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const result = await withFallback(
		findBeer(user.accessToken, params.beerId, getLocationParams(request)),
		null,
	);

	if (!result) {
		return Response.json([]);
	}

	const places: BeerFindPlace[] = [
		...result.verified.items.map((item) => ({
			item,
			source: "menu" as const,
		})),
		...result.unverified.items.map((item) => ({
			item,
			source: "checkin" as const,
		})),
	]
		// A venue can be both on the menu and checked in; keep the menu entry
		.filter(
			({ item }, index, all) =>
				all.findIndex(
					(other) => other.item.venue.venue_id === item.venue.venue_id,
				) === index,
		)
		.map(({ item, source }) => ({
			venueId: item.venue.venue_id,
			venueName: item.venue.venue_name,
			venueSlug: item.venue.venue_slug,
			distance: item.distance,
			isShop: isShop(item.venue),
			source,
			date: item.created_at,
		}))
		.sort((a, b) => a.distance - b.distance);

	return Response.json(places);
}
