import { useState } from "react";

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
import deepLinker from "../../utils/deepLinkFromBrowser";

function BeersTable({ data, styles, getVenueBeersLoading, selectedVenue }) {
  const [value, setValue] = useState(0);

  const hasHad = (styleName) => {
    return styles.find((style) => style.style_name === styleName).had;
  };

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const clickHandler = (beerId, beerSlug) => {
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

  function TabPanel(props) {
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
    <div sx={{ mt: 3 }}>
      {getVenueBeersLoading ? (
        <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : null}

      {data.length === 0 && selectedVenue && !getVenueBeersLoading && (
        <Typography sx={{ fontStyle: "italic", my: 2 }}>
          You've had all the styles offered at this venue
        </Typography>
      )}

      {data.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            {data.map((menu) => (
              <Tab label={menu.menu} />
            ))}
          </Tabs>
        </Box>
      )}

      {data.map((menu, index) => (
        <TabPanel value={value} index={index}>
          {menu.beers.map((beer) => {
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
    </div>
  );
}

export default BeersTable;
