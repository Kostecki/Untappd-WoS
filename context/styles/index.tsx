import { createContext, useContext, ReactNode, useState } from "react";

import { useSession } from "next-auth/react";

import { useSettings } from "../settings";

type stylesContextType = {
  loading: boolean;
  checkinsPerLevel: number;
  totalStyles: number;
  haveHadCount: number;
  styles: Style[];
  showHaveHad: boolean;
  showMissing: boolean;
  showOnlyOnList: boolean;
  toggleShowHaveHad: (state: boolean) => void;
  toggleShowMissing: (state: boolean) => void;
  toggleShowOnlyOnList: (state: boolean) => void;
  fetchStyles: (stockListId?: number) => void;
};

type StockData = { styleIds: number[]; listName: string };

const stylesContextValues: stylesContextType = {
  loading: false,
  checkinsPerLevel: 5,
  totalStyles: 0,
  haveHadCount: 0,
  styles: [],
  showHaveHad: false,
  showMissing: false,
  showOnlyOnList: false,
  toggleShowHaveHad: () => {},
  toggleShowMissing: () => {},
  toggleShowOnlyOnList: () => {},
  fetchStyles: () => {},
};

const StylesContext = createContext<stylesContextType>(stylesContextValues);

export function useStyles() {
  return useContext(StylesContext);
}

type Props = {
  children: ReactNode;
};

export function StylesProvider({ children }: Props) {
  const { data: session } = useSession();

  const { stockList: settingsStockList } = useSettings();

  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<Style[]>([]);
  const [showHaveHad, setShowHaveHad] = useState(false);
  const [showMissing, setShowMissing] = useState(true);
  const [showOnlyOnList, setShowOnlyOnList] = useState(false);

  const fetchStyles = async (stockListId?: number) => {
    setLoading(true);

    if (session?.user) {
      const { accessToken, wosBadgeId, apiBase } = session.user;
      const url = `${apiBase}/badges/view/${wosBadgeId}?access_token=${accessToken}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const items = data.response.badge.special_status_list.items[0].items;

          const stylesHad = items.map((style: BadgeStyle) => ({
            style_id: style.item_id,
            style_name: style.item_name,
            had: true,
          }));

          getStylesNotHad(stylesHad, stockListId ?? settingsStockList?.listId);
        });
    }
  };

  const getStylesNotHad = (
    stylesHad: CombinedStyle[],
    stockListId?: number
  ) => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      fetch(`${apiBase}/badges/styles_not_had?access_token=${accessToken}`)
        .then((response) => response.json())
        .then(async (data) => {
          const items = data.response.items;
          const stylesNotHad = items.map((style: NotHadStyle) => ({
            style_id: style.style_id,
            style_name: style.style_name,
            had: false,
          }));

          let payload = [...stylesHad, ...stylesNotHad];
          payload.sort((a, b) =>
            a.style_name > b.style_name
              ? 1
              : b.style_name > a.style_name
              ? -1
              : 0
          );

          if (stockListId) {
            const personalStock = await loadFromPersonalStock(stockListId);

            payload.forEach((e, i) => {
              if (personalStock?.styleIds.includes(e.style_id)) {
                payload[i].onList = personalStock.listName;
              }
            });
          }

          setStyles(payload);
          setLoading(false);
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  const loadFromPersonalStock = async (
    stockListId?: number,
    offset: number = 0,
    accumulatedData: StockData = {
      styleIds: [],
      listName: "",
    }
  ): Promise<StockData | undefined> => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      if (stockListId) {
        const response = await fetch(
          `${apiBase}/custom_lists/view/${stockListId}?styles=true&access_token=${accessToken}&offset=${offset}`
        );
        const data = await response.json();
        const styleIds = [
          ...accumulatedData.styleIds,
          ...data.response.items.map(
            (item: UserListDetails) => item.beer.beer_style_id
          ),
        ];
        const listName = data.response.list.list_name;

        if (data.response.pagination.next_url !== "") {
          // recurse to get next page data
          return await loadFromPersonalStock(stockListId, offset + 25, {
            styleIds,
            listName,
          });
        } else {
          return { styleIds, listName };
        }
      }
    }
    return undefined;
  };

  const toggleShowHaveHad = (state: boolean) => {
    setShowHaveHad(state);
  };

  const toggleShowMissing = (state: boolean) => {
    setShowMissing(state);
  };

  const toggleShowOnlyOnList = (state: boolean) => {
    setShowOnlyOnList(state);
  };

  const value = {
    loading,
    checkinsPerLevel: stylesContextValues.checkinsPerLevel,
    totalStyles: styles.length,
    haveHadCount: styles.filter((e: CombinedStyle) => e.had).length,
    styles,
    showHaveHad,
    showMissing,
    showOnlyOnList,
    toggleShowHaveHad,
    toggleShowMissing,
    toggleShowOnlyOnList,
    fetchStyles,
  };

  return (
    <StylesContext.Provider value={value}>{children}</StylesContext.Provider>
  );
}
