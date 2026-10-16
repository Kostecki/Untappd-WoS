import { userSessionGet } from "~/auth/user.server";
import { getTrendingBeers } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/related";

// Fixed to the area around Copenhagen for now
const lat = 55.6397;
const lng = 12.0874;
const radius = 250;

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const items = await withFallback(
		getTrendingBeers(user.accessToken, {
			lat,
			lng,
			radius,
			typeId: params.styleId,
		}),
		[],
	);

	return Response.json(items);
}
