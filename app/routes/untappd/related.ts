import { API_BASE_URL } from "./config";
import { userSessionGet } from "~/auth/user.server";

import type { Route } from "./+types/related";

const lat = 55.6397;
const lng = 12.0874;
const distance = 250;
const type = "local";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const styleId = params.styleId;

  const searchParams = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(distance),
    type_id: String(styleId),
    type: String(type),
    range: String(distance),
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/beer/trending?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get related beers", response);
    return [];
  }

  const data = await response.json();
  const items = data.response.items;

  return Response.json(items);
}
