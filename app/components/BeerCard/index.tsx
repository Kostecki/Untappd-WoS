import { Card, Flex, Group, Rating, Stack, Text } from "@mantine/core";
import { IconCircleFilled, IconExternalLink } from "@tabler/icons-react";

import countryToEmoji from "~/countries";

import "./style.css";

export const BeerCard = ({ beerItem }: { beerItem: any }) => {
  const {
    beer: { bid, beer_name, beer_slug, beer_abv, beer_style, rating_score },
    brewery: { brewery_name, country_name },
  } = beerItem;

  return (
    <Card
      component="a"
      href={`https://untappd.com/b/${beer_slug}/${bid}`}
      target="_blank"
      mb="sm"
      className="beer-card"
    >
      <Flex justify="space-between">
        <Stack gap="0">
          <Stack gap={0} mb="xs">
            <Text mr="xs">{beer_name}</Text>
            <Text size="sm" fs="italic" c="gray">
              {beer_style}
            </Text>
          </Stack>
          <Group gap={5}>
            <Text size="xs">{beer_abv}% ABV</Text>
            <Text size="xs">•</Text>
            <Text size="xs">{brewery_name}</Text>
            <Text size="xs">{countryToEmoji(country_name)}</Text>
            <Text size="xs">•</Text>
            <Text size="xs">
              <Group gap={0}>
                <Rating
                  value={rating_score}
                  fractions={10}
                  size="xs"
                  mt="-2px"
                  mr="6"
                  readOnly
                  emptySymbol={<IconCircleFilled color="#d8d8d8" size={12} />}
                  fullSymbol={<IconCircleFilled color="#ffc100" size={12} />}
                />
                <Text size="xs">({rating_score.toFixed(2)})</Text>
              </Group>
            </Text>
          </Group>
        </Stack>
        <Stack gap="0">
          <IconExternalLink size={16} />
        </Stack>
      </Flex>
    </Card>
  );
};
