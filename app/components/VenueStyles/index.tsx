import {
  Anchor,
  Box,
  Card,
  Divider,
  Stack,
  Tabs,
  Text,
  type ComboboxStore,
} from "@mantine/core";
import { useState } from "react";

import { SearchSelect } from "../SearchSelect";
import { VenueBeerCard } from "../VenueBeerCard";

interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
}

const TEST = false;

export const VenueStyles = ({ styles }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueDetails | undefined>(
    undefined
  );
  const [venueDetails, setVenueDetails] = useState<
    FlattednedMenuData[] | undefined
  >(undefined);

  const handleVenueSelect = async (
    inputDataList?: VenueDetails[] | BeerStringSearchResponse[],
    _barcode?: number,
    optionValue?: string,
    combobox?: ComboboxStore
  ) => {
    setLoading(true);

    const venue = inputDataList?.find(
      (item): item is VenueDetails =>
        "venue_id" in item && String(item.venue_id) === optionValue
    );

    if (venue) {
      setSelectedVenue(venue);

      const haveHadStyleIds = TEST ? [] : styles.map((style) => style.styleId);

      const venueDetails = await fetch(`/api/venue/${venue.venue_id}`);
      const venueDetailsData: VenueMenuDetails[] = await venueDetails.json();

      // Flatten the menu data to have menus with all items from sub-sections and only new styles
      const flattendMenuData = venueDetailsData.map((menu) => {
        return {
          menu_id: menu.menu_id,
          menu_name: menu.menu_name,
          menu_description: menu.menu_description,
          total_item_count: menu.total_item_count,
          created_at: menu.created_at,
          updated_at: menu.updated_at,
          items: menu.sections.items
            .flatMap((section) => section.items)
            .filter(
              (item) =>
                item.beer.beer_style_id !== undefined &&
                !haveHadStyleIds.includes(item.beer.beer_style_id)
            ),
        };
      }) as FlattednedMenuData[];

      setVenueDetails(flattendMenuData);
    }

    setLoading(false);
    combobox?.closeDropdown();
  };

  const groupByStyles = (items: FlattednedMenuData["items"]) => {
    return items
      .reduce<{ beer_style: string; beers: typeof items }[]>((acc, item) => {
        const style = item.beer?.beer_style?.trim() ?? "Unknown";
        let group = acc.find((group) => group.beer_style === style);

        if (!group) {
          group = { beer_style: style, beers: [] };
          acc.push(group);
        }

        group.beers.push(item);
        return acc;
      }, [])
      .sort((a, b) => a.beer_style.localeCompare(b.beer_style));
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="25px" fw="500">
        Venue Styles
      </Text>
      <Text fs="italic" mt="xs" c="dimmed">
        Pick a verified venue to see what new styles they might have
      </Text>

      <Divider mt="xs" mb="lg" />

      <SearchSelect
        apiURL="/api/venues"
        placeholder="Search for a venue"
        emptyText="No venues found"
        loading={loading}
        setLoading={setLoading}
        setSelectedVenue={setSelectedVenue}
        setVenueDetails={setVenueDetails}
        optionSelectHandler={handleVenueSelect}
        leftSection={true}
      />

      {venueDetails && (
        <Box mt="lg">
          <Tabs
            color="untappd"
            mt="sm"
            defaultValue={String(venueDetails[0].menu_id)}
          >
            <Tabs.List>
              {venueDetails.map((item) => {
                const { menu_id, menu_name, total_item_count } = item;

                if (total_item_count === 0) {
                  return null;
                }

                return (
                  <Tabs.Tab key={menu_id} value={String(menu_id)}>
                    {menu_name}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>

            {venueDetails.map((item) => {
              const { menu_id, menu_description, total_item_count, items } =
                item;

              if (total_item_count === 0) {
                return null;
              }

              return (
                <Tabs.Panel key={menu_id} value={String(menu_id)}>
                  <Stack mt="xs" mb="md" gap="0">
                    <Text fs="italic" size="sm" c="dimmed">
                      {menu_description}
                    </Text>
                    <Text c="untappd" size="sm" ta="right">
                      <Anchor
                        href={selectedVenue?.url}
                        target="_blank"
                        c="untappd"
                        underline="always"
                        size="sm"
                      >
                        Menu on Untappd
                      </Anchor>
                    </Text>
                  </Stack>

                  {items.length === 0 && (
                    <Text
                      fs="italic"
                      c="dimmed"
                      fw="500"
                      ta="center"
                      mt="xl"
                      mb="xs"
                    >
                      No new styles on this menu
                    </Text>
                  )}

                  {groupByStyles(items).map((group, index) => (
                    <VenueBeerCard
                      key={group.beer_style}
                      group={group}
                      startOpen={index === 0}
                    />
                  ))}
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </Box>
      )}
    </Card>
  );
};
