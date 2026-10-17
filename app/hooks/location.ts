interface Coordinates {
	lat: number;
	lng: number;
}

// Shared across components so the browser is only asked once per page load
let cachedLocation: Promise<Coordinates | null> | undefined;

/**
 * Resolves the browser location, or null when it's unavailable or denied
 * (the server then falls back to a default location).
 */
const getBrowserLocation = (): Promise<Coordinates | null> => {
	cachedLocation ??= new Promise((resolve) => {
		if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
			resolve(null);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
			() => resolve(null),
			{ maximumAge: 5 * 60 * 1000, timeout: 10_000 },
		);
	});

	return cachedLocation;
};

/** Query string for the nearby API routes */
const getLocationQuery = async () => {
	const location = await getBrowserLocation();
	return location
		? `?${new URLSearchParams({ lat: String(location.lat), lng: String(location.lng) })}`
		: "";
};

export { getBrowserLocation, getLocationQuery };
