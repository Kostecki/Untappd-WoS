import { describe, expect, it } from "vitest";
import {
	createNewStyleFilter,
	findStyle,
	getListMatch,
	isStyleOnList,
} from "./styles";

const styles = [
	{ styleId: 1, styleName: "IPA - American", had: true },
	{ styleId: 2, styleName: "Kölsch - Wiess", had: false },
	{ styleId: 3, styleName: "Stout - Irish Dry", had: false },
];

const beer = (beer_style: string, beer_style_id?: number) => ({
	beer_style,
	beer_style_id,
});

describe("findStyle", () => {
	it("matches by style id", () => {
		expect(findStyle(styles, beer("Renamed style", 2))?.styleName).toBe(
			"Kölsch - Wiess",
		);
	});

	it("falls back to the style name without an id", () => {
		expect(findStyle(styles, beer("Stout - Irish Dry"))?.styleId).toBe(3);
	});

	it("returns undefined for an unknown style", () => {
		expect(findStyle(styles, beer("Unknown"))).toBeUndefined();
	});
});

describe("isStyleOnList", () => {
	const stockList: StockListDetails = {
		listId: "1",
		listName: "På lager",
		styles: [2],
		listItems: [
			{
				beer: { beer_style: "Stout - Irish Dry" } as Beer,
				brewery: {} as Brewery,
			},
		],
	};

	it("uses the list's style ids when the beer has one", () => {
		expect(isStyleOnList(stockList, beer("x", 2))).toBe(true);
		expect(isStyleOnList(stockList, beer("Stout - Irish Dry", 3))).toBe(false);
	});

	it("falls back to style names of the list's beers", () => {
		expect(isStyleOnList(stockList, beer("Stout - Irish Dry"))).toBe(true);
	});

	it("is false without a stock list", () => {
		expect(isStyleOnList(undefined, beer("x", 2))).toBe(false);
	});
});

describe("createNewStyleFilter", () => {
	const isNewStyle = createNewStyleFilter(styles);

	it("keeps beers in styles not had yet", () => {
		expect(isNewStyle(beer("Kölsch - Wiess", 2))).toBe(true);
	});

	it("drops beers in styles already had", () => {
		expect(isNewStyle(beer("IPA - American", 1))).toBe(false);
	});

	it("matches by name, ignoring case and spacing, when there's no id", () => {
		expect(isNewStyle(beer("  stout - irish dry "))).toBe(true);
		expect(isNewStyle(beer("ipa - american"))).toBe(false);
	});

	it("drops beers without a matchable style", () => {
		expect(isNewStyle(beer("Not a style"))).toBe(false);
		expect(isNewStyle(beer("", 0))).toBe(false);
	});
});

describe("getListMatch", () => {
	const stockList: StockListDetails = {
		listId: "1",
		listName: "På lager",
		styles: [2],
		listItems: [
			{
				beer: { bid: 10, beer_style: "Kölsch - Wiess" } as Beer,
				brewery: {} as Brewery,
			},
		],
	};
	const menuBeer = (bid: number, style: string, styleId?: number) => ({
		bid,
		...beer(style, styleId),
	});

	it("is 'beer' when the same beer is on the stock list", () => {
		expect(getListMatch(stockList, menuBeer(10, "Kölsch - Wiess", 2))).toBe(
			"beer",
		);
	});

	it("is 'style' when another beer on the stock list has the style", () => {
		expect(getListMatch(stockList, menuBeer(11, "Kölsch - Wiess", 2))).toBe(
			"style",
		);
		expect(getListMatch(stockList, menuBeer(11, "Kölsch - Wiess"))).toBe(
			"style",
		);
	});

	it("ignores Untappd's on_list (any list, e.g. a wish list)", () => {
		const onWishList = { ...menuBeer(12, "Mild - Ruby", 3), on_list: true };
		expect(getListMatch(stockList, onWishList)).toBeUndefined();
	});

	it("is undefined without a stock list", () => {
		expect(
			getListMatch(undefined, menuBeer(10, "Kölsch - Wiess", 2)),
		).toBeUndefined();
	});
});
