import { redirect, useLoaderData } from "react-router";
import { Box, Container, Grid } from "@mantine/core";

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

  return (
    <Container size="1200">
      <Grid mt="lg">
        <Grid.Col span={6}>
          <StylesTable styles={stylesInfo.styles} />
        </Grid.Col>
        <Grid.Col span={6}>
          <Profile user={user} stats={stylesInfo.stats} />
          <Box my="md">
            <VenueStyles />
          </Box>
          <CheckBeer />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
