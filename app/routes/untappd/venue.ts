import { redirect } from "react-router";

import { requireUser } from "~/auth/user.server";
import { toMenus as toTemporaryMenus } from "~/temporary-venues/mappers.server";
import { getTemporaryVenue } from "~/temporary-venues/store.server";
import { getVenueMenuSections, getVenueMenus } from "~/untappd/api.server";
import { isInvalidToken, withFallback } from "~/untappd/client.server";
import type { Route } from "./+types/venue";

const toSectionItem = (item: MenuSectionItem): SectionItem => {
	const [container] = item.containers;

	return {
		created_at: item.created_at,
		serving_type: container?.name ?? "",
		price: container && {
			value: container.price,
			currency: container.currency,
			currency_symbol: container.currency_symbol,
		},
		has_had: item.has_had,
		on_list: item.on_list,
		tap_number: item.tap_number || undefined,
		beer: {
			bid: item.untappd_id,
			// `name`/`style` are the venue's display values, e.g. "1. Darkness (Nitro)"
			beer_name: item.original_name || item.name,
			beer_label: item.label_image,
			beer_label_hd: item.label_image_hd,
			beer_abv: Number(item.abv) || 0,
			beer_ibu: Number(item.ibu) || 0,
			beer_slug: item.untappd_beer_slug,
			beer_description: item.description,
			beer_style: item.original_style || item.style,
			is_in_production: Number(item.in_production),
			rating_score: Number(item.rating) || 0,
			rating_count: item.rating_count,
		},
		brewery: {
			brewery_id: item.untappd_brewery_id,
			brewery_name: item.brewery,
			brewery_slug: item.untappd_brewery_slug,
			brewery_page_url: item.untappd_brewery_page_url,
			brewery_label: "",
			country_name: item.brewery_country,
		},
	};
};

/** Groups the flat section list from /menus/sections back into menus */
const toMenus = (sections: MenuSectionsSection[]): VenueMenuDetails[] => {
	const menus = new Map<number, VenueMenuDetails>();

	for (const section of sections) {
		let menu = menus.get(section.menu_id);
		if (!menu) {
			menu = {
				menu_id: section.menu_id,
				menu_name: section.menu_name,
				menu_description: section.menu_description,
				created_at: "",
				updated_at: "",
				total_item_count: 0,
				sections: { count: 0, items: [] },
			};
			menus.set(section.menu_id, menu);
		}

		menu.total_item_count += section.total_count;
		menu.sections.count += 1;
		menu.sections.items.push({
			section_id: section.section_id,
			section_name: section.section_name.trim(),
			section_description: section.section_description,
			count: section.items.length,
			items: section.items.map(toSectionItem),
		});
	}

	return [...menus.values()];
};

export async function loader({ request, params }: Route.LoaderArgs) {
	const user = await requireUser(request);
	const { venueId } = params;

	// Temporary venues have negative ids and are served from storage
	if (Number(venueId) < 0) {
		const venue = await getTemporaryVenue(Number(venueId));
		return Response.json(venue ? toTemporaryMenus(venue) : []);
	}

	try {
		const sections = await getVenueMenuSections(user.accessToken, venueId);
		return Response.json(toMenus(sections));
	} catch (error) {
		if (isInvalidToken(error)) {
			throw redirect("/logout");
		}

		// Fall back to the legacy endpoint, which still works for now
		console.error(error instanceof Error ? error.message : error);
		const menus = await withFallback(
			getVenueMenus(user.accessToken, venueId),
			[],
		);
		return Response.json(menus);
	}
}
