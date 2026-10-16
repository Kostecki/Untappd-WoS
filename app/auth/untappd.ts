import { getUserBadges } from "~/untappd/api.server";

// Badge id of "Wheel of Styles"
const wosBadgeId = 5115;
const pageSize = 50;

/** Pages through the user's badges to find their own Wheel of Styles badge instance */
const getUserSpecificWoSBadgeId = async (
	accessToken: string,
): Promise<number | null> => {
	for (let offset = 0; ; offset += pageSize) {
		const { items } = await getUserBadges(accessToken, offset);
		const userBadge = items.find((badge) => badge.badge_id === wosBadgeId);

		if (userBadge) {
			return userBadge.user_badge_id;
		}

		if (items.length < pageSize) {
			return null;
		}
	}
};

export { getUserSpecificWoSBadgeId };
