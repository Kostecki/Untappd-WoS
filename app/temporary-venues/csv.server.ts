/**
 * Minimal RFC 4180 CSV parser: quoted fields, escaped quotes ("") and
 * newlines inside quotes. The delimiter (comma or semicolon, as Excel uses
 * in many locales) is detected from the header row.
 */
const parseCsv = (input: string): Record<string, string>[] => {
	const text = input.replace(/^﻿/, "");
	const firstLine = text.slice(0, text.search(/\r?\n|$/));
	const delimiter =
		(firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
			? ";"
			: ",";

	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"' && text[i + 1] === '"') {
				field += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				field += char;
			}
		} else if (char === '"') {
			inQuotes = true;
		} else if (char === delimiter) {
			row.push(field);
			field = "";
		} else if (char === "\n" || char === "\r") {
			if (char === "\r" && text[i + 1] === "\n") i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += char;
		}
	}

	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	const [header, ...records] = rows.filter((cells) =>
		cells.some((cell) => cell.trim() !== ""),
	);
	if (!header) return [];

	const keys = header.map((key) => key.trim().toLowerCase());
	return records.map((cells) =>
		Object.fromEntries(keys.map((key, i) => [key, (cells[i] ?? "").trim()])),
	);
};

export { parseCsv };
