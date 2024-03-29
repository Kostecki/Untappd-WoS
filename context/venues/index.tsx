import { createContext, useContext, ReactNode, useState } from "react";
import { useSession } from "next-auth/react";

import { debounce } from "@mui/material/utils";

type venuesContextType = {
  selectedVenue: Venue | null;
  venues: Venue[];
  venuesLoading: boolean;
  venueBeers: VenueOffering[];
  venueBeersLoading: boolean;
  setSelectedVenue: (value: Venue) => void;
  searchForVenues: (query: string) => void;
  fetchVenueBeers: (venue: Venue) => void;
};

const venuesContextValues: venuesContextType = {
  selectedVenue: null,
  venues: [],
  venuesLoading: false,
  venueBeers: [],
  venueBeersLoading: false,
  setSelectedVenue: () => {},
  searchForVenues: () => {},
  fetchVenueBeers: () => {},
};

const VenuesContext = createContext<venuesContextType>(venuesContextValues);

export function useVenues() {
  return useContext(VenuesContext);
}

type Props = {
  children: ReactNode;
};

export function VenuesProvider({ children }: Props) {
  const { data: session } = useSession();

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueBeers, setVenueBeers] = useState<VenueOffering[]>([]);
  const [venueBeersLoading, setVenueBeersLoading] = useState(false);

  // MBCC session order
  const sessions = ["yellow", "blue", "red", "green"];

  const searchForVenues = debounce((query) => {
    if (!query || query === "") {
      setVenues([]);
      setVenueBeers([]);

      return;
    }

    if (session?.user) {
      console.log("query");
      const { apiBase, accessToken } = session.user;

      if (!query || query === "") {
        setVenues([]);
        setVenueBeers([]);

        return;
      }

      setVenuesLoading(true);

      fetch(`${apiBase}/search/venue?q=${query}&access_token=${accessToken}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            const options = data.response.venues.items.map(
              (e: VenueResponse) => e.venue
            );
            const sorted = options.sort((a: Venue, b: Venue) => {
              if (
                a.venue_country === "Danmark" &&
                b.venue_country !== "Danmark"
              ) {
                return -1;
              }

              if (
                a.venue_country !== "Danmark" &&
                b.venue_country === "Danmark"
              ) {
                return 1;
              }

              return 0;
            });

            setVenues(sorted);
            setVenuesLoading(false);
          }
        })
        .catch((error) => {
          setVenuesLoading(false);
          console.error("Error:", error);
        });
    }
  }, 500);

  const fetchVenueBeers = (venue: Venue) => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      if (!venue) return setVenueBeers([]);

      setVenueBeersLoading(true);
      const { venue_id, venue_name, venue_slug } = venue;
      const isMBCC = venue_id === 99991337;

      let url = `${apiBase}/inventory/view/${venue_id}?hasNotHadBefore=true&access_token=${accessToken}`;

      // Handle special case MBCC
      if (isMBCC) {
        url = "api/mbcc";
      }

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const beers: VenueOffering[] = [];

          if (isMBCC) {
            Object.keys(data).forEach((session: string) => {
              const list: FullBeer[] = [];
              data[session].forEach((beer: any) => list.push(beer));

              beers.push({
                beers: list,
                menu: session,
                venueId: venue_id,
                venueName: venue_name,
                venueSlug: venue_slug,
              });
            });
          } else {
            data.response.items.forEach((e: MenuItem) => {
              const list: FullBeer[] = [];

              e.menu.sections.items.forEach((menu: Menu) =>
                list.push(...menu.items)
              );

              beers.push({
                beers: list,
                menu: e.menu.menu_name,
                venueId: venue_id,
                venueName: venue_name,
                venueSlug: venue_slug,
              });
            });
          }

          const MBCCSort = beers.sort(
            (a, b) => sessions.indexOf(a.menu) - sessions.indexOf(b.menu)
          );

          setVenueBeers(isMBCC ? beers : MBCCSort);
          setVenueBeersLoading(false);
        })
        .catch((error) => {
          setVenueBeersLoading(false);
          console.error("Error:", error);
        });
    }
  };

  const value = {
    selectedVenue,
    venues,
    venuesLoading,
    venueBeers,
    venueBeersLoading,
    setSelectedVenue,
    searchForVenues,
    fetchVenueBeers,
  };

  return (
    <VenuesContext.Provider value={value}>{children}</VenuesContext.Provider>
  );
}
