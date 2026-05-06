import { readFile } from "node:fs/promises";
import path from "node:path";

const sessionMeta: Record<MBCCSession, { id: number; title: string }> = {
	yellow: { id: -202601, title: "Yellow" },
	blue: { id: -202602, title: "Blue" },
	red: { id: -202603, title: "Red" },
	green: { id: -202604, title: "Green" },
};
const mbccVenueId = -202600;

const compiledPath =
	process.env.MBCC_COMPILED_PATH ??
	path.resolve(process.cwd(), "data/mbcc-2026.compiled.json");

const baseVenue = {
	venue_slug: "mbcc-2026",
	venue_address: "Øksnehallen",
	venue_city: "København",
	venue_state: "Hovedstaden",
	venue_country: "Danmark",
	venue_icon: {
		sm: "",
		md: "",
		lg: "",
	},
	is_verified: true,
	is_closed: 0,
	primary_category: "Festival",
	location: "55.6694, 12.5621",
	has_beer: 1,
	has_food: 1,
	has_wine: 0,
	has_spirits: 0,
	url: "https://mbcc.mikkeller.com",
} satisfies Omit<MBCCVenueDetails, "venue_id" | "venue_name" | "mbcc_event">;

const createFallbackData = (): MBCCCompiledData => {
	const venues = [
		{
			venue_id: mbccVenueId,
			venue_name: "MBCC 2026",
			mbcc_event: true as const,
			...baseVenue,
			url: "https://mbcc.jonpacker.com",
		},
	];

	const menus = (Object.keys(sessionMeta) as MBCCSession[]).reduce<
		Record<MBCCSession, MBCCVenueMenuDetails[]>
	>(
		(acc, session) => {
			const { id, title } = sessionMeta[session];
			acc[session] = [
				{
					menu_id: id,
					menu_name: title,
					menu_description: `Fallback MBCC 2026 ${title} session list`,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					total_item_count: 0,
					sections: {
						count: 1,
						items: [
							{
								section_id: id,
								section_name: "All beers",
								section_description: "",
								count: 0,
								items: [],
							},
						],
					},
					mbcc_event: true,
					mbcc_session: session,
				},
			];

			return acc;
		},
		{} as Record<MBCCSession, MBCCVenueMenuDetails[]>,
	);

	return {
		event_id: "mbcc-2026",
		generated_at: new Date().toISOString(),
		venues,
		menus,
		diagnostics: {
			source_version: "fallback",
			resolved_beers: 0,
			unresolved_beers: 0,
		},
	};
};

const isValidCompiledData = (data: unknown): data is MBCCCompiledData => {
	if (!data || typeof data !== "object") {
		return false;
	}

	const candidate = data as Partial<MBCCCompiledData>;
	if (candidate.event_id !== "mbcc-2026") {
		return false;
	}

	if (!Array.isArray(candidate.venues)) {
		return false;
	}

	if (!candidate.menus || typeof candidate.menus !== "object") {
		return false;
	}

	return (
		Array.isArray(candidate.menus.yellow) &&
		Array.isArray(candidate.menus.blue) &&
		Array.isArray(candidate.menus.red) &&
		Array.isArray(candidate.menus.green)
	);
};

const readCompiledData = async (): Promise<MBCCCompiledData> => {
	try {
		const raw = await readFile(compiledPath, "utf8");
		const parsed = JSON.parse(raw);

		if (!isValidCompiledData(parsed)) {
			console.error("Invalid MBCC compiled data schema", compiledPath);
			return createFallbackData();
		}

		return parsed;
	} catch (error) {
		console.error("Failed to read MBCC compiled data", compiledPath, error);
		return createFallbackData();
	}
};

const getMBCCVirtualVenues = async (): Promise<MBCCVenueDetails[]> => {
	const compiled = await readCompiledData();
	return compiled.venues;
};

const getMBCCVenueMenu = async (): Promise<MBCCVenueMenuDetails[]> => {
	const compiled = await readCompiledData();
	return (Object.keys(sessionMeta) as MBCCSession[]).flatMap(
		(session) => compiled.menus[session] ?? [],
	);
};

export { getMBCCVenueMenu, getMBCCVirtualVenues };
