import { Box, Typography, Card, CardActionArea } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

import Image from "next/image";
import deepLinker from "@/utils/deepLinkFromBrowser";

import styles from "./BeerPanel.module.css";

interface Props {
  beer: SearchableBeer;
}

export default function BeerPanel({ beer }: Props) {
  const clickHandler = () => {
    const { bid, beer_slug } = beer;
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
  };

  return (
    <Card onClick={clickHandler}>
      <CardActionArea sx={{ p: 1 }}>
        <Grid container spacing={2}>
          <Grid
            xs={2}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {beer && (
              <Image
                src={beer.beer_label}
                alt={beer.beer_name}
                fill={true}
                className={styles.image}
              />
            )}
          </Grid>
          <Grid
            xs={7}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontSize: 15 }}>
              {beer.beer_name}
            </Typography>
            <Typography variant="h5" sx={{ fontSize: 12 }}>
              {beer.brewery_name}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: 12, fontWeight: "bold" }}>
              {beer.beer_style}
            </Typography>
          </Grid>
          <Grid
            xs={3}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {beer.hadStyle ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ fontSize: 25 }}>🤷‍♂️</Box>
                <Typography sx={{ fontSize: 12 }}>Style: Yes</Typography>
                <Typography sx={{ fontSize: 12 }}>
                  Beer: {beer.hadStyle ? "Yes" : "No"}
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
                <Box sx={{ fontSize: 25 }}>👍</Box>
                <Typography sx={{ fontSize: 12 }}>Style: No</Typography>
                <Typography sx={{ fontSize: 12 }}>
                  Beer: {beer.hadStyle ? "Yes" : "No"}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
