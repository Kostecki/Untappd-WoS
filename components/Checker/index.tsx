import React, { useState, useEffect } from "react";

import { Box, Typography, Divider, IconButton } from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";
import SearchIcon from "@mui/icons-material/Search";

import { useSession } from "next-auth/react";
import BeerSearch from "../BeerSearch";
import BarcodeScanner from "../BarcodeScanner";
import BarcodeResult from "../BarcodeResult";
import { useMobileMode } from "@/context/mobileMode";

export default function Checker() {
  const { data: session } = useSession();
  const { mobileMode } = useMobileMode();

  const [loading, setLoading] = useState(false);
  const [scanEnabled, setScanEnabled] = useState(true);
  const [barcode, setBarcode] = useState<Barcode | undefined>(undefined);
  const [beers, setBeers] = useState([]);

  const scanSuccessHandler = (result: Barcode) => {
    setBarcode(result);
  };

  const fetchBeers = () => {
    if (session?.user && barcode) {
      const { apiBase, accessToken } = session.user;

      setLoading(true);

      // For some reason Untappd handles all barcodes as UPC
      fetch(
        `${apiBase}/beer/checkbarcodemultiple?upc=${barcode?.value}&access_token=${accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          setBeers(data.response.items);
          setLoading(false);
        });
    }
  };

  const resetScan = () => {
    setScanEnabled(true);
    setBarcode(undefined);
    setBeers([]);
  };

  useEffect(() => {
    if (barcode) {
      fetchBeers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode]);

  useEffect(() => {
    if (mobileMode) {
      setScanEnabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        {mobileMode && (
          <Box>
            <IconButton onClick={() => setScanEnabled(false)}>
              <SearchIcon />
            </IconButton>
            <IconButton onClick={resetScan}>
              <CropFreeIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 2, mb: 4 }}>
        <Divider />
      </Box>
      {scanEnabled && (
        <Box>
          <>
            {barcode && <BarcodeResult result={beers} />}
            {!barcode && (
              <BarcodeScanner
                paused={!scanEnabled}
                onSuccess={scanSuccessHandler}
              />
            )}
          </>
        </Box>
      )}
      {!scanEnabled && (
        <Box>
          <BeerSearch />
        </Box>
      )}
    </>
  );
}
