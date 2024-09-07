import { Box, CardContent, Grid, Typography } from "@mui/material";

type Props = {
  venueBeers: VenueOffering[];
};

const UK_PINT_TO_ML = 568;

export default function ValueForMoney({ venueBeers }: Props) {
  const sortedBeers = venueBeers
    .flatMap((menu) => menu.beers)
    .filter((beer) => beer.price.value !== "N/A")
    .map((beer) => {
      const priceValue = parseFloat(beer.price.value.replace(/[^0-9.-]+/g, ""));

      const servingType = beer.serving_type.toLowerCase();

      let servingSize = 0;
      if (servingType === "pint") {
        servingSize = UK_PINT_TO_ML;
      } else {
        const servingSizeMatch = servingType.match(/(\d+(\.\d+)?)(ml|cl)/);

        if (servingSizeMatch) {
          const amount = parseFloat(servingSizeMatch[1]);
          const unit = servingSizeMatch[3];
          if (unit === "cl") {
            servingSize = amount * 10;
          } else {
            servingSize = amount;
          }
        }
      }

      const totalAlcoholContent = (beer.beer.beer_abv / 100) * servingSize;
      const valueForMoney = totalAlcoholContent / priceValue;

      return {
        ...beer,
        price: {
          ...beer.price,
          value: priceValue,
        },
        servingSize,
        totalAlcoholContentMl: totalAlcoholContent,
        valueForMoney,
      };
    })
    .sort((a, b) => b.valueForMoney - a.valueForMoney);

  const topBeers = sortedBeers.slice(0, 2);

  const BestValueBeer = ({ beer }: { beer: any }) => {
    // TODO: Fix any
    const {
      beer: { beer_name, beer_abv },
      price: { value, currency },
      servingSize,
      totalAlcoholContentMl,
      brewery: { brewery_name },
    } = beer;

    return (
      <CardContent>
        <Typography variant="h6" component="div">
          {beer_name}
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 1, fontSize: 15 }}>
          {brewery_name}
        </Typography>
        <Typography variant="body2">
          {value} {currency} for {servingSize} ml
          <br />
          <Typography
            gutterBottom
            sx={{ color: "text.secondary", fontSize: 14, fontStyle: "italic" }}
          >
            {Math.round(totalAlcoholContentMl * 100) / 100} ml. of alcohol (
            {beer_abv}%)
          </Typography>
        </Typography>
      </CardContent>
    );
  };

  return (
    <Grid
      container
      spacing={0}
      sx={{
        textAlign: "center",
      }}
    >
      {topBeers.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            width: "100%",
            fontStyle: "italic",
            mt: 2,
          }}
        >
          No beers with prices ¯\_(ツ)_/¯
        </Box>
      )}
      {topBeers.map((beer, index) => (
        <Grid key={index} item xs={12 / topBeers.length}>
          <BestValueBeer beer={beer} />
        </Grid>
      ))}
    </Grid>
  );
}
