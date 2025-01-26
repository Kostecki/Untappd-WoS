import { API_BASE_URL } from "./config";
import { userSessionGet } from "~/auth/user.server";

import type { Route } from "./+types/list";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await userSessionGet(request);
  const listId = params.listId;

  const searchParams = new URLSearchParams({
    styles: "true",
    access_token: user.accessToken,
  });
  const url = `${API_BASE_URL}/custom_lists/view/${listId}?${searchParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get list details", response);
    return [];
  }

  const data = await response.json();

  const {
    items,
    styles,
    list: { list_name },
  } = data.response;

  const stockListDeatils = {
    list_name,
    listItems: items,
    styles,
  };

  return Response.json(stockListDeatils);
}
