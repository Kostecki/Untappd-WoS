import React, { useState, useEffect } from "react";

import {
  TableCell,
  TableRow,
  Checkbox,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
} from "@mui/material";

import Spinner from "../Spinner";

function TR({ style, apiBaseURL, authData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [openRowId, setOpenRowId] = useState(undefined);
  const [relatedBeers, setRelatedBeers] = useState([]);

  const toggleRow = (event, styleId) => {
    if (openRowId === styleId) {
      setOpenRowId(undefined);
    } else {
      setOpenRowId(styleId);
    }
  };

  const loadRelatedBeers = () => {
    const lat = 55.67598938197351;
    const lng = 12.56910953092146;
    const radius = 200;
    const type = "local";
    const range = 200;

    setIsLoading(true);

    fetch(
      `${apiBaseURL}/beer/trending?lat=${lat}&lng=${lng}&radius=${radius}&type_id=${style.style_id}&type=${type}&range=${range}&access_token=${authData.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        const related = data.response.items.map((beer) => {
          return {
            beerName: beer.beer.beer_name,
            beerSlug: beer.beer.beer_slug,
            beerId: beer.beer.bid,
            breweryId: beer.brewery.brewery_id,
            breweryName: beer.brewery.brewery_name,
            breweryCountry: beer.brewery.country_name,
            link: `https://untappd.com/b/${beer.beer.beer_slug}/${beer.beer.bid}`,
          };
        });

        related.sort((a, b) =>
          a.beerName > b.beerName ? 1 : b.beerName > a.beerName ? -1 : 0
        );

        setRelatedBeers(related);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (openRowId) {
      loadRelatedBeers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRowId]);

  return (
    <>
      <TableRow
        hover
        onClick={(event) => toggleRow(event, style.style_id)}
        sx={{
          cursor: "pointer",
          userSelect: "none",
          "&:last-child td, &:last-child th": {
            border: 0,
          },
        }}
      >
        <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
          {style.style_name}
        </TableCell>
        <TableCell padding="checkbox" align="center">
          <Checkbox color="primary" checked={style.had} disabled />
        </TableCell>
      </TableRow>
      <TableRow>
        <Collapse
          in={openRowId === style.style_id}
          timeout="auto"
          unmountOnExit
        >
          {isLoading && (
            <Box sx={{ display: "flex", m: 2, height: 60, width: 60 }}>
              <Spinner />
            </Box>
          )}
          {!isLoading && (
            <List dense={true}>
              {relatedBeers.map((beer) => (
                <ListItem key={beer.bid}>
                  <ListItemButton
                    component="a"
                    href={beer.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ListItemText
                      primary={`${beer.beerName}`}
                      secondary={`${beer.breweryName}, ${beer.breweryCountry}`}
                    ></ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {!isLoading && relatedBeers.length === 0 && (
            <Box sx={{ ml: 3, my: 2, mr: 2, textAlign: "left" }}>
              <Typography>No beers found</Typography>
            </Box>
          )}
        </Collapse>
      </TableRow>
    </>
  );
}

export default TR;
