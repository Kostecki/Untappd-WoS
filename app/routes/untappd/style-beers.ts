import { userSessionGet } from "~/auth/user.server";
import { getTopRatedBeers, getTrendingBeers } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import { getLocationParams } from "~/untappd/location.server";
import type { Route } from "./+types/style-beers";

const topRatedLimit = 15;

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const { styleId } = params;

	const [topRated, trending] = await Promise.all([
		withFallback(getTopRatedBeers(user.accessToken, styleId), []),
		withFallback(
			getTrendingBeers(user.accessToken, {
				...getLocationParams(request),
				typeId: styleId,
			}),
			[],
		),
	]);

	// The same beer is often checked in at several venues; keep the nearest
	const nearby = [...trending]
		.sort((a, b) => a.distance - b.distance)
		.filter(
			(item, index, all) =>
				all.findIndex((other) => other.beer.bid === item.beer.bid) === index,
		);

	const payload: StyleBeersPayload = {
		topRated: topRated.slice(0, topRatedLimit),
		nearby,
	};

	return Response.json(payload);
}
