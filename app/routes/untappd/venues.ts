import { userSessionGet } from "~/auth/user.server";
import { searchVenues } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/venues";

const preferredCountry = "Danmark";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const items = await withFallback(
		searchVenues(user.accessToken, params.searchQuery),
		[],
	);

	const venues: VenueDetails[] = items
		.map(({ venue }) => ({
			...venue,
			url: `https://untappd.com/v/${venue.venue_slug}/${venue.venue_id}`,
		}))
		// Stable sort: venues in the preferred country first, otherwise keep API order
		.sort(
			(a, b) =>
				Number(b.venue_country === preferredCountry) -
				Number(a.venue_country === preferredCountry),
		) as VenueDetails[];

	return Response.json(venues);
}
