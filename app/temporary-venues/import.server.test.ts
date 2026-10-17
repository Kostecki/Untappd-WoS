import ExcelJS from "exceljs";
import { describe, expect, it, vi } from "vitest";
import { UntappdError } from "~/untappd/client.server";
import type { BeerSummary } from "./beer-lookup.server";
import { useTempDataDir } from "./test/data-dir";

vi.mock("~/untappd/api.server", () => ({ getBeerSummary: vi.fn() }));

// What Untappd knows about each bid; unknown bids fail like the real API
const untappdBeers: Record<number, BeerSummary> = {
	1: {
		name: "Fear the Feathers",
		brewery: "Fermenterarna",
		style: "IPA - New England / Hazy",
		abv: 6.5,
		country: "Sweden",
		rating: 3.93,
	},
	2: {
		name: "Leeve Waldi",
		brewery: "Ale Mania",
		style: "Kölsch - Wiess",
		abv: 4.8,
		country: "Germany",
		rating: 3.6,
	},
};
async function summary(_token: string, bid: number): Promise<BeerSummary> {
	const beer = untappdBeers[bid];
	if (!beer) throw new UntappdError("invalid_param", 500, `/beer/info/${bid}`);
	return beer;
}

const styleIds = new Map([
	["ipa - new england / hazy", 280],
	["kölsch - wiess", 1240],
	["porter - baltic", 6],
]);

const setup = async () => {
	const api = await import("~/untappd/api.server");
	const getBeerSummary = vi
		.mocked(api.getBeerSummary)
		.mockImplementation(summary);
	const { importFile } = await import("./import.server");
	const upload = (name: string, content: string | ArrayBuffer) =>
		importFile(new File([content], name), styleIds, "token");
	return { getBeerSummary, upload };
};

const okResult = <T extends { ok: boolean }>(result: T) => {
	if (!result.ok) throw new Error(`Expected ok, got ${JSON.stringify(result)}`);
	return result as Extract<T, { ok: true }>;
};

describe("importing temporary venue beers", () => {
	useTempDataDir();

	it("fills in everything from Untappd when only bids are given", async () => {
		const { upload } = await setup();
		const result = okResult(await upload("v.csv", "menu,bid\nTaps,1\nTaps,2"));

		expect(result.lookedUp).toBe(2);
		expect(result.unknownStyles).toEqual([]);
		expect(result.menus).toEqual([
			{
				id: 1,
				name: "Taps",
				items: [
					{
						bid: 1,
						name: "Fear the Feathers",
						brewery: "Fermenterarna",
						style: "IPA - New England / Hazy",
						styleId: 280,
						abv: 6.5,
						country: "Sweden",
						rating: 3.93,
					},
					{
						bid: 2,
						name: "Leeve Waldi",
						brewery: "Ale Mania",
						style: "Kölsch - Wiess",
						styleId: 1240,
						abv: 4.8,
						country: "Germany",
						rating: 3.6,
					},
				],
			},
		]);
	});

	it("lets values in the file win over Untappd's", async () => {
		const { upload } = await setup();
		const result = okResult(
			await upload(
				"v.csv",
				"bid,name,style,abv\n1,My name,Porter - Baltic,7.5",
			),
		);

		expect(result.menus[0].items[0]).toMatchObject({
			name: "My name",
			brewery: "Fermenterarna",
			style: "Porter - Baltic",
			styleId: 6,
		});
	});

	it("doesn't look up beers that have a name, brewery and style", async () => {
		const { upload, getBeerSummary } = await setup();
		const result = okResult(
			await upload("v.csv", "bid,name,brewery,style\n3,A,B,Porter - Baltic"),
		);

		expect(result.lookedUp).toBe(0);
		expect(getBeerSummary).not.toHaveBeenCalled();
	});

	it("keeps unknown style names and reports them", async () => {
		const { upload } = await setup();
		const result = okResult(
			await upload("v.csv", "bid,name,brewery,style\n3,A,B,Gluten-Free"),
		);

		expect(result.unknownStyles).toEqual(["Gluten-Free"]);
		expect(result.menus[0].items[0].styleId).toBeNull();
	});

	it("groups rows into menus, defaulting to one, and drops duplicates", async () => {
		const { upload } = await setup();
		const result = okResult(
			await upload("v.csv", "menu,bid\n,1\nBottles,2\nBottles,2"),
		);

		expect(result.menus.map((m) => [m.name, m.items.length])).toEqual([
			["All beers", 1],
			["Bottles", 1],
		]);
	});

	it("rejects invalid and unknown bids with their line numbers", async () => {
		const { upload } = await setup();

		expect(await upload("v.csv", "bid\n1\nabc\n\n")).toEqual({
			ok: false,
			errors: ['Line 3: bid "abc" is not an Untappd beer id.'],
		});
		expect(await upload("v.csv", "bid\n1\n999")).toEqual({
			ok: false,
			errors: ["Line 3: Untappd has no beer with bid 999."],
		});
	});

	it("rejects files without rows or a bid column", async () => {
		const { upload } = await setup();

		expect(await upload("v.csv", "")).toMatchObject({ ok: false });
		expect(await upload("v.csv", "name\nBeer")).toEqual({
			ok: false,
			errors: ["Missing column: bid."],
		});
	});

	it("caps the number of lookups per upload", async () => {
		const { upload, getBeerSummary } = await setup();
		const bids = Array.from({ length: 251 }, (_, i) => i + 1000).join("\n");

		const result = await upload("v.csv", `bid\n${bids}`);

		expect(result.ok).toBe(false);
		expect(!result.ok && result.errors[0]).toContain("251 beers");
		expect(getBeerSummary).not.toHaveBeenCalled();
	});

	it("reuses cached lookups on the next upload", async () => {
		const { upload, getBeerSummary } = await setup();
		await upload("v.csv", "bid\n1\n2");
		getBeerSummary.mockClear();

		const result = okResult(await upload("v.csv", "bid\n1\n2"));

		expect(result.menus[0].items).toHaveLength(2);
		expect(getBeerSummary).not.toHaveBeenCalled();
	});

	it("reads Excel files like CSVs", async () => {
		const { upload } = await setup();
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet("Beers");
		sheet.addRow(["menu", "bid", "name", "brewery", "style", "abv"]);
		sheet.addRow(["Taps", 3, "A", "B", "Porter - Baltic", 6.5]);
		const file = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;

		const result = okResult(await upload("v.xlsx", file));

		expect(result.menus[0].items[0]).toMatchObject({
			bid: 3,
			name: "A",
			styleId: 6,
			abv: 6.5,
		});
	});

	it("reports files that aren't valid Excel", async () => {
		const { upload } = await setup();
		vi.spyOn(console, "error").mockImplementation(() => {});

		expect(await upload("v.xlsx", "not a spreadsheet")).toEqual({
			ok: false,
			errors: ["Couldn't read the file as Excel."],
		});
	});
});
