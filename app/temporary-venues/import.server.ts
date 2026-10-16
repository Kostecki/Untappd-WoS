import { parseCsv } from "./csv.server";

const requiredColumns = ["bid", "name", "brewery", "style"] as const;
const defaultMenuName = "All beers";
const maxReportedErrors = 20;

type ImportResult =
	| { ok: true; menus: TemporaryVenueMenu[]; unknownStyles: string[] }
	| { ok: false; errors: string[] };

const parseOptionalNumber = (value: string | undefined) => {
	if (!value) return null;
	const number = Number(value.replace(",", "."));
	return Number.isFinite(number) ? number : null;
};

/**
 * Turns an uploaded CSV into menus. Rows are grouped by the optional `menu`
 * column; `bid`, `name`, `brewery` and `style` are required. Style names
 * are matched to Untappd style ids; unknown names are kept and reported.
 */
const importCsv = (
	csv: string,
	styleIdsByName: Map<string, number>,
): ImportResult => {
	const rows = parseCsv(csv);

	if (rows.length === 0) {
		return { ok: false, errors: ["The file has no rows."] };
	}

	const missingColumns = requiredColumns.filter(
		(column) => !(column in rows[0]),
	);
	if (missingColumns.length > 0) {
		return {
			ok: false,
			errors: [`Missing column(s): ${missingColumns.join(", ")}.`],
		};
	}

	const errors: string[] = [];
	const unknownStyles = new Set<string>();
	const menus = new Map<string, TemporaryVenueBeer[]>();

	rows.forEach((row, index) => {
		// +2: 1-based, and the header is line 1
		const line = index + 2;
		const bid = Number(row.bid);

		const missing = requiredColumns.filter((column) => !row[column]);
		if (missing.length > 0) {
			errors.push(`Line ${line}: missing ${missing.join(", ")}.`);
			return;
		}
		if (!Number.isInteger(bid) || bid <= 0) {
			errors.push(`Line ${line}: bid "${row.bid}" is not an Untappd beer id.`);
			return;
		}

		const styleId = styleIdsByName.get(row.style.toLowerCase()) ?? null;
		if (styleId === null) unknownStyles.add(row.style);

		const menuName = row.menu || defaultMenuName;
		const items = menus.get(menuName) ?? [];
		// The same beer listed twice in one menu is shown once
		if (items.some((item) => item.bid === bid)) return;

		items.push({
			bid,
			name: row.name,
			brewery: row.brewery,
			style: row.style,
			styleId,
			abv: parseOptionalNumber(row.abv),
			country: row.country || null,
			rating: parseOptionalNumber(row.rating),
		});
		menus.set(menuName, items);
	});

	if (errors.length > 0) {
		const extra = errors.length - maxReportedErrors;
		return {
			ok: false,
			errors: [
				...errors.slice(0, maxReportedErrors),
				...(extra > 0 ? [`…and ${extra} more.`] : []),
			],
		};
	}

	return {
		ok: true,
		menus: [...menus.entries()].map(([name, items], index) => ({
			id: index + 1,
			name,
			items,
		})),
		unknownStyles: [...unknownStyles].sort(),
	};
};

export { importCsv };
