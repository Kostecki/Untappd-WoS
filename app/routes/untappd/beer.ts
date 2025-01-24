import { API_BASE_URL } from "./config";
import { userSessionGet } from "~/auth/user.server";

import type { Route } from "./+types/beers";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const beerId = params.beerId;

  const searchParams = new URLSearchParams({
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/beer/info/${beerId}?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get beers", response);
    return Response.json([]);
  }

  const data = await response.json();
  const beer = data.response.beer;

  return Response.json(beer);
}
