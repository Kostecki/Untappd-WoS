import { requireUser } from "~/auth/user.server";
import { toVenueDetails } from "~/temporary-venues/mappers.server";
import { listVisibleTemporaryVenues } from "~/temporary-venues/store.server";
import { searchVenues } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/venues";

const preferredCountry = "Danmark";

// Case and accent insensitive, so "oksnehallen" finds "Øksnehallen"
const normalize = (text: string) =>
	text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/ø/gi, "o")
		.replace(/æ/gi, "ae")
		.toLowerCase();

/**
 * All active temporary venues, so they're always at hand while they run;
 * those whose name or location matches every search word come first
 */
const findTemporaryVenues = async (query: string) => {
	const words = normalize(query).split(/\s+/).filter(Boolean);
	const matches = (venue: TemporaryVenue) => {
		const haystack = normalize(`${venue.name} ${venue.location ?? ""}`);
		return words.every((word) => haystack.includes(word));
	};

	const venues = await listVisibleTemporaryVenues();
	return [
		...venues.filter(matches),
		...venues.filter((venue) => !matches(venue)),
	].map(toVenueDetails);
};

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await requireUser(request);
	const [items, temporaryVenues] = await Promise.all([
		withFallback(searchVenues(user.accessToken, params.searchQuery), []),
		findTemporaryVenues(params.searchQuery),
	]);

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

	// Temporary venues first; the dropdown shows them as their own group
	return Response.json([...temporaryVenues, ...venues]);
}
