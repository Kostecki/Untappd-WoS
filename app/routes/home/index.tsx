import { redirect, useLoaderData } from "react-router";
import { Box, Container, Grid } from "@mantine/core";
import { useEffect, useLayoutEffect, useState } from "react";

import { userSessionGet } from "~/auth/user.server";

import { getStylesInfo, getUserLists } from "./loader";

import { Profile } from "~/components/Profile";
import { VenueStyles } from "~/components/VenueStyles";
import { CheckBeer } from "~/components/CheckBeer";
import { StylesTable } from "~/components/StylesTable";

import type { Route } from "./+types/index";
import { getSettings } from "~/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Wheel of Styles" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await userSessionGet(request);

  if (!user) {
    throw redirect("/login");
  }

  const stylesInfo = await getStylesInfo(user);
  const userLists = await getUserLists(user);

  return { user, stylesInfo, userLists };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const { user, stylesInfo, userLists } = data;

  const [profileFilters, setProfileFilters] = useState<Filters>({
    showHaveHad: false,
    showOnlyMissingOnList: false,
  });
  const [stockList, setStockList] = useState<StockList | undefined>(undefined);
  const [stockListStyleIds, setStockListStyleIds] = useState<number[]>([]);

  useLayoutEffect(() => {
    const settings = getSettings();

    if (settings) {
      setStockList(settings.stockList);
      setProfileFilters(settings.tableFilters);
    }
  }, []);

  useEffect(() => {
    const fetchListDetails = async () => {
      if (stockList) {
        const listDetailsResponse = await fetch(
          `/api/list/${stockList.listId}`
        );
        const listDetails = await listDetailsResponse.json();
        const listBeerStyles = listDetails.map(
          (beer: FullBeer) => beer.beer.beer_style_id
        );

        setStockListStyleIds(listBeerStyles);
      }
    };

    fetchListDetails();
  }, [stockList]);

  const filteredStyles = stylesInfo.styles.filter((style) => {
    if (profileFilters.showHaveHad) {
      // Show all styles, ignoring other filters
      return true;
    }

    if (profileFilters.showOnlyMissingOnList) {
      // Show only missing styles that are also in the stock list
      return !style.had && stockListStyleIds.includes(style.styleId);
    }

    // Default: Show only missing styles
    return !style.had;
  });

  return (
    <Container size="1200">
      <Grid mt="lg">
        <Grid.Col span={6}>
          <StylesTable styles={filteredStyles} />
        </Grid.Col>
        <Grid.Col span={6}>
          <Profile
            user={user}
            stats={stylesInfo.stats}
            userLists={userLists}
            stockList={stockList}
            setStockList={setStockList}
            profileFilters={profileFilters}
            setProfileFilters={setProfileFilters}
          />
          <Box my="md">
            <VenueStyles />
          </Box>
          <CheckBeer />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
