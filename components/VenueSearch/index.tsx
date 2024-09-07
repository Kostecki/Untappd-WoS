import { useEffect, useState } from "react";

import Image from "next/image";
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Divider,
  Link,
  CircularProgress,
  Paper,
  Stack,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";

import BeersTable from "../BeersTable";
import ValueForMoney from "../ValueForMoney";

import { useVenues } from "@/context/venues";

export default function VenueSearch() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showBestValue, setShowBestValue] = useState(false);

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

  const VerifiedIcon = ({
    isVerifiedExternal,
  }: {
    isVerifiedExternal?: boolean;
  }) => {
    const isVerified = isVerifiedExternal ?? selectedVenue?.is_verified;

    return (
      <Image
        src={isVerified ? "venue-verified.svg" : "venue-verified-bw.svg"}
        height="22"
        width="22"
        alt="Verified Venue"
      />
    );
  };

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
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
            if (!newInputValue) {
              searchForVenues("");
            }

            if (_event.type === "change") {
              searchForVenues(newInputValue);
            }
          }}
          renderOption={(props, option) => {
            return (
              <Box
                component="li"
                {...props}
                key={option.venue_id}
                sx={{ textAlign: "left" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                  <VerifiedIcon isVerifiedExternal={option.is_verified} />
                </Box>
                <Typography>{option.venue_name}</Typography>
                <Typography fontStyle="italic" sx={{ ml: 0.5 }}>
                  ({`${option.venue_city}, ${option.venue_country}`})
                </Typography>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Venues"
              InputProps={{
                ...params.InputProps,
                startAdornment: selectedVenue ? <VerifiedIcon /> : null,
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
      {selectedVenue && venueBeers.length > 0 && venueBeers[0].venueSlug && (
        <>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography>
              <Link
                href={`https://untappd.com/v/${venueBeers[0].venueSlug}/${venueBeers[0].venueId}`}
                target="_blank"
              >
                See menu on Untappd
              </Link>
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={showBestValue}
                    onChange={(event) => setShowBestValue(event.target.checked)}
                  />
                }
                label="Best value beer"
              />
            </FormGroup>
          </Stack>
          {showBestValue && <ValueForMoney venueBeers={venueBeers} />}
        </>
      )}
      <Box>{selectedVenue && <BeersTable selectedVenue={selectedVenue} />}</Box>
    </Paper>
  );
}
