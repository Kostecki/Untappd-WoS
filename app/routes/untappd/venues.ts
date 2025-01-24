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

  const data = await response.json();
  const venues = data.response.venues.items;

  // TODO: Type
  const sortedVenues = venues
    .map((venue: any) => {
      const { venue_id, venue_slug } = venue.venue;

      return {
        ...venue,
        venue: {
          ...venue.venue,
          url: `https://untappd.com/v/${venue_slug}/${venue_id}`,
        },
      };
    })
    .sort((a: any, b: any) => {
      return a.venue.venue_country === "Danmark"
        ? -1
        : b.venue.venue_country === "Danmark"
        ? 1
        : 0;
    });

  return Response.json(sortedVenues);
}
