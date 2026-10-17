import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { useTempDataDir } from "./test/data-dir";

const venue = (overrides: Partial<TemporaryVenue> = {}): TemporaryVenue => ({
	id: -1,
	name: "MBCC 2026",
	location: "Øksnehallen",
	url: null,
	active: true,
	endsOn: null,
	createdAt: "2026-10-01T00:00:00.000Z",
	updatedAt: "2026-10-01T00:00:00.000Z",
	unknownStyles: [],
	menus: [],
	...overrides,
});

const loadStore = () => import("./store.server");

describe("temporary venue storage", () => {
	const dataDir = useTempDataDir();

	it("saves, lists, reloads and deletes venues as files", async () => {
		let store = await loadStore();
		await store.saveTemporaryVenue(venue({ id: -1, createdAt: "2026-10-01" }));
		await store.saveTemporaryVenue(venue({ id: -2, createdAt: "2026-10-02" }));

		const files = await readdir(path.join(dataDir.path, "temporary-venues"));
		expect(files.sort()).toEqual(["1.json", "2.json"]);

		// A fresh process reads them back from disk, newest first
		vi.resetModules();
		store = await loadStore();
		expect((await store.listTemporaryVenues()).map((v) => v.id)).toEqual([
			-2, -1,
		]);

		await store.deleteTemporaryVenue(-1);
		expect(await store.getTemporaryVenue(-1)).toBeUndefined();
		expect(await readdir(path.join(dataDir.path, "temporary-venues"))).toEqual([
			"2.json",
		]);
	});

	it("hands out unique negative ids", async () => {
		const store = await loadStore();
		const id = await store.newTemporaryVenueId();
		expect(id).toBeLessThan(0);

		await store.saveTemporaryVenue(venue({ id }));
		expect(await store.newTemporaryVenueId()).toBeLessThan(id);
	});

	it("only lists visible venues as visible", async () => {
		const store = await loadStore();
		await store.saveTemporaryVenue(venue({ id: -1, active: true }));
		await store.saveTemporaryVenue(venue({ id: -2, active: false }));
		await store.saveTemporaryVenue(venue({ id: -3, endsOn: "2000-01-01" }));

		expect((await store.listVisibleTemporaryVenues()).map((v) => v.id)).toEqual(
			[-1],
		);
	});
});

describe("isVisible", () => {
	useTempDataDir();

	// Local time, as the server mounts /etc/localtime
	const at = (y: number, m: number, d: number, h: number) =>
		new Date(y, m - 1, d, h, 30);

	it("is visible until the end of its last day, in local time", async () => {
		const { isVisible } = await loadStore();
		const v = venue({ endsOn: "2026-10-17" });

		expect(isVisible(v, at(2026, 10, 17, 23))).toBe(true);
		expect(isVisible(v, at(2026, 10, 18, 0))).toBe(false);
	});

	it("is hidden when inactive, whatever the date", async () => {
		const { isVisible } = await loadStore();
		expect(isVisible(venue({ active: false }), at(2026, 1, 1, 12))).toBe(false);
	});

	it("has no end without a last day", async () => {
		const { isVisible } = await loadStore();
		expect(isVisible(venue({ endsOn: null }), at(2099, 1, 1, 12))).toBe(true);
	});
});
