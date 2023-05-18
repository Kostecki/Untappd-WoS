import { Box, Typography, Card, CardActionArea } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Image from "next/image";

import { useStyles } from "@/context/styles";

import styles from "./BeerPanel.module.css";

interface Props {
  beer: SearchableBeer;
}

export default function BeerPanel({ beer }: Props) {
  const { styles: stylesList } = useStyles();

  const onList = () =>
    stylesList.find((style: Style) => style.style_name === beer.beer_style)
      ?.onList;

  return (
    <Card>
      <CardActionArea
        href={`https://untappd.com/b/${beer.beer_slug}/${beer.bid}`}
        target="_blank"
        sx={{ p: 1 }}
      >
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
            {onList() && (
              <Typography
                sx={{ fontSize: 12, fontStyle: "italic", mt: 0.5 }}
              >{`List: ${onList()}`}</Typography>
            )}
          </Grid>
          <Grid
            xs={3}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ fontSize: 25 }}>{`${
                beer.hadStyle ? "🤷‍♂️" : "👍"
              } `}</Box>
              <Typography sx={{ fontSize: 12 }}>{`Style: ${
                beer.hadStyle ? "Yes" : "No"
              }`}</Typography>
              <Typography sx={{ fontSize: 12 }}>
                Beer: {beer.hadBeer ? "Yes" : "No"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
