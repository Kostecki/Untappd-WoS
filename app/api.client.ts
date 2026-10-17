/**
 * `fetch` for the app's own /api routes. When the session is gone or the
 * Untappd token was rejected, the server redirects to the login page; fetch
 * follows that silently, so send the whole page there instead.
 */
const apiFetch = async (
	input: string,
	init?: RequestInit,
): Promise<Response> => {
	const response = await fetch(input, init);

	if (response.redirected && new URL(response.url).pathname === "/login") {
		window.location.assign("/login");
		// The page is navigating away; don't let callers parse the login HTML
		return new Promise<Response>(() => {});
	}

	return response;
};

export { apiFetch };
