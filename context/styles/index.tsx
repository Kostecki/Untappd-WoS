import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

import { useSession } from "next-auth/react";

import { useSettings } from "../settings";

type stylesContextType = {
  loading: boolean;
  checkinsPerLevel: number;
  totalStyles: number;
  haveHadCount: number;
  styles: Style[];
  showHaveHad: boolean;
  showOnlyOnList: boolean;
  toggleShowHaveHad: (state: boolean) => void;
  toggleShowOnlyOnList: (state: boolean) => void;
  fetchStyles: (stockListId?: number) => void;
};

const stylesContextValues: stylesContextType = {
  loading: false,
  checkinsPerLevel: 5,
  totalStyles: 0,
  haveHadCount: 0,
  styles: [],
  showHaveHad: false,
  showOnlyOnList: false,
  toggleShowHaveHad: () => {},
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

  const loadFromPersonalStock = async (stockListId?: number) => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      if (stockListId) {
        return fetch(
          `${apiBase}/custom_lists/view/${stockListId}?styles=true&access_token=${accessToken}`
        )
          .then((response) => response.json())
          .then((data) => {
            return {
              styleIds: data.response.items.map(
                (item: UserListDetails) => item.beer.beer_style_id
              ),
              listName: data.response.list.list_name,
            };
          });
      }
    }
  };

  const toggleShowHaveHad = (state: boolean) => {
    setShowHaveHad(state);
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
    showOnlyOnList,
    toggleShowHaveHad,
    toggleShowOnlyOnList,
    fetchStyles,
  };

  return (
    <StylesContext.Provider value={value}>{children}</StylesContext.Provider>
  );
}
