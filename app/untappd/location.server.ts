// Used when the browser doesn't share a location
const fallbackLocation = { lat: 55.6761, lng: 12.5683 }; // Copenhagen
const defaultRadiusKm = 10;
const maxRadiusKm = 50;

/** Reads lat/lng/radius from the query string, with a fallback location */
const getLocationParams = (request: Request) => {
	const searchParams = new URL(request.url).searchParams;
	const lat = Number(searchParams.get("lat"));
	const lng = Number(searchParams.get("lng"));
	const radius = Number(searchParams.get("radius"));
	const hasLocation =
		searchParams.has("lat") &&
		searchParams.has("lng") &&
		Number.isFinite(lat) &&
		Number.isFinite(lng);

	return {
		...(hasLocation ? { lat, lng } : fallbackLocation),
		radius: radius > 0 && radius <= maxRadiusKm ? radius : defaultRadiusKm,
	};
};

export { getLocationParams };
