import { Card, Collapse, Divider, Group, Stack, Text } from "@mantine/core";
import { BeerCard } from "../BeerCard";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import "./style.css";
import { Fragment } from "react/jsx-runtime";

export const VenueBeerCard = ({
  group,
  startOpen,
}: {
  group: { beer_style: string; beers: SectionItem[] };
  startOpen: boolean;
}) => {
  const [opened, { toggle }] = useDisclosure(startOpen);

  return (
    <Card mb="md">
      <Group
        justify="space-between"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={toggle}
        className="venue-beer-card-group"
      >
        <Text fw="500">
          {group.beer_style} ({group.beers.length})
        </Text>
        {opened ? (
          <IconChevronDown size={20} color="gray" stroke={1.5} />
        ) : (
          <IconChevronUp size={20} color="gray" stroke={1.5} />
        )}
      </Group>

      <Stack gap="0">
        <Collapse in={opened}>
          <Divider mt="xs" mb="sm" />

          {group.beers.map((beer, index) => {
            return (
              <Fragment key={beer.beer.bid}>
                <BeerCard key={beer.beer.bid} beerItem={beer} />
                {index < group.beers.length - 1 && <Divider my="sm" />}
              </Fragment>
            );
          })}
        </Collapse>
      </Stack>
    </Card>
  );
};
