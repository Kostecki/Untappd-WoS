import { userSessionGet } from "~/auth/user.server";
import { getListView } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/list";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const list = await withFallback(
		getListView(user.accessToken, params.listId),
		null,
	);

	if (!list) {
		return Response.json(null, { status: 502 });
	}

	const payload: ListDetailsPayload = {
		list_name: list.list.list_name,
		listItems: list.items,
		styleIds: list.styles.items.map((style) => style.type_id),
	};

	return Response.json(payload);
}
