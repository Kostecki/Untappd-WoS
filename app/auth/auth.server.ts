import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import {
  API_BASE_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  DEVICE_UDID,
} from "~/routes/untappd/config";
import { getUserSpecificWoSBadgeId } from "./untappd";

export type SessionUser = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  userAvatarURL: string;
  wosBadgeId: number;
  accessToken: string;
  isAdmin: boolean;
};

export const authenticator = new Authenticator<SessionUser>();

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
invariant(ADMIN_USER_ID, "ADMIN_USER_ID must be set in .env");

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = String(form.get("username"));
    const password = String(form.get("password"));

    const formData = new FormData();
    formData.append("user_name", username);
    formData.append("user_password", password);
    formData.append("device_udid", String(DEVICE_UDID));

    const url = `${API_BASE_URL}/xauth?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to authenticate", response);
    }

    const data = await response.json();
    const accessToken = data.response.access_token;

    const userResponse = await fetch(
      `${API_BASE_URL}/user/info?access_token=${accessToken}`
    );

    if (!userResponse.ok) {
      console.error("Failed to get user info", userResponse);
    }

    const userData = await userResponse.json();
    const { id, user_name, first_name, last_name, user_avatar_hd } =
      userData.response.user;

    const userSpecificBadgeId = await getUserSpecificWoSBadgeId(0, accessToken);

    return {
      id,
      userName: user_name,
      firstName: first_name,
      lastName: last_name,
      userAvatarURL: user_avatar_hd,
      wosBadgeId: userSpecificBadgeId,
      accessToken,
      isAdmin: id === Number(ADMIN_USER_ID),
    };
  }),
  "form"
);
