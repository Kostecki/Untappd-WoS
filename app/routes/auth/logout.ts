import { destroySession, getSession } from "~/auth/session.server";

import type { Route } from "./+types/logout";
import { redirect } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("cookie"));

  const headers = {
    "Set-Cookie": await destroySession(session),
  };

  return redirect("/login", { headers });
};
