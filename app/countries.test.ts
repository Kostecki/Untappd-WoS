import { describe, expect, it } from "vitest";
import countryToEmoji from "./countries";

describe("countryToEmoji", () => {
	it("maps country names", () => {
		expect(countryToEmoji("Denmark")).toBe("🇩🇰");
		expect(countryToEmoji(" united states ")).toBe("🇺🇸");
	});

	it("maps 2-letter codes, as uploaded venues often use", () => {
		expect(countryToEmoji("SE")).toBe("🇸🇪");
	});

	it("maps the UK nations", () => {
		expect(countryToEmoji("Scotland")).toBe("🏴󠁧󠁢󠁳󠁣󠁴󠁿");
	});

	it("falls back for unknown countries", () => {
		expect(countryToEmoji("Atlantis")).toBe("🕵️");
	});
});
