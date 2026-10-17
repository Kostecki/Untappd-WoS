import { requireUser } from "~/auth/user.server";
import { searchBeers } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/beers";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await requireUser(request);
	const beers = await withFallback(
		searchBeers(user.accessToken, params.searchQuery),
		[],
	);

	return Response.json(beers);
}
