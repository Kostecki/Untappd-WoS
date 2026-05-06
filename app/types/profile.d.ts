declare global {
	interface Filters {
		showHaveHad: boolean;
		showOnlyMissing: boolean;
		showOnlyMissingOnList: boolean;
	}

	interface LatestCommit {
		hash: string;
		message: string;
	}
}

export {};
