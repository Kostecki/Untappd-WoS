import {
  Anchor,
  Box,
  Card,
  Divider,
  Flex,
  Tabs,
  Text,
  type ComboboxStore,
} from "@mantine/core";
import { Fragment, useState } from "react";

import { BeerCard } from "../BeerCard";
import { SearchSelect } from "../SearchSelect";

interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
}

export const VenueStyles = ({ styles }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [venueDetails, setVenueDetails] = useState<any>(null);

  const handleVenueSelect = async (
    optionValue: string,
    venues: any,
    combobox: ComboboxStore
  ) => {
    setLoading(true);

    const venue = venues?.find(
      (venue: any) => venue.venue.venue_id.toString() === optionValue
    );
    if (venue) {
      setSelectedVenue(venue.venue); // TODO: Fix type

      const venueDetails = await fetch(`/api/venue/${venue.venue.venue_id}`);
      const venueDetailsData = await venueDetails.json();

      const haveHadStyleIds = styles.map((style) => style.styleId);
      // Filter out beers that user has already had
      // TODO: Super mega type this
      const filteredMenus = venueDetailsData.map((menuItem) => ({
        ...menuItem,
        menu: {
          ...menuItem.menu,
          sections: {
            ...menuItem.menu.sections,
            items: menuItem.menu.sections.items.map((section) => ({
              ...section,
              items: section.items.filter(
                (beer) => !haveHadStyleIds.includes(beer.beer.beer_style_id)
              ),
            })),
          },
        },
      }));

      setVenueDetails(filteredMenus);
    }

    setLoading(false);
    combobox.closeDropdown();
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
        selected={selectedVenue}
        setSelected={setSelectedVenue}
        setDetails={setVenueDetails}
        optionSelectHandler={handleVenueSelect}
        leftSection={true}
      />

      {venueDetails && (
        <Box mt="lg">
          <Tabs
            color="untappd"
            mt="sm"
            defaultValue={String(venueDetails[0].menu.menu_id)}
          >
            <Tabs.List>
              {venueDetails.map((item: any) => {
                const { menu_id, menu_name, total_item_count } = item.menu;

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

            {venueDetails.map((item: any) => {
              const { menu_id, menu_description, total_item_count, sections } =
                item.menu;

              if (total_item_count === 0) {
                return null;
              }

              return (
                <Tabs.Panel key={menu_id} value={String(menu_id)}>
                  <Flex justify="space-between" align="center" mt="xs" mb="md">
                    <Text fs="italic" size="sm" c="dimmed">
                      {menu_description}
                    </Text>
                    <Anchor
                      href={selectedVenue.url}
                      target="_blank"
                      c="untappd"
                      underline="always"
                      size="sm"
                    >
                      Menu on Untappd
                    </Anchor>
                  </Flex>

                  {sections.items.map((section: any) => {
                    const { section_id, section_name, items, count } = section;
                    if (items.length === 0 && items.length === count) {
                      return false;
                    }

                    return (
                      <Fragment key={section_id}>
                        <Text mt="md" fw="500">
                          {section_name}
                        </Text>

                        {items.length === 0 && (
                          <Text fs="italic" c="dimmed">
                            No new styles in the
                            <Text component="span" fw="bold">
                              {` ${section_name} `}
                            </Text>
                            section of the menu
                          </Text>
                        )}

                        {items.map((item: any) => (
                          <BeerCard key={item.beer.bid} beerItem={item} />
                        ))}
                      </Fragment>
                    );
                  })}
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </Box>
      )}
    </Card>
  );
};
