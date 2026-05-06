import {
	index,
	prefix,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	index("routes/home/index.tsx"),
	route("login", "./routes/auth/login.tsx"),
	route("logout", "./routes/auth/logout.ts"),
	...prefix("api", [
		route("related/:styleId", "./routes/untappd/related.ts"),
		route("list/:listId", "./routes/untappd/list.ts"),
		route("mbcc/venues", "./routes/untappd/mbcc-venues.ts"),
		route("mbcc/venue", "./routes/untappd/mbcc-venue.ts"),
		route("venues/:searchQuery", "./routes/untappd/venues.ts"),
		route("venue/:venueId", "./routes/untappd/venue.ts"),
		route("beers/:searchQuery", "./routes/untappd/beers.ts"),
		route("beer/:beerId", "./routes/untappd/beer.ts"),
		route("barcode/:barcode", "./routes/untappd/barcode.ts"),
	]),
] satisfies RouteConfig;
