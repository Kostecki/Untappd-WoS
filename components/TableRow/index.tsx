import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
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

import { useStyles } from "@/context/styles";
import Spinner from "../Spinner";

interface Beer {
  bid: number;
  beerId: number;
  beerSlug: string;
  beerName: string;
  breweryName: string;
  breweryCountry: string;
}

type Props = {
  style: Style;
};

export default function TR({ style }: Props) {
  const { data: session } = useSession();
  const { showHaveHad, showOnlyOnList } = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [openRowId, setOpenRowId] = useState<number | undefined>(undefined);
  const [relatedBeers, setRelatedBeers] = useState([]);

  const toggleRow = (_event: React.SyntheticEvent, styleId: number) => {
    if (openRowId === styleId) {
      setOpenRowId(undefined);
    } else {
      setOpenRowId(styleId);
    }
  };

  const loadRelatedBeers = () => {
    if (session?.user) {
      const { apiBase, accessToken } = session.user;

      const lat = 55.67598938197351;
      const lng = 12.56910953092146;
      const radius = 200;
      const type = "local";
      const range = 200;

      setIsLoading(true);

      fetch(
        `${apiBase}/beer/trending?lat=${lat}&lng=${lng}&radius=${radius}&type_id=${style.style_id}&type=${type}&range=${range}&access_token=${accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          const related = data.response.items.map((beer: FullBeer) => {
            return {
              beerName: beer.beer.beer_name,
              beerSlug: beer.beer.beer_slug,
              beerId: beer.beer.bid,
              breweryId: beer.brewery.brewery_id,
              breweryName: beer.brewery.brewery_name,
              breweryCountry: beer.brewery.country_name,
            };
          });

          related.sort((a: Beer, b: Beer) =>
            a.beerName > b.beerName ? 1 : b.beerName > a.beerName ? -1 : 0
          );

          setRelatedBeers(related);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsLoading(false);
        });
    }
  };

  const show = () => {
    if (showOnlyOnList) {
      return !style.had && style.onList;
    } else {
      return showHaveHad || !style.had;
    }
  };

  useEffect(() => {
    if (openRowId) {
      loadRelatedBeers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRowId]);

  return (
    <>
      {show() && (
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
            <TableCell
              component="th"
              scope="row"
              sx={{ fontWeight: "bold", display: "flex" }}
            >
              {style.style_name}{" "}
              {style.onList && (
                <Box sx={{ ml: 1, fontStyle: "italic", opacity: 0.5 }}>
                  (List: {style.onList})
                </Box>
              )}
            </TableCell>
            <TableCell padding="checkbox" align="center">
              <Checkbox
                color="primary"
                checked={style.had}
                indeterminate={style.onList ? true : false}
                disabled
              />
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
                  {relatedBeers.map((beer: Beer) => (
                    <ListItem key={beer.bid}>
                      <ListItemButton
                        href={`https://untappd.com/b/${beer.beerSlug}/${beer.beerId}`}
                        target="_blank"
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
      )}
    </>
  );
}
