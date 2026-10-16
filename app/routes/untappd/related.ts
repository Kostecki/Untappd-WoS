import { userSessionGet } from "~/auth/user.server";
import { getTrendingBeers } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import { getLocationParams } from "~/untappd/location.server";
import type { Route } from "./+types/related";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const items = await withFallback(
		getTrendingBeers(user.accessToken, {
			...getLocationParams(request),
			typeId: params.styleId,
		}),
		[],
	);

	return Response.json(items);
}
