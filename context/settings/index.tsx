import { ReactNode, createContext, useContext, useState } from "react";

type SettingsInput = {
  stockListId: number | undefined;
  featureCountryBadges: boolean;
};

type settingsContextType = SettingsInput & {
  saveSettings: (update: SettingsInput) => void;
  updateSettings: (settings: SettingsInput) => void;
};

const settingsContextValues: settingsContextType = {
  stockListId: undefined,
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
  const [stockListId, setStockListId] = useState<number | undefined>(undefined);
  const [featureCountryBadges, setFeatureCountryBadges] = useState(false);

  const saveSettings = (update: SettingsInput) => {
    updateSettings(update);
    localStorage.setItem("settings", JSON.stringify(update));
  };

  const updateSettings = (settings: SettingsInput) => {
    setStockListId(settings.stockListId);
    setFeatureCountryBadges(settings.featureCountryBadges);
  };

  const value = {
    stockListId,
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
