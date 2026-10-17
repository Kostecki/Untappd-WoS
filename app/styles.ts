type StyleEntry = StylesInfo["styles"][number];
type BeerStyle = Pick<Beer, "beer_style" | "beer_style_id">;

/** The user's style for a beer: by style id (stable), else by style name */
const findStyle = (
	styles: StyleEntry[],
	{ beer_style, beer_style_id }: BeerStyle,
) =>
	beer_style_id
		? styles.find((style) => style.styleId === beer_style_id)
		: styles.find((style) => style.styleName === beer_style);

/** Whether a beer's style is on the stock list (same source as the styles table) */
const isStyleOnList = (
	stockList: StockListDetails | undefined,
	{ beer_style, beer_style_id }: BeerStyle,
) =>
	Boolean(
		beer_style_id
			? stockList?.styles.includes(beer_style_id)
			: stockList?.listItems.some(
					(item) => item.beer.beer_style === beer_style,
				),
	);

/**
 * The stock list's name when a beer isn't on the user's lists itself but its
 * style is covered by a beer on the stock list; otherwise undefined
 */
const getStyleCoveredBy = (
	stockList: StockListDetails | undefined,
	item: { beer: BeerStyle; on_list?: boolean },
) =>
	stockList && !item.on_list && isStyleOnList(stockList, item.beer)
		? stockList.listName
		: undefined;

/**
 * A filter for beers in styles the user hasn't had yet. Styles are matched
 * by id, else by name; beers whose style can't be matched are left out.
 */
const createNewStyleFilter = (styles: StyleEntry[]) => {
	const styleIdsByName = new Map(
		styles.map((style) => [
			style.styleName.trim().toLowerCase(),
			style.styleId,
		]),
	);
	const hadStyleIds = new Set(
		styles
			.filter((style) => style.styleId && style.had)
			.map((style) => style.styleId),
	);

	return ({ beer_style, beer_style_id }: BeerStyle) => {
		const styleId =
			typeof beer_style_id === "number" && beer_style_id > 0
				? beer_style_id
				: styleIdsByName.get(beer_style?.trim().toLowerCase() ?? "");

		// No style ("other") or one we can't match isn't a new style
		if (!styleId) return false;

		return !hadStyleIds.has(styleId);
	};
};

export { createNewStyleFilter, findStyle, getStyleCoveredBy, isStyleOnList };
