import { describe, expect, it, vi } from "vitest";
import { listVisibleTemporaryVenues } from "~/temporary-venues/store.server";
import { searchVenues } from "~/untappd/api.server";
import { loader } from "./venues";

vi.mock("~/auth/user.server", () => ({
	requireUser: vi.fn(async () => ({ accessToken: "token" })),
}));
vi.mock("~/untappd/api.server", () => ({ searchVenues: vi.fn() }));
vi.mock("~/temporary-venues/store.server", () => ({
	listVisibleTemporaryVenues: vi.fn(),
}));

const temporary = (id: number, name: string, location: string | null = null) =>
	({ id, name, location, url: null }) as TemporaryVenue;

const untappdVenue = (
	venue_id: number,
	venue_name: string,
	venue_country: string,
) => ({
	venue: { venue_id, venue_name, venue_country, venue_slug: `v-${venue_id}` },
});

const search = async (query: string) => {
	const response = await loader({
		request: new Request(`http://localhost/api/venues/${query}`),
		params: { searchQuery: query },
	} as never);
	return (await response.json()) as VenueDetails[];
};

describe("venue search", () => {
	it("lists every active temporary venue first, matching ones first", async () => {
		vi.mocked(listVisibleTemporaryVenues).mockResolvedValue([
			temporary(-1, "Test venue"),
			temporary(-2, "MBCC 2026", "Øksnehallen, København"),
		]);
		vi.mocked(searchVenues).mockResolvedValue([
			untappdVenue(5, "Mikkeller Bar", "Danmark"),
		] as never);

		const venues = await search("mbcc");

		expect(venues.map((v) => [v.venue_name, Boolean(v.temporary)])).toEqual([
			["MBCC 2026", true],
			["Test venue", true],
			["Mikkeller Bar", false],
		]);
	});

	it("matches temporary venues ignoring case and accents, on name or location", async () => {
		vi.mocked(listVisibleTemporaryVenues).mockResolvedValue([
			temporary(-1, "Other"),
			temporary(-2, "MBCC 2026", "Øksnehallen, København"),
		]);
		vi.mocked(searchVenues).mockResolvedValue([]);

		expect((await search("oksnehallen"))[0].venue_name).toBe("MBCC 2026");
		expect((await search("KOBENHAVN mbcc"))[0].venue_name).toBe("MBCC 2026");
	});

	it("puts Danish Untappd venues first and links them to Untappd", async () => {
		vi.mocked(listVisibleTemporaryVenues).mockResolvedValue([]);
		vi.mocked(searchVenues).mockResolvedValue([
			untappdVenue(1, "Abroad", "Sverige"),
			untappdVenue(2, "Home", "Danmark"),
		] as never);

		const venues = await search("bar");

		expect(venues.map((v) => v.venue_name)).toEqual(["Home", "Abroad"]);
		expect(venues[0].url).toBe("https://untappd.com/v/v-2/2");
	});
});
