import { describe, expect, it, vi } from "vitest";
import type { SessionUser } from "~/auth/auth.server";
import { getBadge, getStylesNotHad } from "~/untappd/api.server";
import { getStylesInfo } from "./loader";

vi.mock("~/untappd/api.server", () => ({
	getBadge: vi.fn(),
	getStylesNotHad: vi.fn(),
	getUserLists: vi.fn(),
	getListView: vi.fn(),
}));

// The loader caches per user id, so each test uses its own user
let nextUserId = 1;
const user = (overrides: Partial<SessionUser> = {}) =>
	({
		id: nextUserId++,
		accessToken: "token",
		wosBadgeId: 42,
		...overrides,
	}) as SessionUser;

const badge = (had: string[]) =>
	({
		special_status_list: {
			items: [
				{
					items: had.map((name, i) => ({ item_id: 100 + i, item_name: name })),
				},
			],
		},
	}) as unknown as Badge;

describe("getStylesInfo", () => {
	it("combines styles had and not had, with level progress", async () => {
		vi.mocked(getStylesNotHad).mockResolvedValue([
			{ style_id: 1, style_name: "Kölsch - Wiess" },
			{ style_id: 2, style_name: "Mild - Ruby" },
		]);
		vi.mocked(getBadge).mockResolvedValue(
			badge(["IPA", "Stout", "Lager", "Pilsner", "Porter", "Sour", "Gose"]),
		);

		const info = await getStylesInfo(user());

		expect(info.styles).toHaveLength(9);
		expect(info.styles.filter((s) => s.had)).toHaveLength(7);
		expect(info.stats).toEqual({
			hadCount: 7,
			notHadCount: 2,
			totalCount: 9,
			level: {
				currentLevel: 1,
				progressToNext: 2,
				checkInsPerLevel: 5,
				maxLevel: 1,
			},
		});
	});

	it("treats every style as not had without a Wheel of Styles badge", async () => {
		vi.mocked(getStylesNotHad).mockResolvedValue([
			{ style_id: 1, style_name: "IPA" },
		]);

		const info = await getStylesInfo(user({ wosBadgeId: null }));

		expect(getBadge).not.toHaveBeenCalled();
		expect(info.stats.hadCount).toBe(0);
	});

	it("still renders when Untappd fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(getStylesNotHad).mockRejectedValue(new Error("Untappd is down"));
		vi.mocked(getBadge).mockResolvedValue(badge(["IPA"]));

		const info = await getStylesInfo(user());

		expect(info.stats).toMatchObject({ hadCount: 1, notHadCount: 0 });
	});
});
