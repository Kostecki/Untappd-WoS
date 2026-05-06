import { userSessionGet } from "~/auth/user.server";
import type { Route } from "./+types/mbcc-venues";
import { getMBCCVirtualVenues } from "./mbcc.server";

export async function loader({ request }: Route.LoaderArgs) {
	await userSessionGet(request);

	return Response.json(await getMBCCVirtualVenues());
}
