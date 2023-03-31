import { createContext, useContext, ReactNode, useState } from "react";

type mobileModeContextType = {
  mobileMode: boolean;
  updateMobileMode: (state: boolean) => void;
};

const mobileModeContextValues: mobileModeContextType = {
  mobileMode: false,
  updateMobileMode: () => {},
};

const MobileModeContext = createContext<mobileModeContextType>(
  mobileModeContextValues
);

export function useMobileMode() {
  return useContext(MobileModeContext);
}

type Props = {
  children: ReactNode;
};

export function MobileModeProvider({ children }: Props) {
  const [mobileMode, setMobileMode] = useState<boolean>(false);

  const updateMobileMode = (state: boolean) => {
    setMobileMode(state);
  };

  const value = {
    mobileMode,
    updateMobileMode,
  };

  return (
    <MobileModeContext.Provider value={value}>
      {children}
    </MobileModeContext.Provider>
  );
}
