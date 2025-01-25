import { redirect, useLoaderData } from "react-router";
import { Box, Container, Grid } from "@mantine/core";
import { useEffect, useLayoutEffect, useState } from "react";

import { userSessionGet } from "~/auth/user.server";
import { getSettings, setSettings, Settings } from "~/utils";

import { getStylesInfo, getUserLists } from "./loader";

import { Profile } from "~/components/Profile";
import { VenueStyles } from "~/components/VenueStyles";
import { CheckBeer } from "~/components/CheckBeer";
import { StylesTable } from "~/components/StylesTable";

import type { Route } from "./+types/index";

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

  const latestCommit = {
    hash: process.env.LATEST_COMMIT_HASH ?? "No commit hash",
    message: process.env.LATEST_COMMIT_MESSAGE ?? "No commit message",
  };

  const isProd = import.meta.env.PROD;

  return { user, stylesInfo, userLists, latestCommit, isProd };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const { user, stylesInfo, userLists, latestCommit, isProd } = data;

  const [profileFilters, setProfileFilters] = useState<Filters>({
    showHaveHad: false,
    showOnlyMissingOnList: false,
  });
  const [stockList, setStockList] = useState<StockList | undefined>(undefined);
  const [stockListStyleIds, setStockListStyleIds] = useState<number[]>([]);

  useLayoutEffect(() => {
    const settings = getSettings();

    if (Object.keys(settings).length === 0 && settings.constructor === Object) {
      setSettings(Settings.STOCK_LIST, { listId: "", listName: "" });
      setSettings(Settings.TABLE_FILTERS, profileFilters);
    } else {
      setStockList(settings.stockList);
      setProfileFilters(settings.tableFilters);
    }

    if (isProd) {
      umami.identify({ email: user.email });
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
          (styleList: StyleList) => styleList.type_id
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
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 2, lg: 1 }}>
          <StylesTable styles={filteredStyles} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 1, lg: 2 }}>
          <Profile
            user={user}
            stats={stylesInfo.stats}
            userLists={userLists}
            stockList={stockList}
            setStockList={setStockList}
            profileFilters={profileFilters}
            setProfileFilters={setProfileFilters}
            latestCommit={latestCommit}
          />
          <Box my="md">
            <VenueStyles styles={stylesInfo.styles} />
          </Box>
          <CheckBeer styles={stylesInfo.styles} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
