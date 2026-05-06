import { userSessionGet } from "~/auth/user.server";
import type { Route } from "./+types/mbcc-venue";
import { getMBCCVenueMenu } from "./mbcc.server";

export async function loader({ request }: Route.LoaderArgs) {
	await userSessionGet(request);
	return Response.json(await getMBCCVenueMenu());
}
