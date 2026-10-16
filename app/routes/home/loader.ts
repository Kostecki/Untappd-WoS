import type { SessionUser } from "~/auth/auth.server";
import {
	getBadge,
	getListView,
	getStylesNotHad as fetchStylesNotHad,
	getUserLists as fetchUserLists,
} from "~/untappd/api.server";
import { withFallback } from "~/untappd/client.server";

const checkInsPerLevel = 5;

type StyleEntry = StylesInfo["styles"][number];

const getStylesNotHad = async (user: SessionUser): Promise<StyleEntry[]> => {
	const items = await withFallback(fetchStylesNotHad(user.accessToken), []);

	return items.map((item) => ({
		styleId: item.style_id,
		styleName: item.style_name,
		had: false,
	}));
};

const getStylesHad = async (user: SessionUser): Promise<StyleEntry[]> => {
	if (!user.wosBadgeId) {
		// User hasn't unlocked Wheel of Styles yet, so nothing is had
		return [];
	}

	const badge = await withFallback(
		getBadge(user.accessToken, user.wosBadgeId),
		null,
	);
	const items = badge?.special_status_list.items[0]?.items ?? [];

	return items.map((item) => ({
		styleId: item.item_id,
		styleName: item.item_name,
		had: true,
	}));
};

const getStylesInfo = async (user: SessionUser): Promise<StylesInfo> => {
	const [stylesNotHad, stylesHad] = await Promise.all([
		getStylesNotHad(user),
		getStylesHad(user),
	]);

	const hadCount = stylesHad.length;
	const notHadCount = stylesNotHad.length;
	const totalCount = hadCount + notHadCount;

	return {
		styles: [...stylesNotHad, ...stylesHad],
		stats: {
			hadCount,
			notHadCount,
			totalCount,
			level: {
				currentLevel: Math.floor(hadCount / checkInsPerLevel),
				progressToNext: hadCount % checkInsPerLevel,
				checkInsPerLevel,
				maxLevel: Math.floor(totalCount / checkInsPerLevel),
			},
		},
	};
};

const getUserLists = (user: SessionUser): Promise<UserLists[]> =>
	withFallback(fetchUserLists(user.accessToken), []);

/** The selected stock list with the style ids of all its beers */
const getStockList = async (
	user: SessionUser,
	listId: string | null,
): Promise<StockListDetails | null> => {
	if (!listId) {
		return null;
	}

	const list = await withFallback(getListView(user.accessToken, listId), null);
	if (!list) {
		return null;
	}

	return {
		listId,
		listName: list.list.list_name,
		listItems: list.items,
		styles: list.styles.items.map((style) => style.type_id),
	};
};

export { getStockList, getStylesInfo, getUserLists };
