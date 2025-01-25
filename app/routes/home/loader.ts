import type { SessionUser } from "~/auth/auth.server";
import { API_BASE_URL } from "../untappd/config";

const checkInsPerLevel = 5;

const getStylesNotHad = async (user: SessionUser) => {
  const url = `${API_BASE_URL}/badges/styles_not_had?access_token=${user.accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get styles not had", response);
    return [];
  }

  const data = await response.json();

  const outputData = data.response.items.map(
    (item: { style_id: number; style_name: string }) => {
      return {
        styleId: item.style_id,
        styleName: item.style_name,
        had: false,
      };
    }
  );

  return outputData;
};

const getStylesHad = async (user: SessionUser) => {
  const url = `${API_BASE_URL}/badges/view/${user.wosBadgeId}?access_token=${user.accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get styles had", response);
    return [];
  }

  const data = (await response.json()) as {
    response: {
      badge: Badge;
    };
  };
  const { special_status_list } = data.response.badge;

  const outputData = special_status_list.items[0].items.map((item) => {
    return {
      styleId: item.item_id,
      styleName: item.item_name,
      had: true,
    };
  });

  return outputData;
};

const getStylesInfo = async (user: SessionUser) => {
  const stylesNotHad = await getStylesNotHad(user);
  const stylesHad = await getStylesHad(user);

  const hadLength = stylesHad.length;
  const notHadLength = stylesNotHad.length;
  const totalLength = hadLength + notHadLength;

  const stats = {
    hadCount: hadLength,
    notHadCount: notHadLength,
    totalCount: totalLength,
    level: {
      currentLevel: Math.floor(hadLength / checkInsPerLevel),
      progressToNext: hadLength % checkInsPerLevel,
      checkInsPerLevel,
      maxLevel: Math.floor(totalLength / checkInsPerLevel),
    },
  };

  const payload = {
    styles: [...stylesNotHad, ...stylesHad],
    stats,
  };

  return payload;
};

const getUserLists = async (user: SessionUser): Promise<UserLists[]> => {
  const url = `${API_BASE_URL}/custom_lists/userlists?access_token=${user.accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("Failed to get user lists", response);
    return [];
  }

  const data = await response.json();

  return data.response.items;
};

export { getStylesInfo, getUserLists };
