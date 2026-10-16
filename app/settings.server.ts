import { createCookie } from "react-router";

// Selected stock list, kept in a cookie (not localStorage) so the home loader
// can load the list together with everything else
const stockListCookie = createCookie("stockList", {
	path: "/",
	sameSite: "lax",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	maxAge: 60 * 60 * 24 * 365,
});

const isListId = (value: unknown): value is string =>
	typeof value === "string" && /^\d+$/.test(value);

const getStockListId = async (request: Request): Promise<string | null> => {
	const value = await stockListCookie.parse(request.headers.get("cookie"));
	return isListId(value) ? value : null;
};

/** Set-Cookie header value; `null` clears the selection */
const serializeStockListId = (listId: string | null) =>
	listId
		? stockListCookie.serialize(listId)
		: stockListCookie.serialize("", { maxAge: 0 });

export { getStockListId, isListId, serializeStockListId };
