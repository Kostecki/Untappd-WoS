import { useEffect, useState } from "react";
import { useStyles } from "@/context/styles";
import {
  List,
  ListItem,
  ListItemButton,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useVenues } from "@/context/venues";
import deepLinker from "../../utils/deepLinkFromBrowser";

interface Props {
  selectedVenue: Venue;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function BeersTable({ selectedVenue }: Props) {
  const [value, setValue] = useState(0);

  const { styles } = useStyles();
  const { venueBeers, venueBeersLoading } = useVenues();

  const hasHad = (styleName: string) => {
    return styles.find((style: Style) => style.style_name === styleName)?.had;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const clickHandler = (beerId: number, beerSlug: string) => {
    const appUrl = `untappd://beer/${beerId}`;
    const webUrl = `https://untappd.com/b/${beerSlug}/${beerId}`;

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

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 2 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {venueBeersLoading ? (
        <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : null}

      {venueBeers.length === 0 && selectedVenue && !venueBeersLoading && (
        <Typography sx={{ fontStyle: "italic", my: 2 }}>
          You&apos;ve had all the styles offered at this venue
        </Typography>
      )}

      {venueBeers.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            {venueBeers.map((venue: VenueOffering, index: number) => (
              <Tab label={venue.menu} key={index} />
            ))}
          </Tabs>
        </Box>
      )}

      {venueBeers.map((menu: VenueOffering, index: number) => (
        <TabPanel value={value} index={index} key={index}>
          {menu.beers.map((beer: FullBeer) => {
            if (!beer.beer.has_had && !hasHad(beer.beer.beer_style)) {
              const beerId = beer.beer.bid;
              const beerSlug = beer.beer.beer_slug;
              const beerName = beer.beer.beer_name;
              const beerStyle = beer.beer.beer_style;
              const breweryName = beer.brewery.brewery_name;

              return (
                <List disablePadding key={beerId}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => clickHandler(beerId, beerSlug)}
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
                              {beerName}{" "}
                            </Box>
                            <Box component="span" sx={{ fontStyle: "italic" }}>
                              ({beerStyle})
                            </Box>
                          </Box>
                          <Box>{breweryName}</Box>
                        </Box>
                        <OpenInNewIcon sx={{ opacity: 0.5 }} />
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                </List>
              );
            } else {
              return "";
            }
          })}
        </TabPanel>
      ))}
    </Box>
  );
}
