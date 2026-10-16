import { type LoaderFunction, type MetaFunction, redirect } from "react-router";
import { dataWithError } from "remix-toast";
import { authenticator } from "~/auth/auth.server";
import { commitSession, getSession } from "~/auth/session.server";
import { getSessionUser, setSessionUser } from "~/auth/user.server";
import Login from "~/components/Auth/login";
import type { Route } from "./+types/login";

export const meta: MetaFunction = () => {
	return [{ title: "Log in | Wheel of Styles" }];
};

export const loader: LoaderFunction = async ({ request }) => {
	const user = await getSessionUser(request);
	if (user) {
		throw redirect("/");
	}
};

export async function action({ request }: Route.ActionArgs) {
	try {
		const user = await authenticator.authenticate("form", request);

		const session = await getSession(request.headers.get("cookie"));
		setSessionUser(session, user);

		throw redirect("/", {
			headers: { "Set-Cookie": await commitSession(session) },
		});
	} catch (error) {
		if (error instanceof Error) {
			const errorMessage = error.message;
			console.error("Login error:", errorMessage);

			if (errorMessage === "INVALID_PASSWORD") {
				return dataWithError(null, "Invalid username or password.");
			} else if (errorMessage === "MULTIPLE_ACCOUNTS") {
				return dataWithError(
					null,
					"This email is linked to several Untappd accounts. Log in with your username instead.",
				);
			} else {
				return dataWithError(
					"Error",
					errorMessage || "Something went wrong. Please try again.",
				);
			}
		}

		throw error;
	}
}

export default function LoginView() {
	return <Login />;
}
