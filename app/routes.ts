import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home/index.tsx"),
  route("login", "./routes/auth/login.tsx"),
  route("logout", "./routes/auth/logout.ts"),
  ...prefix("api", [route("related/:styleId", "./routes/untappd/related.ts")]),
] satisfies RouteConfig;
