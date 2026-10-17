import { describe, expect, it, vi } from "vitest";
import { getTemporaryVenue } from "~/temporary-venues/store.server";
import { getVenueMenuSections } from "~/untappd/api.server";
import { UntappdError } from "~/untappd/client.server";
import { loader } from "./venue";

vi.mock("~/auth/user.server", () => ({
	requireUser: vi.fn(async () => ({ accessToken: "token" })),
}));
vi.mock("~/untappd/api.server", () => ({ getVenueMenuSections: vi.fn() }));
vi.mock("~/temporary-venues/store.server", () => ({
	getTemporaryVenue: vi.fn(),
}));

const menus = async (venueId: number) => {
	const response = await loader({
		request: new Request(`http://localhost/api/venue/${venueId}`),
		params: { venueId: String(venueId) },
	} as never);
	return (await response.json()) as VenueMenuDetails[];
};

const item = (overrides: Partial<MenuSectionItem> = {}) =>
	({
		untappd_id: 1,
		name: "1. Darkness (Nitro)",
		original_name: "Darkness",
		style: "Stout",
		original_style: "Stout - Irish Dry",
		abv: "4.2",
		ibu: "",
		rating: "3.71",
		rating_count: 10,
		description: "",
		label_image: "",
		label_image_hd: "",
		in_production: true,
		tap_number: "3",
		created_at: "2026-10-01",
		untappd_beer_slug: "darkness",
		brewery: "Ireland Brewing",
		brewery_country: "Ireland",
		untappd_brewery_id: 9,
		untappd_brewery_slug: "ireland-brewing",
		untappd_brewery_page_url: "/IrelandBrewing",
		containers: [
			{
				id: 1,
				name: "Pint",
				price: "75.00",
				currency: "DKK",
				currency_symbol: "kr.",
				container_size: { id: 99, name: "Pint", ounces: "16" },
			},
		],
		has_had: false,
		on_list: true,
		...overrides,
	}) as MenuSectionItem;

const section = (menuId: number, menuName: string, items: MenuSectionItem[]) =>
	({
		menu_id: menuId,
		menu_name: menuName,
		menu_description: "",
		section_id: menuId * 10,
		section_name: " Guest taps ",
		section_description: "",
		total_count: items.length,
		items,
	}) as MenuSectionsSection;

describe("venue menus", () => {
	it("groups sections into menus and maps items to the app's beer shape", async () => {
		vi.mocked(getVenueMenuSections).mockResolvedValue([
			section(1, "Taps", [item()]),
			section(1, "Taps", [item({ untappd_id: 2 })]),
			section(2, "Bottles", [item({ untappd_id: 3, containers: [] })]),
		]);

		const result = await menus(407425);

		expect(
			result.map((m) => [m.menu_name, m.total_item_count, m.sections.count]),
		).toEqual([
			["Taps", 2, 2],
			["Bottles", 1, 1],
		]);
		const first = result[0].sections.items[0];
		expect(first.section_name).toBe("Guest taps");
		expect(first.items[0]).toMatchObject({
			serving_type: "Pint",
			price: { value: "75.00", currency: "DKK", currency_symbol: "kr." },
			has_had: false,
			tap_number: "3",
			// The venue's display values ("1. Darkness (Nitro)") aren't Untappd's
			beer: {
				bid: 1,
				beer_name: "Darkness",
				beer_style: "Stout - Irish Dry",
				beer_abv: 4.2,
				rating_score: 3.71,
			},
			brewery: { brewery_name: "Ireland Brewing", country_name: "Ireland" },
		});
		expect(result[1].sections.items[0].items[0].price).toBeUndefined();
	});

	it("shows no menus for venues without published menus (403)", async () => {
		vi.mocked(getVenueMenuSections).mockRejectedValue(
			new UntappdError("response_code 403", 403, "/menus/sections"),
		);

		expect(await menus(1026)).toEqual([]);
	});

	it("serves temporary venues (negative ids) from storage", async () => {
		vi.mocked(getTemporaryVenue).mockResolvedValue({
			id: -5,
			name: "Test venue",
			location: null,
			url: null,
			active: true,
			endsOn: null,
			createdAt: "2026-10-01",
			updatedAt: "2026-10-02",
			unknownStyles: [],
			menus: [
				{
					id: 1,
					name: "Taps",
					items: [
						{
							bid: 7,
							name: "A",
							brewery: "B",
							style: "Porter - Baltic",
							styleId: 6,
							abv: 7,
							country: "SE",
							rating: null,
						},
					],
				},
			],
		});

		const result = await menus(-5);

		expect(getVenueMenuSections).not.toHaveBeenCalled();
		expect(result[0].sections.items[0].items[0].beer).toMatchObject({
			bid: 7,
			beer_name: "A",
			beer_style_id: 6,
		});
	});
});
