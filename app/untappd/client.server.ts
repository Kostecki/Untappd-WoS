import { redirect } from "react-router";

import {
	API_HOST,
	APP_VERSION,
	CLIENT_ID,
	CLIENT_SECRET,
} from "./config.server";

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue | QueryValue[]>;

interface RequestOptions {
	accessToken?: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	params?: Query;
	/** Sent as form data by default, or JSON when `json` is true */
	body?: Record<string, unknown>;
	json?: boolean;
	version?: "v4" | "v5";
	signal?: AbortSignal;
}

class UntappdError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly path: string,
	) {
		super(message);
		this.name = "UntappdError";
	}
}

const appendQuery = (searchParams: URLSearchParams, query: Query) => {
	for (const [key, value] of Object.entries(query)) {
		const values = Array.isArray(value) ? value : [value];
		for (const item of values) {
			if (item === undefined || item === null) continue;
			searchParams.append(key, String(item));
		}
	}
};

const toFormBody = (body: Record<string, unknown>) => {
	const form = new URLSearchParams();
	appendQuery(form, body as Query);
	return form;
};

/**
 * Calls the Untappd mobile API the same way the official app does and
 * returns the `response` envelope. Throws `UntappdError` on non-2xx.
 */
const untappd = async <T>(
	path: string,
	{
		accessToken,
		method = "GET",
		params = {},
		body,
		json = false,
		version = "v4",
		signal,
	}: RequestOptions = {},
): Promise<T> => {
	const url = new URL(`${API_HOST}/${version}${path}`);
	appendQuery(url.searchParams, {
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		utv: APP_VERSION,
		...params,
	});

	const headers: Record<string, string> = {
		Accept: "application/json; charset=utf-8",
		"X-Untappd-App": "android",
		"X-Untappd-App-Version": APP_VERSION,
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	let requestBody: BodyInit | undefined;
	if (body) {
		if (json) {
			headers["Content-Type"] = "application/json";
			requestBody = JSON.stringify(body);
		} else {
			requestBody = toFormBody(body);
		}
	}

	const response = await fetch(url, {
		method,
		headers,
		body: requestBody,
		signal,
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new UntappdError(
			`Untappd ${method} ${path} failed: ${response.status} ${text.slice(0, 200)}`,
			response.status,
			path,
		);
	}

	const data = (await response.json()) as {
		response: T & { response_code?: number };
	};

	// Some endpoints (e.g. /menus/sections) report errors inside a 200 envelope
	const responseCode = data.response?.response_code;
	if (responseCode && responseCode >= 400) {
		throw new UntappdError(
			`Untappd ${method} ${path} failed: response_code ${responseCode}`,
			responseCode,
			path,
		);
	}

	return data.response;
};

/** Untappd answers 401 (invalid_token) when a token is expired or revoked */
const isInvalidToken = (error: unknown) =>
	error instanceof UntappdError && error.status === 401;

/**
 * Runs an API call and logs + returns `fallback` if it fails. An invalid
 * token logs the user out instead, since nothing will work until they log
 * in again.
 */
const withFallback = async <T>(
	request: Promise<T>,
	fallback: T,
): Promise<T> => {
	try {
		return await request;
	} catch (error) {
		if (isInvalidToken(error)) {
			throw redirect("/logout");
		}
		console.error(error instanceof Error ? error.message : error);
		return fallback;
	}
};

export { isInvalidToken, UntappdError, untappd, withFallback };
export type { Query, RequestOptions };
