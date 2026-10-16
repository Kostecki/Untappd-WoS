import { userSessionGet } from "~/auth/user.server";
import { getBeerInfo } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/beer";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const beer = await withFallback(
		getBeerInfo(user.accessToken, params.beerId),
		null,
	);

	if (!beer) {
		return Response.json([]);
	}

	const { brewery, ...beerDetails } = beer;
	const payload: BeerInfoResponse[] = [{ beer: beerDetails, brewery }];

	return Response.json(payload);
}
