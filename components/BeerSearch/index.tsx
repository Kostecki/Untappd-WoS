import { useEffect, useState } from "react";

import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Card,
  CardActionArea,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import { useBeers } from "@/context/beers";
import Image from "next/image";
import deepLinker from "@/utils/deepLinkFromBrowser";

import styles from "./BeerSearch.module.css";

interface BeerPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function BeerSearch() {
  const [selectedBeer, setSelectedBeer] = useState<SearchableBeer | null>(null);

  const { beers, beersLoading, searchForBeers } = useBeers();

  const clickHandler = () => {
    if (selectedBeer) {
      const { bid, beer_slug } = selectedBeer;
      const appUrl = `untappd://beer/${bid}`;
      const webUrl = `https://untappd.com/b/${beer_slug}/${bid}`;

      if ("ontouchstart" in document.documentElement) {
        const linker = new deepLinker({
          onIgnored: function () {
            window.open(webUrl, "_blank");
          },
        });

        linker.openURL(appUrl);
      } else {
        window.open(webUrl, "_blank");
      }
    }
  };

  function BeerPanel() {
    return (
      <Card onClick={clickHandler}>
        <CardActionArea sx={{ p: 1 }}>
          <Grid container spacing={3}>
            <Grid
              xs={2}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {selectedBeer && (
                <Image
                  src={selectedBeer.beer_label}
                  alt={selectedBeer.beer_name}
                  fill={true}
                  className={styles.image}
                />
              )}
            </Grid>
            <Grid
              xs={5}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" sx={{ fontSize: 25 }}>
                {selectedBeer?.beer_name}
              </Typography>
              <Typography variant="h5" sx={{ fontSize: 18 }}>
                {selectedBeer?.brewery_name}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: 16 }}>
                {selectedBeer?.beer_style}
              </Typography>
            </Grid>
            <Grid
              xs={5}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {selectedBeer?.hadStyle ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <ThumbDownIcon />
                  <Typography sx={{ mt: 1 }}>
                    Style: Have already had
                  </Typography>
                  <Typography>
                    Beer:{" "}
                    {selectedBeer?.hadBeer
                      ? "Have already had"
                      : "Have not had"}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <ThumbUpIcon />
                  <Typography sx={{ mt: 1 }}>Style: Have not had</Typography>
                  <Typography>
                    Beer:{" "}
                    {selectedBeer?.hadBeer
                      ? "Have already had"
                      : "Have not had"}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={beers}
        getOptionLabel={(option) =>
          `${option.beer_name}, ${option.brewery_name} - ${option.beer_style}`
        }
        noOptionsText="No beers"
        loading={beersLoading}
        sx={{ width: "100%", mb: 2 }}
        filterOptions={(x) => x}
        isOptionEqualToValue={(option: SearchableBeer, value: SearchableBeer) =>
          option.bid === value.bid
        }
        onChange={(_event, newValue) => setSelectedBeer(newValue)}
        onInputChange={(_event, newInputValue) => {
          searchForBeers(newInputValue);
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.bid} style={{ textAlign: "left" }}>
              <div>
                {option.beer_name}, {option.brewery_name} ({option.beer_style})
              </div>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Beers"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {beersLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <Box>{selectedBeer && <BeerPanel />}</Box>
    </>
  );
}
