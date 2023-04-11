import { Box, List, ListItem, ListItemButton, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface Props {
  result: FullBeer[];
}

export default function BarcodeResult({ result }: Props) {
  const newStyles = result.filter((beer: FullBeer) => !beer.beer.has_had);
  const haveHadStyles = result.filter((beer: FullBeer) => beer.beer.has_had);

  const NoMatches = () => {
    return (
      <>
        <Typography sx={{ fontWeight: "bold" }}>
          There are new styles!
        </Typography>
        <Typography>
          We couldn&apos;t find any beers that match the barcode. Try searching
          instead.
        </Typography>
      </>
    );
  };

  const Matches = () => {
    if (newStyles.length > 0) {
      return (
        <>
          <Typography sx={{ fontWeight: "bold" }}>
            There are new styles!
          </Typography>
          <>
            {newStyles.map((beer) => (
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
                          <Box
                            component="span"
                            sx={{ fontStyle: "italic", fontWeight: "bold" }}
                          >
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
            ))}
          </>
        </>
      );
    } else {
      return (
        <>
          <Typography sx={{ fontWeight: "bold" }}>No new styles!</Typography>
          <>
            {haveHadStyles.map((beer) => (
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
                          <Box
                            component="span"
                            sx={{ fontStyle: "italic", fontWeight: "bold" }}
                          >
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
            ))}
          </>
        </>
      );
    }
  };

  return <>{result?.length > 0 ? <Matches /> : <NoMatches />}</>;
}
