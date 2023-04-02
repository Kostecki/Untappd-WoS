import { useEffect, useState } from "react";

import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Divider,
  Link,
  CircularProgress,
} from "@mui/material";

import BeersTable from "../BeersTable";
import { useVenues } from "@/context/venues";

interface Venue {
  is_closed: string;
  is_verified: true;
  location: string;
  primary_category: string;
  venue_address: string;
  venue_city: string;
  venue_country: string;
  venue_icon: {
    sm: string;
    md: string;
    lg: string;
  };
  venue_id: number;
  venue_name: string;
  venue_slug: string;
  venue_state: string;
}

export default function VenueSearch() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const {
    venues,
    venuesLoading,
    venueBeers,
    searchForVenues,
    fetchVenueBeers,
  } = useVenues();

  useEffect(() => {
    if (selectedVenue) {
      fetchVenueBeers(selectedVenue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVenue]);

  return (
    <>
      <Box>
        <Typography variant="h5">Venue styles</Typography>
      </Box>
      <Box sx={{ mt: 2, mb: 4 }}>
        <Divider />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={venues}
          getOptionLabel={(option) =>
            `${option.venue_name} (${option.venue_city}, ${option.venue_country})`
          }
          noOptionsText="No locations"
          loading={venuesLoading}
          sx={{ width: "100%", mb: 2 }}
          filterOptions={(x) => x}
          isOptionEqualToValue={(option: Venue, value: Venue) =>
            option.venue_id === value.venue_id
          }
          onChange={(_event, newValue) => setSelectedVenue(newValue)}
          onInputChange={(_event, newInputValue) => {
            searchForVenues(newInputValue);
          }}
          renderOption={(props, option) => {
            return (
              <li
                {...props}
                key={option.venue_id}
                style={{ textAlign: "left" }}
              >
                <div>
                  <span className="venue-name">{option.venue_name} </span>
                  <span className="venue-location">
                    ({`${option.venue_city}, ${option.venue_country}`})
                  </span>
                </div>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Venues"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {venuesLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
      {venueBeers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography>
            <Link
              href={`https://untappd.com/v/${venueBeers[0].venueSlug}/${venueBeers[0].venueId}`}
              target="_blank"
            >
              See menu on Untappd
            </Link>
          </Typography>
        </Box>
      )}
      <Box>{selectedVenue && <BeersTable selectedVenue={selectedVenue} />}</Box>
    </>
  );
}
