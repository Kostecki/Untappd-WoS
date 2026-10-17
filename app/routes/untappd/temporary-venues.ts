import { requireUser } from "~/auth/user.server";
import { toVenueDetails } from "~/temporary-venues/mappers.server";
import { listVisibleTemporaryVenues } from "~/temporary-venues/store.server";
import type { Route } from "./+types/temporary-venues";

/** Active temporary venues, shown in the venue search before anything is typed */
export async function loader({ request }: Route.LoaderArgs) {
	await requireUser(request);
	const venues = await listVisibleTemporaryVenues();
	return Response.json(venues.map(toVenueDetails));
}
