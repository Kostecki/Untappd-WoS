import type { LoaderFunction } from "react-router";
import type { Route } from "./+types/home";
import { userRequire } from "~/auth/user.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Wheel of Styles" }];
}

export const loader: LoaderFunction = async ({ request }) => {
  await userRequire(request);
};

export default function Home() {
  return "home";
}
