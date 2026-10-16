import { userSessionGet } from "~/auth/user.server";
import { getVenueMenus } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/venue";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const menus = await withFallback(
		getVenueMenus(user.accessToken, params.venueId),
		[],
	);

	return Response.json(menus);
}
