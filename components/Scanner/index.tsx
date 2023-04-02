import React, { useState } from "react";

import { Box, Typography, Divider, IconButton } from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import dynamic from "next/dynamic";
const BarcodeScannerComponent = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

export default function Scanner() {
  const [barcode, setBarcode] = useState();
  const [beers, setBeers] = useState([]);
  const [noResult, setNoResult] = useState(false);

  const [data, setData] = useState("Not Found");

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
            <Typography>You&apos;ve relady had this style</Typography>
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
          <BarcodeScannerComponent
            width={300}
            height={300}
            onUpdate={(err, result) => {
              if (err) console.log(err);
              if (result) setData(result.getText());
              else setData("Not Found");
            }}
          />
          <p>{data}</p>
        </>
      </Box>
    </>
  );
}
