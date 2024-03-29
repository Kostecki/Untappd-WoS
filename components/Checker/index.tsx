import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";
import SearchIcon from "@mui/icons-material/Search";

import BeerSearch from "../BeerSearch";
import BarcodeResult from "../BarcodeScanner/Result";
import ScannerComponent from "../BarcodeScanner/ScannerComponent";

export default function Checker() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [scanEnabled, setScanEnabled] = useState(false);
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
          setLoading(false);
          setBeers(data.response.items);
        })
        .catch((err) => {
          setLoading(false);
          console.error(err);
        });
    }
  };

  const resetScan = () => {
    console.log("resetScan");
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

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Check Beer</Typography>
        <Box>
          <IconButton onClick={() => setScanEnabled(false)}>
            <SearchIcon />
          </IconButton>
          <IconButton onClick={resetScan}>
            <CropFreeIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ mt: 2, mb: 4 }}>
        <Divider />
      </Box>
      {scanEnabled && (
        <Box>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && barcode && (
            <BarcodeResult result={beers} barcode={barcode} />
          )}
          {!loading && !barcode && (
            <ScannerComponent onSuccess={scanSuccessHandler} />
          )}
        </Box>
      )}
      {!scanEnabled && (
        <Box>
          <BeerSearch />
        </Box>
      )}
    </Paper>
  );
}
