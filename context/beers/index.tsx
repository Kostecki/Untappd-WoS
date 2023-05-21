import { ReactNode, createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";

import { debounce } from "@mui/material/utils";
import { useStyles } from "../styles";

type beersContextType = {
  beers: SearchableBeer[];
  beersLoading: boolean;
  searchForBeers: (query: string) => void;
};

const beersContextValues: beersContextType = {
  beers: [],
  beersLoading: false,
  searchForBeers: () => {},
};

const BeersContext = createContext<beersContextType>(beersContextValues);

export function useBeers() {
  return useContext(BeersContext);
}

type Props = {
  children: ReactNode;
};

export function BeersProvider({ children }: Props) {
  const { data: session } = useSession();

  const { styles } = useStyles();

  const [beers, setBeers] = useState<SearchableBeer[]>([]);
  const [beersLoading, setBeersLoading] = useState(false);

  const searchForBeers = debounce((query) => {
    if (!query || query === "") {
      setBeers([]);

      return;
    }

    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      setBeersLoading(true);

      fetch(`${apiBase}/search/beer?q=${query}&access_token=${accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          const payload = data.response.beers.items.map((e: SearchResponse) => {
            const {
              bid,
              beer_name,
              beer_slug,
              beer_style,
              beer_label,
              beer_abv,
              beer_description,
            } = e.beer;
            const { brewery_id, brewery_name } = e.brewery;

            const haveHad = styles.find(
              (style) => style.style_name === beer_style
            )?.had;

            return {
              bid,
              beer_name,
              beer_slug,
              beer_style,
              beer_label,
              beer_abv,
              beer_description,
              brewery_id,
              brewery_name,
              hadBeer: e.have_had,
              hadStyle: haveHad,
            };
          });

          setBeers(payload);
          setBeersLoading(false);
        })
        .catch((error) => {
          setBeersLoading(false);
          console.error(error);
        });
    }
  }, 500);

  const value = {
    beers,
    beersLoading,
    searchForBeers,
  };

  return (
    <BeersContext.Provider value={value}>{children}</BeersContext.Provider>
  );
}
