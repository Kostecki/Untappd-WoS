import { redirect, useLoaderData } from "react-router";
import { Box, Container, Grid } from "@mantine/core";
import { useState } from "react";

import { userSessionGet } from "~/auth/user.server";

import { getStylesInfo } from "./loader";

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

  return { user, stylesInfo };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const { user, stylesInfo } = data;

  const [profileFilters, setProfileFilters] = useState<Filters>({
    showHaveHad: false,
    showOnlyMissingOnList: false,
  });

  const filteredStyles = stylesInfo.styles.filter(
    (style) => profileFilters.showHaveHad || !style.had
  );

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
            setProfileFilters={setProfileFilters}
            profileFilters={profileFilters}
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
