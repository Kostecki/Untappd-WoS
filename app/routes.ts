import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home/index.tsx"),
  route("login", "./routes/auth/login.tsx"),
  ...prefix("api", [
    route("relatedBeers/:styleId", "./routes/untappd/relatedBeers.ts"),
  ]),
] satisfies RouteConfig;
