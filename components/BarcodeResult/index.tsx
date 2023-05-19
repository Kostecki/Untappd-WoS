import { Box, List, ListItem, ListItemButton, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useStyles } from "@/context/styles";
import BeerPanel from "../BeerPanel";

interface Props {
  result: FullBeer[];
  barcode: any;
}

export default function BarcodeResult({ result, barcode }: Props) {
  const { styles } = useStyles();

  const haveHad = (styleId: number) => {
    return styles.find((style) => style.style_id === styleId)!.had;
  };

  const filtered = result.map((beer) => {
    const hadStyle = haveHad(beer.beer.beer_style_id);
    const {
      bid,
      beer_name,
      beer_slug,
      beer_style,
      beer_label,
      beer_abv,
      beer_description,
      has_had,
    } = beer.beer;
    const { brewery_id, brewery_name } = beer.brewery;

    return {
      bid,
      beer_name,
      beer_slug,
      beer_style,
      beer_label,
      beer_abv,
      beer_description,
      brewery_id,
      brewery_name,
      hadBeer: has_had,
      hadStyle: hadStyle,
    };
  });

  const NoMatches = () => {
    return (
      <>
        <Typography>
          {`${barcode.value}, ${barcode.type}`} <br />
          We couldn&apos;t find any beers that match the barcode. Try searching
          instead.
        </Typography>
      </>
    );
  };

  const Matches = () => {
    return (
      <>
        {filtered.map((beer) => (
          <BeerPanel key={beer.bid} beer={beer} />
        ))}
      </>
    );
  };

  return <>{result?.length > 0 ? <Matches /> : <NoMatches />}</>;
}
