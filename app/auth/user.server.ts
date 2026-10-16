import { redirect, type Session } from "react-router";
import type { SessionUser } from "./auth.server";
import { decrypt, encrypt } from "./crypto.server";
import { getSession } from "./session.server";

// The user (incl. the Untappd access token) is stored encrypted, not just
// signed, so the cookie value can't be read if it leaks
const sessionKey = "user";

const setSessionUser = (session: Session, user: SessionUser) => {
	session.set(sessionKey, encrypt(user));
};

/** The logged in user, or null (also for sessions from before encryption) */
const getSessionUser = async (
	request: Request,
): Promise<SessionUser | null> => {
	const session = await getSession(request.headers.get("cookie"));
	return decrypt<SessionUser>(session.get(sessionKey));
};

/** The logged in user; redirects to the login page otherwise */
const requireUser = async (request: Request): Promise<SessionUser> => {
	const user = await getSessionUser(request);

	if (!user) {
		throw redirect("/login");
	}

	return user;
};

export { getSessionUser, requireUser, setSessionUser };
