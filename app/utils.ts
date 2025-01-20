enum Settings {
  STOCK_LIST = "stockList",
  TABLE_FILTERS = "tableFilters",
}

interface SettingsTypes {
  [Settings.STOCK_LIST]: { listId: string; listName: string };
  [Settings.TABLE_FILTERS]: {
    showHaveHad: boolean;
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
  inputValue: SettingsTypes[T]
) => {
  const settings = localStorage.getItem("settings");
  const parsedSettings = settings ? JSON.parse(settings) : {};

  parsedSettings[identifier] = inputValue;

  localStorage.setItem("settings", JSON.stringify(parsedSettings));
};

export { getSettings, setSettings, Settings };
