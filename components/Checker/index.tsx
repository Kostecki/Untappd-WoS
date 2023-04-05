import React, { useState, useEffect } from "react";

import { Box, Typography, Divider, IconButton } from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import BeerSearch from "../BeerSearch";
const BarcodeScannerComponent = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

export default function Checker() {
  const { data: session } = useSession();

  const [barcode, setBarcode] = useState("");
  const [beers, setBeers] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const [data, setData] = useState("Not Found");

  const enableScanner = false;

  const fetchBeers = () => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      fetch(
        `${apiBase}/beer/checkbarcodemultiple?upc=${barcode}&access_token=${accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          const resp = data.response.items;

          console.log("fetched");

          if (resp?.length) {
            const result = resp.filter((beer: any) => !beer.beer.has_had);
            setBeers(result);
            console.log("result", result);
          } else {
            setBeers([]);
            console.log("no results");
          }
        });
    }
  };

  useEffect(() => {
    if (enableScanner) {
      fetchBeers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Check Beer</Typography>

        <IconButton aria-label="logout">
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
              We couldn&apos;t find any beers that match the barcode.
            </Typography>
          </>
        )}
        {barcode && !beers.length && !noResult && (
          <>
            <Typography variant="h6">No New Style</Typography>
            <Typography>You&apos;ve already had this style</Typography>
          </>
        )}
        {barcode && beers.length >= 1 && (
          <>
            <Typography>There are new styles!</Typography>
            {/* {beers.map((beer) => (
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
            ))} */}
          </>
        )}
        <>
          {enableScanner && (
            <Box>
              <BarcodeScannerComponent
                width={"100%"}
                height={"100%"}
                onUpdate={(_err, result) => {
                  if (result) {
                    setBarcode(result.getText());
                  }
                }}
              />
              <p>{data}</p>
            </Box>
          )}
          <BeerSearch />
        </>
      </Box>
    </>
  );
}
