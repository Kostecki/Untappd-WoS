import { createContext, useContext, ReactNode, useState } from "react";
import { useSession } from "next-auth/react";

type stylesContextType = {
  loading: boolean;
  checkinsPerLevel: number;
  totalStyles: number;
  haveHadCount: number;
  fetchStyles: () => void;
};

interface BadgeStyle {
  item_id: number;
  item_name: string;
}

interface NotHadStyle {
  style_id: number;
  style_name: string;
}

interface CombinedStyle extends NotHadStyle {
  had: boolean;
}

const stylesContextValues: stylesContextType = {
  loading: false,
  checkinsPerLevel: 5,
  totalStyles: 0,
  haveHadCount: 0,
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

  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState([]);

  const apiBaseURL = "https://api.untappd.com/v4";

  const fetchStyles = async () => {
    setLoading(true);

    if (session?.user) {
      const { accessToken, wosBadgeId } = session.user;
      const url = `${apiBaseURL}/badges/view/${wosBadgeId}?access_token=${accessToken}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const items = data.response.badge.special_status_list.items[0].items;

          console.log(items[0]);

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
      const { accessToken } = session.user;

      fetch(`${apiBaseURL}/badges/styles_not_had?access_token=${accessToken}`)
        .then((response) => response.json())
        .then((data) => {
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

          // @ts-ignore // TODO: fix
          setStyles(payload);
          setLoading(false);
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  const value = {
    loading,
    checkinsPerLevel: stylesContextValues.checkinsPerLevel,
    totalStyles: styles.length,
    haveHadCount: styles.filter((e: CombinedStyle) => e.had).length,
    fetchStyles,
  };

  return (
    <StylesContext.Provider value={value}>{children}</StylesContext.Provider>
  );
}
