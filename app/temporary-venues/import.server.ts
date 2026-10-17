import {
	type BeerSummary,
	lookupBeers,
	maxLookups,
	TooManyLookupsError,
} from "./beer-lookup.server";
import { parseCsv } from "./csv.server";
import { readXlsxRows } from "./xlsx.server";

const defaultMenuName = "All beers";
const maxReportedErrors = 20;

type ImportResult =
	| {
			ok: true;
			menus: TemporaryVenueMenu[];
			unknownStyles: string[];
			lookedUp: number;
	  }
	| { ok: false; errors: string[] };

const parseOptionalNumber = (value: string | undefined) => {
	if (!value) return null;
	const number = Number(value.replace(",", "."));
	return Number.isFinite(number) ? number : null;
};

const report = (errors: string[]): ImportResult => {
	const extra = errors.length - maxReportedErrors;
	return {
		ok: false,
		errors: [
			...errors.slice(0, maxReportedErrors),
			...(extra > 0 ? [`…and ${extra} more.`] : []),
		],
	};
};

/**
 * Turns uploaded rows into menus. Only `bid` is required: rows missing a
 * name, brewery or style are looked up on Untappd, and values in the file
 * always win over looked-up ones. Rows are grouped by the optional `menu`
 * column. Style names are matched to Untappd style ids; unknown names are
 * kept and reported.
 */
const importRows = async (
	rows: Record<string, string>[],
	styleIdsByName: Map<string, number>,
	accessToken: string,
): Promise<ImportResult> => {
	if (rows.length === 0) {
		return { ok: false, errors: ["The file has no rows."] };
	}
	if (!("bid" in rows[0])) {
		return { ok: false, errors: ["Missing column: bid."] };
	}

	// +2: 1-based, and the header is line 1
	const lines = rows.map((row, index) => ({ row, line: index + 2 }));

	const errors = lines
		.filter(({ row }) => {
			const bid = Number(row.bid);
			return !Number.isInteger(bid) || bid <= 0;
		})
		.map(({ row, line }) =>
			row.bid
				? `Line ${line}: bid "${row.bid}" is not an Untappd beer id.`
				: `Line ${line}: missing bid.`,
		);
	if (errors.length > 0) return report(errors);

	const needsLookup = lines
		.filter(({ row }) => !row.name || !row.brewery || !row.style)
		.map(({ row }) => Number(row.bid));

	let lookedUp: Map<number, BeerSummary | null>;
	try {
		lookedUp = await lookupBeers(needsLookup, accessToken);
	} catch (error) {
		if (error instanceof TooManyLookupsError) {
			return report([
				`${error.count} beers are missing a name, brewery or style and would have to be looked up on Untappd; the limit is ${maxLookups} per upload. Fill in those columns for some of them.`,
			]);
		}
		throw error;
	}

	const unknownStyles = new Set<string>();
	const menus = new Map<string, TemporaryVenueBeer[]>();

	for (const { row, line } of lines) {
		const bid = Number(row.bid);
		const untappd = lookedUp.get(bid);

		if (untappd === null) {
			errors.push(`Line ${line}: Untappd has no beer with bid ${bid}.`);
			continue;
		}

		const style = row.style || untappd?.style || "";
		const styleId = styleIdsByName.get(style.toLowerCase()) ?? null;
		if (styleId === null) unknownStyles.add(style);

		const menuName = row.menu || defaultMenuName;
		const items = menus.get(menuName) ?? [];
		// The same beer listed twice in one menu is shown once
		if (items.some((item) => item.bid === bid)) continue;

		items.push({
			bid,
			name: row.name || untappd?.name || "",
			brewery: row.brewery || untappd?.brewery || "",
			style,
			styleId,
			abv: parseOptionalNumber(row.abv) ?? untappd?.abv ?? null,
			country: row.country || untappd?.country || null,
			rating: parseOptionalNumber(row.rating) ?? untappd?.rating ?? null,
		});
		menus.set(menuName, items);
	}

	if (errors.length > 0) return report(errors);

	return {
		ok: true,
		menus: [...menus.entries()].map(([name, items], index) => ({
			id: index + 1,
			name,
			items,
		})),
		unknownStyles: [...unknownStyles].sort(),
		lookedUp: needsLookup.length,
	};
};

/** Reads an uploaded .xlsx (first sheet) or .csv file and imports it */
const importFile = async (
	file: File,
	styleIdsByName: Map<string, number>,
	accessToken: string,
): Promise<ImportResult> => {
	const isXlsx = /\.xlsx$/i.test(file.name);

	let rows: Record<string, string>[];
	try {
		rows = isXlsx
			? await readXlsxRows(await file.arrayBuffer())
			: parseCsv(await file.text());
	} catch (error) {
		console.error("Failed to read upload", error);
		return {
			ok: false,
			errors: [`Couldn't read the file as ${isXlsx ? "Excel" : "CSV"}.`],
		};
	}

	return importRows(rows, styleIdsByName, accessToken);
};

export { importFile };
