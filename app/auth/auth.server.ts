import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { getUserInfo, login } from "~/untappd/api.server";
import { UntappdError } from "~/untappd/client.server";
import { getUserSpecificWoSBadgeId } from "./untappd";

export type SessionUser = {
	id: number;
	userName: string;
	firstName: string;
	lastName: string;
	userAvatarURL: string;
	email: string;
	profileUrl: string;
	wosBadgeId: number | null;
	accessToken: string;
	isAdmin: boolean;
};

/** The session user as sent to the browser, without the access token */
export type PublicUser = Omit<SessionUser, "accessToken">;

export const authenticator = new Authenticator<SessionUser>();

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
invariant(ADMIN_USER_ID, "ADMIN_USER_ID must be set in .env");

authenticator.use(
	new FormStrategy(async ({ form }) => {
		const formUsername = String(form.get("username"));
		const formPassword = String(form.get("password"));

		let session: { access_token: string; username: string };
		try {
			session = await login(formUsername, formPassword);
		} catch (error) {
			if (error instanceof UntappdError && error.status < 500) {
				throw new Error("INVALID_PASSWORD");
			}
			throw error;
		}
		const { access_token, username } = session;

		const [user, userSpecificBadgeId] = await Promise.all([
			getUserInfo(access_token, username),
			getUserSpecificWoSBadgeId(access_token),
		]);

		const {
			id,
			user_name,
			first_name,
			last_name,
			user_avatar_hd,
			untappd_url,
			settings: { email_address },
		} = user;

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
	"form",
);
