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
  email: string;
  profileUrl: string;
  wosBadgeId: number;
  accessToken: string;
  isAdmin: boolean;
};

export const authenticator = new Authenticator<SessionUser>();

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
invariant(ADMIN_USER_ID, "ADMIN_USER_ID must be set in .env");

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const formUsername = String(form.get("username"));
    const formPassword = String(form.get("password"));

    const formData = new FormData();
    formData.append("user_name", formUsername);
    formData.append("user_password", formPassword);
    formData.append("device_udid", String(DEVICE_UDID));

    const authSearchParams = new URLSearchParams({
      client_id: String(CLIENT_ID),
      client_secret: String(CLIENT_SECRET),
    });
    const url = `${API_BASE_URL}/xauth?${authSearchParams}`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to authenticate", response);
    }

    const data = await response.json();
    const { access_token, username } = data.response;

    const userSearchParams = new URLSearchParams({
      compact: "enhanced",
      access_token,
    });
    const userResponse = await fetch(
      `${API_BASE_URL}/user/info/${username}?${userSearchParams}`
    );

    if (!userResponse.ok) {
      console.error("Failed to get user info", userResponse);
    }

    const userData = await userResponse.json();
    const {
      id,
      user_name,
      first_name,
      last_name,
      user_avatar_hd,
      untappd_url,
      settings: { email_address },
    } = userData.response.user;

    const userSpecificBadgeId = await getUserSpecificWoSBadgeId(
      0,
      access_token
    );

    return {
      id,
      userName: user_name,
      firstName: first_name,
      lastName: last_name,
      email: email_address,
      profileUrl: untappd_url,
      userAvatarURL: user_avatar_hd,
      wosBadgeId: userSpecificBadgeId,
      accessToken: access_token,
      isAdmin: id === Number(ADMIN_USER_ID),
    };
  }),
  "form"
);
