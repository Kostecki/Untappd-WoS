import { API_BASE_URL } from "./config";

import { userSessionGet } from "~/auth/user.server";
import type { Route } from "./+types/barcode";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const barcode = params.barcode;

  const searchParams = new URLSearchParams({
    upc: barcode,
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/beer/checkbarcodemultiple?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get beer(s) from barcode", response);
    return Response.json([]);
  }

  const data = await response.json();
  const { items } = data.response;

  return Response.json(items);
}
