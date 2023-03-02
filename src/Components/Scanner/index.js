import React, { useState } from "react";

import {
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { QrScanner } from "@yudiel/react-qr-scanner";

function Scanner({ authData, apiBaseURL }) {
  const [barcode, setBarcode] = useState();
  const [beers, setBeers] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const getBeerInfo = (upc) => {
    console.log("getBeerInfo", upc);
    fetch(
      `${apiBaseURL}/beer/checkbarcodemultiple?upc=${upc}&access_token=${authData.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        const resp = data.response.items;
        if (resp.length) {
          const result = resp.filter((beer) => !beer.beer.has_had);
          setBeers(result);
        } else {
          setNoResult(true);
        }
      });
  };

  const onDecode = (result) => {
    if (barcode !== result) {
      setBarcode(result);
      getBeerInfo(result);
    }
  };

  const reset = () => {
    setBarcode(undefined);
    setBeers([]);
    setNoResult(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Barcode scanner</Typography>

        <IconButton onClick={reset} aria-label="logout">
          <CropFreeIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: 2, mb: 4 }}>
        <Divider />
      </Box>
      <Box>
        {barcode && !beers.length && noResult && (
          <>
            <Typography variant="h6">No Match</Typography>
            <Typography>
              We couldn't find any beers that match the barcode.
            </Typography>
          </>
        )}

        {barcode && !beers.length && !noResult && (
          <>
            <Typography variant="h6">No New Style</Typography>
            <Typography>You've relady had this style</Typography>
          </>
        )}

        {barcode && beers.length >= 1 && (
          <>
            <Typography>There are new styles!</Typography>
            {beers.map((beer) => (
              <List disablePadding key={beer.beer.bid}>
                <ListItem disablePadding>
                  <ListItemButton
                    component="a"
                    href={`https://untappd.com/b/${beer.beer.beer_slug}/${beer.beer.bid}`}
                    target="_blank"
                  >
                    <Typography
                      sx={{
                        display: "inline-flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Box>
                          <Box component="span" sx={{ fontWeight: "500" }}>
                            {beer.beer.beer_name}{" "}
                          </Box>
                          <Box component="span" sx={{ fontStyle: "italic" }}>
                            ({beer.beer.beer_style})
                          </Box>
                        </Box>
                        <Box>{beer.brewery.brewery_name}</Box>
                      </Box>
                      <OpenInNewIcon sx={{ opacity: 0.5 }} />
                    </Typography>
                  </ListItemButton>
                </ListItem>
              </List>
            ))}
          </>
        )}

        {!barcode && (
          <div style={{ width: "100%", height: "auto" }}>
            <QrScanner
              constraints={{ facingMode: "environment" }}
              onDecode={onDecode}
              onError={(error) => console.log(error?.message)}
            />
          </div>
        )}
      </Box>
    </>
  );
}

export default Scanner;
