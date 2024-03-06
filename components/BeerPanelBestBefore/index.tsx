import { Box, Typography, Card, CardActionArea } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Image from "next/image";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/da";

import styles from "./BeerPanelBestBefore.module.css";

interface Props {
  beer: FullBeer;
}

export default function BeerPanelBestBefore({ beer }: Props) {
  dayjs.locale("da");
  dayjs.extend(LocalizedFormat);
  dayjs.extend(RelativeTime);

  return (
    <Card elevation={0} sx={{ width: "100%" }}>
      <CardActionArea
        href={`https://untappd.com/b/${beer.beer.beer_slug}/${beer.beer.bid}`}
        target="_blank"
        sx={{ py: 1 }}
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
                src={beer.beer.beer_label}
                alt={beer.beer.beer_name}
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
              {beer.beer.beer_name}
            </Typography>
            <Typography variant="h5" sx={{ fontSize: 12 }}>
              {beer.brewery.brewery_name}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: 12, fontWeight: "bold" }}>
              {beer.beer.beer_style}
            </Typography>
          </Grid>
          <Grid
            xs={3}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontSize: 13, fontWeight: "bold" }}>
              Best Before
            </Typography>
            <Typography variant="h6" sx={{ fontSize: 12, fontWeight: 500 }}>
              {dayjs(beer.best_by_date_iso).format("LL")}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontSize: 12, fontStyle: "italic", fontWeight: 400 }}
            >
              {dayjs().to(dayjs(beer.best_by_date_iso))}
            </Typography>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
