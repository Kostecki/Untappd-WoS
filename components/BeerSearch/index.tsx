import { useState } from "react";

import { Box, TextField, Autocomplete, CircularProgress } from "@mui/material";

import { useBeers } from "@/context/beers";

import BeerPanel from "../BeerPanel";

interface BeerPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function BeerSearch() {
  const [selectedBeer, setSelectedBeer] = useState<SearchableBeer | null>(null);

  const { beers, beersLoading, searchForBeers } = useBeers();

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
      <Box>{selectedBeer && <BeerPanel beer={selectedBeer} />}</Box>
    </>
  );
}
