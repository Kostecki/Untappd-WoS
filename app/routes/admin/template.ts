import { requireAdmin } from "~/auth/user.server";
import { createTemplate } from "~/temporary-venues/xlsx.server";
import { getBeerTypes } from "~/untappd/api.server";
import { cached } from "~/untappd/cache.server";
import type { Route } from "./+types/template";

const styleListTtlMs = 24 * 60 * 60 * 1000;

/** An .xlsx to fill in, with a dropdown of the current Untappd styles */
export async function loader({ request }: Route.LoaderArgs) {
	const admin = await requireAdmin(request);
	const styles = await cached("beer-types", styleListTtlMs, () =>
		getBeerTypes(admin.accessToken),
	);
	const file = await createTemplate(styles.map((style) => style.type_name));

	return new Response(file, {
		headers: {
			"Content-Type":
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": 'attachment; filename="temporary-venue.xlsx"',
		},
	});
}
