import { userSessionGet } from "~/auth/user.server";
import { checkBarcode } from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/barcode";

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await userSessionGet(request);
	const items = await withFallback(
		checkBarcode(user.accessToken, params.barcode),
		[],
	);

	return Response.json(items);
}
