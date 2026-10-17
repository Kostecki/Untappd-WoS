import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv.server";

describe("parseCsv", () => {
	it("keys rows by the lowercased, trimmed header", () => {
		expect(parseCsv(" BID , Name\n1,Beer\n")).toEqual([
			{ bid: "1", name: "Beer" },
		]);
	});

	it("handles quoted fields with delimiters, quotes and newlines", () => {
		const csv = 'bid,name\n1,"Beer, ""special""\nedition"';
		expect(parseCsv(csv)).toEqual([
			{ bid: "1", name: 'Beer, "special"\nedition' },
		]);
	});

	it("detects semicolon-separated files", () => {
		expect(parseCsv("bid;name;abv\n1;Beer;6,5")).toEqual([
			{ bid: "1", name: "Beer", abv: "6,5" },
		]);
	});

	it("handles a BOM, CRLF line endings and blank lines", () => {
		expect(parseCsv("﻿bid,name\r\n1,A\r\n\r\n2,B\r\n")).toEqual([
			{ bid: "1", name: "A" },
			{ bid: "2", name: "B" },
		]);
	});

	it("fills missing trailing cells with empty strings", () => {
		expect(parseCsv("bid,name,style\n1,A")).toEqual([
			{ bid: "1", name: "A", style: "" },
		]);
	});

	it("returns no rows for an empty file", () => {
		expect(parseCsv("")).toEqual([]);
	});
});
