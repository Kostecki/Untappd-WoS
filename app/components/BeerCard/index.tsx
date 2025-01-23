import { Card, Flex, Group, Rating, Stack, Text } from "@mantine/core";
import { IconCircleFilled, IconExternalLink } from "@tabler/icons-react";

import "./style.css";

export const BeerCard = ({ beerItem }: { beerItem: any }) => {
  const {
    beer: { bid, beer_name, beer_slug, beer_abv, beer_style, rating_score },
    brewery: { brewery_name },
  } = beerItem;

  return (
    <Card
      component="a"
      href={`https://untappd.com/b/${beer_slug}/${bid}`}
      target="_blank"
      mb="sm"
      className="beer-card"
    >
      <Flex justify="space-between" align="center">
        <Stack gap="0">
          <Group gap="5">
            <Text>{beer_name}, </Text>
            <Text size="sm" fs="italic" c="gray">
              {beer_style}
            </Text>
          </Group>
          <Group gap="5">
            <Text size="xs">{beer_abv}% ABV</Text>
            <Text size="xs">•</Text>
            <Text size="xs">{brewery_name}</Text>
            <Text size="xs">•</Text>
            <Text size="xs">
              <Rating
                value={rating_score}
                fractions={10}
                size="xs"
                mt="-2px"
                readOnly
                emptySymbol={<IconCircleFilled color="#d8d8d8" size={12} />}
                fullSymbol={<IconCircleFilled color="#ffc100" size={12} />}
              />
            </Text>
            <Text size="xs">({rating_score.toFixed(2)})</Text>
          </Group>
        </Stack>
        <Stack gap="0">
          <IconExternalLink size={16} />
        </Stack>
      </Flex>
    </Card>
  );
};
