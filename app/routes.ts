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
	route("settings/stock-list", "./routes/settings/stock-list.ts"),
	route("admin", "./routes/admin/index.tsx"),
	route("admin/template.xlsx", "./routes/admin/template.ts"),
	...prefix("api", [
		route("style/:styleId/beers", "./routes/untappd/style-beers.ts"),
		route("venues/:searchQuery", "./routes/untappd/venues.ts"),
		route("temporary-venues", "./routes/untappd/temporary-venues.ts"),
		route("venue/:venueId", "./routes/untappd/venue.ts"),
		route("beers/:searchQuery", "./routes/untappd/beers.ts"),
		route("beer/:beerId", "./routes/untappd/beer.ts"),
		route("barcode/:barcode", "./routes/untappd/barcode.ts"),
	]),
] satisfies RouteConfig;
