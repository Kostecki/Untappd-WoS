import { API_BASE_URL } from "./config";
import { userSessionGet } from "~/auth/user.server";

import type { Route } from "./+types/venue";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const venueId = params.venueId;

  const searchParams = new URLSearchParams({
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/inventory/view/${venueId}?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get venue", response);
    return Response.json([]);
  }

  const data = (await response.json()) as {
    response: { items: VenueDetailsAPIResponse[] };
  };
  const { items } = data.response;

  const menus = items.map(({ menu }) => menu);

  return Response.json(menus);
}
