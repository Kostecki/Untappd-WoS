import { data } from "react-router";

import { requireUser } from "~/auth/user.server";
import { isListId, serializeStockListId } from "~/settings.server";
import type { Route } from "./+types/stock-list";

export async function action({ request }: Route.ActionArgs) {
	await requireUser(request);

	const listId = (await request.formData()).get("listId");

	if (listId !== "" && !isListId(listId)) {
		return data({ ok: false }, { status: 400 });
	}

	return data(
		{ ok: true },
		{ headers: { "Set-Cookie": await serializeStockListId(listId || null) } },
	);
}
