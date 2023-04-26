import { createContext, useContext, ReactNode, useState } from "react";

import { useSession } from "next-auth/react";

import { useLists } from "../lists";

type stylesContextType = {
  loading: boolean;
  checkinsPerLevel: number;
  totalStyles: number;
  haveHadCount: number;
  styles: Style[];
  showHaveHad: boolean;
  toggleShowHaveHad: () => void;
  fetchStyles: () => void;
};

const stylesContextValues: stylesContextType = {
  loading: false,
  checkinsPerLevel: 5,
  totalStyles: 0,
  haveHadCount: 0,
  styles: [],
  showHaveHad: false,
  toggleShowHaveHad: () => {},
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
  const { selectedListId } = useLists();

  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<Style[]>([]);
  const [showHaveHad, setShowHaveHad] = useState(false);

  const fetchStyles = async () => {
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

          getStylesNotHad(stylesHad);
        });
    }
  };

  const getStylesNotHad = (stylesHad: CombinedStyle[]) => {
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

          if (selectedListId) {
            const personalStock = await loadFromPersonalStock();

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

  const loadFromPersonalStock = async () => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      if (selectedListId) {
        return fetch(
          `${apiBase}/custom_lists/view/${selectedListId}?styles=true&access_token=${accessToken}`
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

  const toggleShowHaveHad = () => {
    setShowHaveHad(!showHaveHad);
  };

  const value = {
    loading,
    checkinsPerLevel: stylesContextValues.checkinsPerLevel,
    totalStyles: styles.length,
    haveHadCount: styles.filter((e: CombinedStyle) => e.had).length,
    styles,
    showHaveHad,
    toggleShowHaveHad,
    fetchStyles,
  };

  return (
    <StylesContext.Provider value={value}>{children}</StylesContext.Provider>
  );
}
