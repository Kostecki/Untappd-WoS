import { describe, expect, it, vi } from "vitest";
import { UntappdError, untappd, withFallback } from "./client.server";
import { mockFetch } from "./test/fetch-mock";

describe("untappd client", () => {
	it("calls the v4 API like the Android app and returns the response", async () => {
		const calls = mockFetch(() => ({ ok: true }));

		const result = await untappd("/beer/info/1", {
			accessToken: "token",
			params: { compact: true, skip: undefined, ids: [1, 2] },
		});

		expect(result).toEqual({ ok: true });
		const [{ url, method, headers }] = calls;
		expect(method).toBe("GET");
		expect(url.origin + url.pathname).toBe(
			"https://api.untappd.test/v4/beer/info/1",
		);
		expect(Object.fromEntries(url.searchParams)).toMatchObject({
			client_id: "test-client-id",
			client_secret: "test-client-secret",
			utv: "4.0.0",
			compact: "true",
		});
		expect(url.searchParams.has("skip")).toBe(false);
		expect(url.searchParams.getAll("ids")).toEqual(["1", "2"]);
		expect(headers).toMatchObject({
			Authorization: "Bearer token",
			"X-Untappd-App": "android",
			"X-Untappd-App-Version": "5.0.0",
			"User-Agent": "okhttp/4.12.0",
		});
	});

	it("can call v5", async () => {
		const calls = mockFetch(() => ({}));
		await untappd("/feed", { version: "v5" });
		expect(calls[0].url.pathname).toBe("/v5/feed");
	});

	it("sends bodies form-encoded by default and JSON on request", async () => {
		const calls = mockFetch(() => ({}));

		await untappd("/a", { method: "POST", body: { venue_id: 1, flag: true } });
		await untappd("/b", { method: "POST", body: { venue_id: 1 }, json: true });

		expect(calls[0].body).toBe("venue_id=1&flag=true");
		expect(calls[1].body).toBe('{"venue_id":1}');
		expect(calls[1].headers["Content-Type"]).toBe("application/json");
	});

	it("throws an UntappdError with the HTTP status", async () => {
		mockFetch(() => new Response("nope", { status: 500 }));

		await expect(untappd("/x")).rejects.toMatchObject({
			name: "UntappdError",
			status: 500,
			path: "/x",
		});
	});

	it("treats a response_code >= 400 inside a 200 as an error", async () => {
		mockFetch(() => ({ response_code: 403 }));

		const error = await untappd("/menus/sections").catch((e: unknown) => e);
		expect(error).toBeInstanceOf(UntappdError);
		expect((error as UntappdError).status).toBe(403);
	});
});

describe("withFallback", () => {
	it("returns the result when the call succeeds", async () => {
		expect(await withFallback(Promise.resolve([1]), [])).toEqual([1]);
	});

	it("logs and returns the fallback when the call fails", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await withFallback(
			Promise.reject(new UntappdError("boom", 500, "/x")),
			[],
		);

		expect(result).toEqual([]);
		expect(log).toHaveBeenCalledWith("boom");
	});

	it("redirects to /logout when Untappd rejects the token", async () => {
		const thrown = await withFallback(
			Promise.reject(new UntappdError("invalid_token", 401, "/x")),
			[],
		).catch((e) => e);

		expect(thrown).toBeInstanceOf(Response);
		expect(thrown.status).toBe(302);
		expect(thrown.headers.get("Location")).toBe("/logout");
	});
});
