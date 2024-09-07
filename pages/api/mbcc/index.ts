import type { NextApiRequest, NextApiResponse } from "next";
const jsonURL = "https://mbcc.jonpacker.com/latest.json";

const enableMBCC = false;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessions = ["yellow", "blue", "red", "green"];

  if (!enableMBCC) {
    res.status(200).json({});
    return;
  }

  const beers = await fetch(jsonURL)
    .then((res) => res.json())
    .then((data) => data.beers)
    .catch((err) => {
      console.error(err);
      res.status(400).json([]);
    });

  const transformed = beers.map((beer: JonPackerBeer) => {
    return {
      beer: {
        bid: beer.ut_bid,
        beer_name: beer.name,
        beer_style: beer.superstyle,
      },
      brewery: {
        brewery_name: beer.brewery,
      },
      session: beer.session,
    };
  });

  const filtered = transformed.filter((beer: JonPackerBeerFiltered) =>
    sessions.includes(beer.session)
  );

  const splitBySession = filtered.reduce(
    (
      acc: { [key: string]: JonPackerBeerFiltered[] },
      obj: JonPackerBeerFiltered
    ) => {
      const key = obj["session"];
      const curGroup = acc[key] ?? [];

      return { ...acc, [key]: [...curGroup, obj] };
    },
    {}
  );

  res.status(200).json(splitBySession);
}
