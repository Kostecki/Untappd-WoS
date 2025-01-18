import { redirect, useLoaderData } from "react-router";
import { Box, Container, Grid } from "@mantine/core";

import { userSessionGet } from "~/auth/user.server";

import { Profile } from "~/components/Profile";
import { VenueStyles } from "~/components/VenueStyles";

import type { Route } from "./+types/home";
import { CheckBeer } from "~/components/CheckBeer";
import { StyleTable } from "~/components/StyleTable";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Wheel of Styles" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await userSessionGet(request);

  if (!user) {
    throw redirect("/login");
  }

  return { user };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const { user } = data;

  return (
    <Container size="1200">
      <Grid mt="lg">
        <Grid.Col span={6}>
          <StyleTable />
        </Grid.Col>
        <Grid.Col span={6}>
          <Profile user={user} />
          <Box my="md">
            <VenueStyles />
          </Box>
          <CheckBeer />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
