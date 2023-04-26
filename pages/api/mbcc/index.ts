import type { NextApiRequest, NextApiResponse } from "next";
const jsonURL = "https://mbcc.jonpacker.com/latest.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessions = ["yellow", "blue", "red", "green"];

  const beers = await fetch(jsonURL)
    .then((res) => res.json())
    .then((data) => data.beers);

  const transformed = beers.map((beer: any) => {
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

  const filtered = transformed.filter((beer: any) =>
    sessions.includes(beer.session)
  );

  const splitBySession = filtered.reduce((acc: any, obj: any) => {
    const key = obj["session"];
    const curGroup = acc[key] ?? [];

    return { ...acc, [key]: [...curGroup, obj] };
  }, {});

  res.status(200).json(splitBySession);
}
