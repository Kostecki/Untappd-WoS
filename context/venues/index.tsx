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

// Hardcoded MBCC entry
const mbcc = {
  venue_id: 99991337,
  venue_name: "MBCC 2024",
  is_closed: 0,
  primary_category: "Nightlife Spot",
  venue_slug: "",
  location: "København, Region Hovedstaden",
  venue_address: "Jernbanegade 7",
  venue_city: "København",
  venue_state: "Region Hovedstaden",
  venue_country: "Danmark",
  is_verified: true,
  venue_icon: {},
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

  async function isMBCCSeason(): Promise<boolean> {
    try {
      const response = await fetch("api/mbcc");
      const data = await response.json();

      const isNonEmptyObject =
        typeof data === "object" &&
        data !== null &&
        !Array.isArray(data) &&
        Object.keys(data).length > 0;

      const isEmptyArray = Array.isArray(data) && data.length === 0;

      return isNonEmptyObject && !isEmptyArray;
    } catch (error) {
      console.error("Error fetching data:", error);
      return false;
    }
  }

  // Remove beers with null style or weird "Other"-style
  function cleanup(venue: VenueOffering[]) {
    return venue.map((menu) => {
      const filteredBeers = menu.beers.filter(
        (beer) =>
          beer.beer.beer_style !== null && beer.beer.beer_style !== "Other"
      );

      return {
        ...menu,
        beers: filteredBeers,
      };
    });
  }

  const searchForVenues = debounce((query) => {
    if (!query || query === "") {
      setVenues([]);
      setVenueBeers([]);

      return;
    }

    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      if (!query || query === "") {
        setVenues([]);
        setVenueBeers([]);

        return;
      }

      setVenuesLoading(true);

      fetch(`${apiBase}/search/venue?q=${query}&access_token=${accessToken}`)
        .then((response) => response.json())
        .then(async (data) => {
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

            // Add MBCC if relevant
            // await isMBCCSeason().then((isMBCCSeason) => {
            //   if (isMBCCSeason) {
            //     sorted.unshift(mbcc);
            //   }
            // });

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
      const { venue_id, venue_name, venue_slug, is_verified } = venue;
      const isVenueMBCC = venue_id === 99991337;

      let url = `${apiBase}/inventory/view/${venue_id}?hasNotHadBefore=true&access_token=${accessToken}`;

      // Handle special case MBCC
      if (isVenueMBCC) {
        url = "api/mbcc";
      }

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const venue: VenueOffering[] = [];

          if (isVenueMBCC) {
            Object.keys(data).forEach((session: string) => {
              const list: FullBeer[] = [];
              data[session].forEach((beer: any) => list.push(beer)); // TODO: Fix any

              venue.push({
                beers: list,
                menu: session,
                venueId: venue_id,
                venueName: venue_name,
                venueSlug: venue_slug,
                isVerified: is_verified,
              });
            });
          } else {
            data.response.items.forEach((e: MenuItem) => {
              const list: FullBeer[] = [];

              e.menu.sections.items.forEach((menu: Menu) =>
                list.push(...menu.items)
              );

              venue.push({
                beers: list,
                menu: e.menu.menu_name,
                venueId: venue_id,
                venueName: venue_name,
                venueSlug: venue_slug,
                isVerified: is_verified,
              });
            });
          }

          const cleanedBeers = cleanup(venue);

          setVenueBeers(cleanedBeers);
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
