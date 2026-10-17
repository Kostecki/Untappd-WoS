import { useViewportSize } from "@mantine/hooks";

enum Settings {
	STOCK_LIST = "stockList",
	TABLE_FILTERS = "tableFilters",
}

interface SettingsTypes {
	// Only read on load, to move a stored selection into the stockList cookie
	[Settings.STOCK_LIST]: { listId: string; listName: string } | undefined;
	[Settings.TABLE_FILTERS]: {
		showHaveHad: boolean;
		showOnlyMissing: boolean;
		showOnlyMissingOnList: boolean;
	};
}

type StoredSettings = { [K in Settings]?: SettingsTypes[K] };

// localStorage can be missing, blocked (private mode) or hold invalid JSON
const readSettings = (): StoredSettings => {
	try {
		const parsed = JSON.parse(localStorage.getItem("settings") ?? "{}");
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
};

function getSettings(): StoredSettings;
function getSettings<T extends Settings>(
	identifier: T,
): SettingsTypes[T] | undefined;
function getSettings(identifier?: Settings) {
	const parsedSettings = readSettings();

	return identifier ? parsedSettings[identifier] : parsedSettings;
}

const setSettings = <T extends Settings>(
	identifier: T,
	inputValue: SettingsTypes[T],
) => {
	const parsedSettings = readSettings();
	parsedSettings[identifier] = inputValue;

	try {
		localStorage.setItem("settings", JSON.stringify(parsedSettings));
	} catch {
		// Not persisted; the app still works with the in-memory state
	}
};

// Hook: must only be called from components or other hooks
const useIsMobile = () => {
	const { width } = useViewportSize();
	return width <= 768;
};

export { getSettings, Settings, setSettings, useIsMobile };
