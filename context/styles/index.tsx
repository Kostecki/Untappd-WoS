import { createContext, useContext, ReactNode, useState } from "react";

import { useSession } from "next-auth/react";
import Cookies from "universal-cookie";

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
  const cookies = new Cookies();

  const { data: session } = useSession();

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

          const storedListName = cookies.get("stockList");
          if (storedListName) {
            const personalStock = await loadFromPersonalStock();

            payload.forEach((e, i) => {
              if (personalStock.includes(e.style_id)) {
                payload[i].onList = storedListName;
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

      const storedListName = cookies.get("stockList");
      if (storedListName) {
        const listId = await fetch(
          `${apiBase}/custom_lists/userlists?access_token=${accessToken}`
        )
          .then((response) => response.json())
          .then((data) => {
            return data.response.items.find(
              (list: UserLists) => list.list_name === storedListName
            ).list_id;
          });

        return fetch(
          `${apiBase}/custom_lists/view/${listId}?styles=true&access_token=${accessToken}`
        )
          .then((response) => response.json())
          .then((data) =>
            data.response.items.map((item: Userlist) => item.beer.beer_style_id)
          );
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
