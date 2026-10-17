import { describe, expect, it } from "vitest";
import {
	getListView,
	getTopRatedBeers,
	getVenueMenuSections,
	login,
} from "./api.server";
import { getDeviceUdid } from "./config.server";
import { mockFetch } from "./test/fetch-mock";

const listItem = (bid: number, onList = true) => ({
	beer: { bid, beer_style: "IPA", on_list: onList },
	brewery: {},
});

describe("getListView", () => {
	it("loads every page of a list", async () => {
		const pages: Record<string, unknown[]> = {
			"0": Array.from({ length: 25 }, (_, i) => listItem(i + 1)),
			"25": Array.from({ length: 25 }, (_, i) => listItem(i + 26)),
			"50": [listItem(51), listItem(52)],
		};
		const calls = mockFetch(({ url }) => ({
			list: { list_name: "På lager" },
			total_count: 52,
			styles: { items: [] },
			items: pages[url.searchParams.get("offset") ?? "0"],
		}));

		const list = await getListView("token", 755172);

		expect(list.items.map((item) => item.beer.bid)).toEqual(
			Array.from({ length: 52 }, (_, i) => i + 1),
		);
		expect(calls.map(({ url }) => url.searchParams.get("offset"))).toEqual([
			null,
			"25",
			"50",
		]);
	});

	it("skips beers that are no longer on the list and stops at total_count", async () => {
		// Like a wish list: checked-in beers come back with on_list: false
		const firstPage = [
			...Array.from({ length: 17 }, (_, i) => listItem(i + 1)),
			...Array.from({ length: 8 }, (_, i) => listItem(i + 100, false)),
		];
		const calls = mockFetch(() => ({
			list: { list_name: "Wish List" },
			total_count: 17,
			styles: { items: [] },
			items: firstPage,
		}));

		const list = await getListView("token", 1);

		expect(list.items).toHaveLength(17);
		expect(list.items.every((item) => item.beer.on_list !== false)).toBe(true);
		expect(calls).toHaveLength(1);
	});
});

const section = (
	sectionId: number,
	bids: number[],
	nextPage: number | null = null,
) => ({
	menu_id: 1,
	menu_name: "Tap list",
	section_id: sectionId,
	section_name: `Section ${sectionId}`,
	next_page: nextPage,
	items: bids.map((untappd_id) => ({ untappd_id })),
});

describe("getVenueMenuSections", () => {
	it("asks for whole sections of beers, form-encoded", async () => {
		const calls = mockFetch(() => ({ sections: [section(1, [1, 2])] }));

		await getVenueMenuSections("token", 407425);

		const body = new URLSearchParams(calls[0].body);
		expect(calls[0].method).toBe("POST");
		expect(Object.fromEntries(body)).toMatchObject({
			venue_id: "407425",
			flatten_when_filtering: "true",
			limit: "500",
			"types[]": "Items::Beer",
		});
	});

	it("pages sections that have more items", async () => {
		const calls = mockFetch(({ body }) => {
			const params = new URLSearchParams(body);
			if (!params.has("page")) {
				return { sections: [section(1, [1, 2], 2), section(2, [9])] };
			}
			return params.get("page") === "2"
				? { sections: [section(1, [3, 4], 3)] }
				: { sections: [section(1, [5])] };
		});

		const sections = await getVenueMenuSections("token", 1);

		expect(sections.map((s) => s.items.map((i) => i.untappd_id))).toEqual([
			[1, 2, 3, 4, 5],
			[9],
		]);
		const paged = calls
			.slice(1)
			.map(({ body }) => Object.fromEntries(new URLSearchParams(body)));
		expect(paged).toEqual([
			expect.objectContaining({ section_id: "1", page: "2" }),
			expect.objectContaining({ section_id: "1", page: "3" }),
		]);
	});

	it("rejects with 403 for venues without published menus", async () => {
		mockFetch(() => ({ response_code: 403 }));
		await expect(getVenueMenuSections("token", 1026)).rejects.toMatchObject({
			status: 403,
		});
	});
});

describe("login", () => {
	it("sends the Android app's login fields", async () => {
		const calls = mockFetch(() => ({ access_token: "t", username: "jacob" }));

		await login("Jacob", "hunter2");

		const body = Object.fromEntries(new URLSearchParams(calls[0].body));
		expect(calls[0].url.pathname).toBe("/v4/xauth");
		expect(body).toEqual({
			user_name: "Jacob",
			user_password: "hunter2",
			device_udid: getDeviceUdid("Jacob"),
			device_name: "Pixel 8",
			device_version: "15",
			device_platform: "Android",
			app_version: "5.0.0",
			multi_account: "true",
		});
	});
});

describe("getDeviceUdid", () => {
	it("looks like an Android ID and is stable per user", () => {
		expect(getDeviceUdid("Jacob")).toMatch(/^[0-9a-f]{16}$/);
		expect(getDeviceUdid(" jacob ")).toBe(getDeviceUdid("Jacob"));
		expect(getDeviceUdid("someone-else")).not.toBe(getDeviceUdid("Jacob"));
	});
});

describe("getTopRatedBeers", () => {
	it("only asks for beers still in production", async () => {
		const calls = mockFetch(() => ({ beers: { items: [] } }));
		await getTopRatedBeers("token", 1246);
		expect(Object.fromEntries(calls[0].url.searchParams)).toMatchObject({
			type_id: "1246",
			in_production: "1",
		});
	});
});
