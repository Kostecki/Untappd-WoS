import {
  data,
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "react-router";

import { authenticator } from "~/auth/auth.server";
import { commitSession, getSession } from "~/auth/session.server";
import { userSessionGet } from "~/auth/user.server";

import Login from "~/components/auth/login";

import type { Route } from "./+types/login";

export const meta: MetaFunction = () => {
  return [{ title: "Log in | Wheel of Styles" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await userSessionGet(request);
  if (user) {
    throw redirect("/");
  }
};

export async function action({ request }: Route.ActionArgs) {
  const user = await authenticator.authenticate("form", request);

  const session = await getSession(request.headers.get("cookie"));
  session.set("user", user);

  throw redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function LoginView() {
  return <Login />;
}
