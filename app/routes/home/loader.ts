import type { SessionUser } from "~/auth/auth.server";
import {
	getBadge,
	getListView,
	getStylesNotHad as fetchStylesNotHad,
	getUserLists as fetchUserLists,
} from "~/untappd/api.server";
import { cached } from "~/untappd/cache.server";
import { withFallback } from "~/untappd/client.server";

const checkInsPerLevel = 5;

// Reloads within this window reuse the previous Untappd responses
const cacheTtlMs = 60 * 1000;

const cachedForUser = <T>(user: SessionUser, key: string, load: () => Promise<T>) =>
	cached(`${user.id}:${key}`, cacheTtlMs, load);

type StyleEntry = StylesInfo["styles"][number];

const getStylesNotHad = async (user: SessionUser): Promise<StyleEntry[]> => {
	const items = await withFallback(
		cachedForUser(user, "styles-not-had", () =>
			fetchStylesNotHad(user.accessToken),
		),
		[],
	);

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

	const { wosBadgeId } = user;
	const badge = await withFallback(
		cachedForUser(user, `badge:${wosBadgeId}`, () =>
			getBadge(user.accessToken, wosBadgeId),
		),
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
	withFallback(
		cachedForUser(user, "lists", () => fetchUserLists(user.accessToken)),
		[],
	);

/** The selected stock list with the style ids of all its beers */
const getStockList = async (
	user: SessionUser,
	listId: string | null,
): Promise<StockListDetails | null> => {
	if (!listId) {
		return null;
	}

	const list = await withFallback(
		cachedForUser(user, `list:${listId}`, () =>
			getListView(user.accessToken, listId),
		),
		null,
	);
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
