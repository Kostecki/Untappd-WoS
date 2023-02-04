import { useState } from "react";

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

import "./VenueSearch.css";

function VenueSearch({
  options,
  getVenueBeers,
  searchVenues,
  venueBeers,
  styles,
  getVenuesLoading,
  getVenueBeersLoading,
}) {
  const [selectedVenue, setSelectedVenue] = useState(undefined);
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
          options={options}
          getOptionLabel={(option) =>
            `${option.venue_name} (${option.venue_city}, ${option.venue_country})`
          }
          noOptionsText="No locations"
          loading={getVenuesLoading}
          sx={{ width: "100%", mb: 2 }}
          filterOptions={(x) => x}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_event, newValue) => {
            setSelectedVenue(newValue);
            getVenueBeers(newValue);
          }}
          onInputChange={(_event, newInputValue) => searchVenues(newInputValue)}
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
                    {getVenuesLoading ? (
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
              View on Untappd
            </Link>
          </Typography>
        </Box>
      )}
      <Box>
        <BeersTable
          data={venueBeers}
          styles={styles}
          getVenueBeersLoading={getVenueBeersLoading}
          selectedVenue={selectedVenue}
        />
      </Box>
    </>
  );
}

export default VenueSearch;
