import { useViewportSize } from "@mantine/hooks";

enum Settings {
  STOCK_LIST = "stockList",
  TABLE_FILTERS = "tableFilters",
}

interface SettingsTypes {
  // Legacy: moved to a cookie, only read once to migrate
  [Settings.STOCK_LIST]: { listId: string; listName: string } | undefined;
  [Settings.TABLE_FILTERS]: {
    showHaveHad: boolean;
    showOnlyMissing: boolean;
    showOnlyMissingOnList: boolean;
  };
}

const getSettings = (identifier?: Settings) => {
  const settings = localStorage.getItem("settings");
  const parsedSettings = settings ? JSON.parse(settings) : {};

  return identifier ? parsedSettings[identifier] ?? {} : parsedSettings;
};

const setSettings = <T extends Settings>(
  identifier: T,
  inputValue: SettingsTypes[T],
) => {
  const settings = localStorage.getItem("settings");
  const parsedSettings = settings ? JSON.parse(settings) : {};

  parsedSettings[identifier] = inputValue;

  localStorage.setItem("settings", JSON.stringify(parsedSettings));
};

// Hook: must only be called from components or other hooks
const useIsMobile = () => {
  const { width } = useViewportSize();
  return width <= 768;
};

export { getSettings, setSettings, Settings, useIsMobile };
