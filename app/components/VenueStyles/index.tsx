import {
  Anchor,
  Box,
  Card,
  CloseButton,
  Combobox,
  Divider,
  Flex,
  Group,
  Image,
  Loader,
  ScrollArea,
  Tabs,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Fragment, useEffect, useRef, useState } from "react";
import { BeerCard } from "../BeerCard";

interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
}

export const VenueStyles = ({ styles }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<[] | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Separate search query state
  const [selectedVenue, setSelectedVenue] = useState<any>(null); // Store full venue object
  const [empty, setEmpty] = useState(false);
  const [venueDetails, setVenueDetails] = useState<any>(null);

  const abortController = useRef<AbortController | null>(null);

  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    const getVenues = async (query: string) => {
      abortController.current?.abort();
      abortController.current = new AbortController();

      if (!query) {
        setVenues(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/venues/${query}`);
        const data = await response.json();
        setVenues(data);
        setEmpty(data.length === 0);
      } catch (error) {
        console.error("Failed to get venues", error);
      }
      setLoading(false);
    };

    if (debouncedSearch.trim()) {
      getVenues(debouncedSearch);
    } else {
      setVenues(null);
      setEmpty(false);
    }
  }, [debouncedSearch]);

  const handleVenueSelect = async (optionValue: string) => {
    setLoading(true);

    const venue = venues?.find(
      (v: any) => v.venue.venue_id.toString() === optionValue
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

  const options = (venues || []).map((venue: any) => (
    <Combobox.Option
      value={venue.venue.venue_id.toString()}
      key={venue.venue.venue_id}
    >
      <Flex justify="space-between">
        <Group gap="6">
          <Image
            src={venue.venue.is_verified ? "verified.svg" : "unverified.svg"}
            h={16}
            w={16}
            mt="2px"
            style={{ opacity: venue.venue.is_verified ? 1 : 0.3 }}
          />
          {venue.venue.venue_name}
        </Group>
        <Group>
          ({venue.venue.venue_city}, {venue.venue.venue_country})
        </Group>
      </Flex>
    </Combobox.Option>
  ));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="25px" fw="500">
        Venue Styles
      </Text>
      <Text fs="italic" mt="xs" c="dimmed">
        Pick a verified venue to see what new styles they might have
      </Text>

      <Divider mt="xs" mb="lg" />

      <Combobox onOptionSubmit={handleVenueSelect} store={combobox}>
        <Combobox.Target>
          <TextInput
            placeholder="Find venue"
            value={selectedVenue?.venue_name || searchQuery}
            onChange={(event) => {
              setSearchQuery(event.currentTarget.value);
              setSelectedVenue(null);
              combobox.openDropdown();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            leftSection={
              selectedVenue ? (
                <Image
                  src={
                    selectedVenue.is_verified
                      ? "verified.svg"
                      : "unverified.svg"
                  }
                  h={16}
                  w={16}
                  mt="2px"
                  style={{ opacity: selectedVenue.is_verified ? 1 : 0.3 }}
                />
              ) : null
            }
            rightSection={
              loading ? (
                <Loader size={18} />
              ) : searchQuery || selectedVenue ? (
                <CloseButton
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedVenue(null);
                    setVenues(null);
                    setVenueDetails(null);
                  }}
                />
              ) : null
            }
          />
        </Combobox.Target>

        <Combobox.Dropdown hidden={venues === null}>
          <Combobox.Options>
            <ScrollArea.Autosize type="scroll" mah={200}>
              {options}
              {empty && <Combobox.Empty>No venues found</Combobox.Empty>}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

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
