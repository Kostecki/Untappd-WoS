import ExcelJS from "exceljs";

/** Plain text of a cell, whatever Excel stored in it */
const cellText = (value: ExcelJS.CellValue): string => {
	if (value === null || value === undefined) return "";
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	if ("richText" in value)
		return value.richText.map((part) => part.text).join("");
	if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
	if ("text" in value) return String(value.text);
	return "";
};

/** Rows of the first sheet as records keyed by the (lowercased) header row */
const readXlsxRows = async (
	data: ArrayBuffer,
): Promise<Record<string, string>[]> => {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(data);

	const sheet = workbook.worksheets[0];
	if (!sheet) return [];

	const keys: string[] = [];
	sheet.getRow(1).eachCell((cell, column) => {
		keys[column] = cellText(cell.value).trim().toLowerCase();
	});

	const rows: Record<string, string>[] = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;

		const record: Record<string, string> = {};
		keys.forEach((key, column) => {
			if (key) record[key] = cellText(row.getCell(column).value).trim();
		});
		if (Object.values(record).some(Boolean)) rows.push(record);
	});

	return rows;
};

const templateRows = 2000;

const columns: {
	key: string;
	width: number;
	note: string;
}[] = [
	{
		key: "menu",
		width: 18,
		note: "Optional. Beers with the same menu are grouped together, e.g. a session or tap list.",
	},
	{
		key: "bid",
		width: 12,
		note: "Required. The Untappd beer id: the number at the end of the beer's Untappd link.",
	},
	{ key: "name", width: 32, note: "Required. Beer name." },
	{ key: "brewery", width: 26, note: "Required. Brewery name." },
	{
		key: "style",
		width: 36,
		note: "Required. Pick the Untappd style from the list.",
	},
	{ key: "abv", width: 8, note: "Optional. Alcohol %, e.g. 6.5" },
	{
		key: "country",
		width: 14,
		note: "Optional. Brewery country, as a name or 2-letter code.",
	},
	{ key: "rating", width: 8, note: "Optional. Untappd rating, e.g. 3.85" },
];

/** An .xlsx to fill in: headers, notes and a dropdown of all Untappd styles */
const createTemplate = async (styleNames: string[]) => {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = "Wheel of Styles";

	const beers = workbook.addWorksheet("Beers", {
		views: [{ state: "frozen", ySplit: 1 }],
	});
	beers.columns = columns.map(({ key, width }) => ({
		header: key,
		key,
		width,
	}));
	beers.getRow(1).font = { bold: true };
	columns.forEach(({ note }, index) => {
		beers.getCell(1, index + 1).note = note;
	});

	// Dropdown source; hidden so it doesn't get in the way
	const styles = workbook.addWorksheet("Styles", { state: "hidden" });
	[...styleNames]
		.sort((a, b) => a.localeCompare(b))
		.forEach((name, index) => {
			styles.getCell(index + 1, 1).value = name;
		});
	const styleRange = `Styles!$A$1:$A$${Math.max(styleNames.length, 1)}`;

	const column = (key: string) =>
		columns.findIndex((item) => item.key === key) + 1;

	for (let row = 2; row <= templateRows; row++) {
		beers.getCell(row, column("style")).dataValidation = {
			type: "list",
			allowBlank: true,
			formulae: [styleRange],
			showErrorMessage: true,
			errorTitle: "Unknown style",
			error: "Pick an Untappd style from the list.",
		};
		beers.getCell(row, column("bid")).dataValidation = {
			type: "whole",
			operator: "greaterThan",
			allowBlank: true,
			formulae: [0],
			showErrorMessage: true,
			error: "The bid is the Untappd beer id, a whole number.",
		};
		beers.getCell(row, column("bid")).numFmt = "0";
	}

	const help = workbook.addWorksheet("How to");
	help.getColumn(1).width = 100;
	[
		"Fill in one beer per row on the Beers sheet, then upload the file on /admin.",
		"Required: bid, name, brewery and style. Hover a column header for details.",
		"The style column only accepts Untappd style names; pick them from the dropdown.",
		"Keep the header row as it is. Extra columns are ignored.",
		"",
		"Example row: Yellow session | 6413361 | Fear the Feathers | Fermenterarna | IPA - New England / Hazy | 6.5 | Sweden | 3.93",
	].forEach((line, index) => {
		help.getCell(index + 1, 1).value = line;
	});

	return Buffer.from(await workbook.xlsx.writeBuffer());
};

export { createTemplate, readXlsxRows };
