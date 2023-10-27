import { ReactNode, createContext, useContext, useState } from "react";

type SettingsInput = {
  stockList?: StockList;
  featureCountryBadges: boolean;
};

type settingsContextType = SettingsInput & {
  saveSettings: (update: SettingsInput) => void;
  updateSettings: (settings: SettingsInput) => void;
};

const settingsContextValues: settingsContextType = {
  stockList: {
    listId: undefined,
    listName: undefined,
  },
  featureCountryBadges: false,
  saveSettings: () => {},
  updateSettings: () => {},
};

const SettingsContext = createContext<settingsContextType>(
  settingsContextValues
);

export function useSettings() {
  return useContext(SettingsContext);
}

type Props = {
  children: ReactNode;
};

export function SettingsProvider({ children }: Props) {
  const [stockList, setStockList] = useState<StockList | undefined>(undefined);
  const [featureCountryBadges, setFeatureCountryBadges] = useState(false);

  const saveSettings = (update: SettingsInput) => {
    updateSettings(update);
    localStorage.setItem("settings-wos", JSON.stringify(update));
  };

  const updateSettings = (settings: SettingsInput) => {
    setStockList(settings.stockList);
    setFeatureCountryBadges(settings.featureCountryBadges);
  };

  const value = {
    stockList,
    featureCountryBadges,
    saveSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
