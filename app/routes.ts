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
  ...prefix("api", [
    route("related/:styleId", "./routes/untappd/related.ts"),
    route("list/:listId", "./routes/untappd/list.ts"),
    route("venues/:searchQuery", "./routes/untappd/venues.ts"),
    route("venue/:venueId", "./routes/untappd/venue.ts"),
    route("beers/:searchQuery", "./routes/untappd/beers.ts"),
    route("beer/:beerId", "./routes/untappd/beer.ts"),
  ]),
] satisfies RouteConfig;
