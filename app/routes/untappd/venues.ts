import { API_BASE_URL } from "./config";
import { userSessionGet } from "~/auth/user.server";

import type { Route } from "./+types/venues";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const query = params.searchQuery;

  const searchParams = new URLSearchParams({
    q: query,
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/search/venue?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get venues", response);
    return Response.json([]);
  }

  const data = (await response.json()) as {
    response: { venues: { items: VenueSearchAPIResponse[] } };
  };
  const { items } = data.response.venues;

  const sortedVenues = items
    .map(({ venue }) => {
      const { venue_id, venue_slug } = venue;

      return {
        ...venue,
        url: `https://untappd.com/v/${venue_slug}/${venue_id}`,
      };
    })
    .sort((a: Venue, b: Venue) => {
      return a.venue_country === "Danmark"
        ? -1
        : b.venue_country === "Danmark"
        ? 1
        : 0;
    }) as VenueDetails[];

  return Response.json(sortedVenues);
}
