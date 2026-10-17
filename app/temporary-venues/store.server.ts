import {
	mkdir,
	readdir,
	readFile,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import path from "node:path";

// Mount this as a volume in production so uploads survive redeploys
const dataDir = path.resolve(process.env.DATA_DIR ?? "data");
const venuesDir = path.join(dataDir, "temporary-venues");

const fileFor = (id: number) => path.join(venuesDir, `${Math.abs(id)}.json`);

let venues: Map<number, TemporaryVenue> | undefined;
let loading: Promise<Map<number, TemporaryVenue>> | undefined;

const load = async () => {
	await mkdir(venuesDir, { recursive: true });
	const files = (await readdir(venuesDir)).filter((file) =>
		file.endsWith(".json"),
	);

	const loaded = new Map<number, TemporaryVenue>();
	for (const file of files) {
		try {
			const venue = JSON.parse(
				await readFile(path.join(venuesDir, file), "utf8"),
			) as TemporaryVenue;
			loaded.set(venue.id, venue);
		} catch (error) {
			console.error(`Skipping unreadable temporary venue ${file}`, error);
		}
	}
	return loaded;
};

/** All venues, read from disk once and then kept in memory */
const getVenues = async () => {
	if (venues) return venues;
	loading ??= load();
	venues = await loading;
	return venues;
};

// Writes are queued so two admin actions can't interleave on disk
let writeQueue: Promise<unknown> = Promise.resolve();
const queued = <T>(task: () => Promise<T>) => {
	const result = writeQueue.then(task);
	writeQueue = result.catch(() => undefined);
	return result;
};

const listTemporaryVenues = async () =>
	[...(await getVenues()).values()].sort((a, b) =>
		b.createdAt.localeCompare(a.createdAt),
	);

const getTemporaryVenue = async (id: number) => (await getVenues()).get(id);

const saveTemporaryVenue = (venue: TemporaryVenue) =>
	queued(async () => {
		await mkdir(venuesDir, { recursive: true });
		const file = fileFor(venue.id);
		// Write then rename, so a crash never leaves a half-written file
		await writeFile(`${file}.tmp`, JSON.stringify(venue));
		await rename(`${file}.tmp`, file);
		(await getVenues()).set(venue.id, venue);
	});

const deleteTemporaryVenue = (id: number) =>
	queued(async () => {
		await rm(fileFor(id), { force: true });
		(await getVenues()).delete(id);
	});

/** Today as yyyy-mm-dd in the server's time zone (mount /etc/localtime in Docker) */
const localDate = (now: Date) =>
	[
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
	].join("-");

/** Active, and not past its last day (inclusive, in local time) */
const isVisible = (venue: TemporaryVenue, now = new Date()) =>
	venue.active && (!venue.endsOn || localDate(now) <= venue.endsOn);

const listVisibleTemporaryVenues = async () =>
	(await listTemporaryVenues()).filter((venue) => isVisible(venue));

/** A new negative id, unique among existing venues */
const newTemporaryVenueId = async () => {
	const existing = await getVenues();
	let id = -Math.floor(Date.now() / 1000);
	while (existing.has(id)) id--;
	return id;
};

export {
	deleteTemporaryVenue,
	getTemporaryVenue,
	isVisible,
	listTemporaryVenues,
	listVisibleTemporaryVenues,
	newTemporaryVenueId,
	saveTemporaryVenue,
};
