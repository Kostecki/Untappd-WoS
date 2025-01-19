import { API_BASE_URL } from "~/routes/untappd/config";

const wosTypeId = 5115;

const getUserSpecificWoSBadgeId = async (offset = 0, accessToken: string) => {
  const url = `${API_BASE_URL}/user/badges?offset=${offset}&access_token=${accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get user badges", response);
    return null;
  }

  const data = await response.json();
  const badges = data.response.items;
  const userBadge = badges.find((e: Badge) => e.badge_id === wosTypeId);

  if (userBadge) {
    return userBadge.user_badge_id;
  } else {
    if (badges.length === 0) {
      console.error("Failed to user badge id");
      return null;
    }

    return getUserSpecificWoSBadgeId(offset + 50, accessToken);
  }
};

export { getUserSpecificWoSBadgeId };
