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

  const data = (await response.json()) as {
    response: { beer: BeerInfoBeer & { brewery: Brewery } };
  };

  const {
    beer: {
      bid,
      beer_name,
      beer_label,
      beer_label_hd,
      beer_abv,
      beer_ibu,
      beer_description,
      beer_style,
      is_in_production,
      beer_slug,
      is_homebrew,
      created_at,
      rating_count,
      rating_score,
      stats,
      brewery,
    },
  } = data.response;

  const payload = [
    {
      beer: {
        bid,
        beer_name,
        beer_label,
        beer_label_hd,
        beer_abv,
        beer_ibu,
        beer_description,
        beer_style,
        is_in_production,
        beer_slug,
        is_homebrew,
        created_at,
        rating_count,
        rating_score,
        stats,
      },
      brewery,
    },
  ] as BeerInfoResponse[];

  return Response.json(payload);
}
