import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

export type SessionUser = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  userAvatar: string;
  accessToken: string;
};

export const authenticator = new Authenticator<SessionUser>();

const API_BASE_URL = process.env.UNTAPPD_API_URL;
const DEVICE_UDID = process.env.UNTAPPD_DEVICE_UDID;
const CLIENT_ID = process.env.UNTAPPD_CLIENT_ID;
const CLIENT_SECRET = process.env.UNTAPPD_CLIENT_SECRET;
invariant(API_BASE_URL, "API_BASE_URL must be set in .env");
invariant(DEVICE_UDID, "DEVICE_UDID must be set in .env");
invariant(CLIENT_ID, "CLIENT_ID must be set in .env");
invariant(CLIENT_SECRET, "CLIENT_SECRET must be set in .env");

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = String(form.get("username"));
    const password = String(form.get("password"));

    const formData = new FormData();
    formData.append("user_name", username);
    formData.append("user_password", password);
    formData.append("device_udid", DEVICE_UDID);

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

    return {
      id,
      userName: user_name,
      firstName: first_name,
      lastName: last_name,
      userAvatar: user_avatar_hd,
      accessToken,
    };
  }),
  "form"
);
