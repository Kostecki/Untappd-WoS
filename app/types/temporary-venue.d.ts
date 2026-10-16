declare global {
	// A venue uploaded as CSV from /admin, e.g. a festival. Stored in DATA_DIR.
	interface TemporaryVenueBeer {
		bid: number;
		name: string;
		brewery: string;
		/** Untappd style name */
		style: string;
		/** Resolved from Untappd's style list at upload; null if the name is unknown */
		styleId: number | null;
		abv: number | null;
		country: string | null;
		rating: number | null;
	}

	interface TemporaryVenueMenu {
		id: number;
		name: string;
		items: TemporaryVenueBeer[];
	}

	interface TemporaryVenue {
		/** Negative, so it can't collide with Untappd venue ids */
		id: number;
		name: string;
		location: string | null;
		url: string | null;
		active: boolean;
		/** ISO date (yyyy-mm-dd); the venue is hidden after this day */
		endsOn: string | null;
		createdAt: string;
		updatedAt: string;
		/** Style names that didn't match Untappd's style list */
		unknownStyles: string[];
		menus: TemporaryVenueMenu[];
	}
}

export {};
