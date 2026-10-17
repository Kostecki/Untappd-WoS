import { vi } from "vitest";

/** One recorded call to the mocked fetch */
interface Call {
	url: URL;
	method: string;
	headers: Record<string, string>;
	body: string | undefined;
}

/**
 * Replaces global fetch. `respond` gets each call and returns the Untappd
 * `response` payload (wrapped in the usual envelope) or a full Response.
 */
const mockFetch = (respond: (call: Call) => unknown) => {
	const calls: Call[] = [];

	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: URL | string, init: RequestInit = {}) => {
			const call: Call = {
				url: new URL(input),
				method: init.method ?? "GET",
				headers: (init.headers ?? {}) as Record<string, string>,
				body: init.body === undefined ? undefined : String(init.body),
			};
			calls.push(call);

			const result = await respond(call);
			if (result instanceof Response) return result;
			return Response.json({ meta: { code: 200 }, response: result });
		}),
	);

	return calls;
};

export type { Call };
export { mockFetch };
