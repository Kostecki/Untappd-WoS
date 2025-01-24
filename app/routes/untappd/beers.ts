import { API_BASE_URL } from "./config";
import { userSessionGet } from "~/auth/user.server";

import type { Route } from "./+types/beers";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const query = params.searchQuery;

  const searchParams = new URLSearchParams({
    q: query,
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/search/beer?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get beers", response);
    return Response.json([]);
  }

  const data = await response.json();
  const beers = data.response.beers.items;

  return Response.json(beers);
}
