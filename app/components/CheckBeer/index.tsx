import {
  ActionIcon,
  Anchor,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Tooltip,
  type ComboboxStore,
} from "@mantine/core";
import { useState } from "react";

import { SearchSelect } from "../SearchSelect";
import { Barcode } from "../BarcodeScanner/Scanner";

import { IconBarcode, IconSearch } from "@tabler/icons-react";

import "./style.css";

interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
}

enum searchOptions {
  TEXT,
  BARCODE,
}

export const CheckBeer = ({ styles }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedBeer, setSelectedBeer] = useState<any>(null);
  const [beerDetails, setBeerDetails] = useState<any>(null);
  const [activeSearchOptions, setActiveSearchOptions] = useState<searchOptions>(
    searchOptions.TEXT
  );

  const setStylesHadStatus = (beers: any[]) => {
    return beers.map((beer) => {
      const matchedStyle = styles.find(
        (style) => style.styleName === beer.beer.beer_style
      );

      return {
        ...beer,
        beer: {
          ...beer.beer,
          style_had: matchedStyle?.had ?? false, // Default to false if no match
        },
      };
    });
  };

  const fetchDetails = async (
    beers?: any,
    barcode?: number,
    optionValue?: string,
    combobox?: ComboboxStore
  ) => {
    setLoading(true);

    if (barcode) {
      const beerDetails = await fetch(`/api/barcode/${barcode}`);
      const beerDetailsData = await beerDetails.json();

      const beerDetailsDataWithStyle = setStylesHadStatus(beerDetailsData);
      setBeerDetails(beerDetailsDataWithStyle);
    }

    if (optionValue) {
      const beer = beers?.find(
        (beer: any) => beer.beer.bid.toString() === optionValue
      );

      if (beer) {
        setSelectedBeer(beer.beer);

        const beerDetails = await fetch(`/api/beer/${beer.beer.bid}`);
        const beerDetailsData = await beerDetails.json();

        const beerDetailsDataWithStyle = setStylesHadStatus(beerDetailsData);
        setBeerDetails(beerDetailsDataWithStyle);
      }
    }

    setLoading(false);
    combobox?.closeDropdown();
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Flex justify="space-between" align="center">
        <Text size="25px" fw="500">
          Check Beer
        </Text>
        <Group gap="sm">
          <ActionIcon
            variant="subtle"
            color={
              activeSearchOptions === searchOptions.TEXT ? "black" : "gray"
            }
            aria-label="Search by text"
            onClick={() => {
              setSelectedBeer(null);
              setBeerDetails(null);
              setActiveSearchOptions(searchOptions.TEXT);
            }}
          >
            <Tooltip label="Search by text">
              <IconSearch size={25} stroke={1} />
            </Tooltip>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color={
              activeSearchOptions === searchOptions.BARCODE ? "black" : "gray"
            }
            aria-label="Search by barcode"
            onClick={() => {
              setSelectedBeer(null);
              setBeerDetails(null);
              setActiveSearchOptions(searchOptions.BARCODE);
            }}
          >
            <Tooltip label="Search by barcode">
              <IconBarcode size={25} stroke={1} />
            </Tooltip>
          </ActionIcon>
        </Group>
      </Flex>
      <Text fs="italic" mt="xs" c="dimmed">
        Check a specific beer, by name or barcode, to see if it's a new style
      </Text>

      <Divider mt="xs" mb="lg" />

      {activeSearchOptions === searchOptions.TEXT && (
        <SearchSelect
          apiURL="/api/beers"
          placeholder="Search for a beer"
          emptyText="No beers found"
          loading={loading}
          setLoading={setLoading}
          selected={selectedBeer}
          setSelected={setSelectedBeer}
          setDetails={setBeerDetails}
          optionSelectHandler={fetchDetails}
        />
      )}

      {activeSearchOptions === searchOptions.BARCODE && !beerDetails && (
        <Barcode fetchDetailsHandler={fetchDetails} />
      )}

      {beerDetails && (
        <>
          {beerDetails.length > 1 && (
            <Text fs="italic" fw="300">
              Barcode belongs to multiple beers
            </Text>
          )}

          {beerDetails.length === 0 ? (
            <Text fs="italic">No beers found</Text>
          ) : (
            beerDetails.map((beer: any) => {
              const {
                beer: {
                  bid,
                  beer_slug,
                  beer_label,
                  beer_name,
                  beer_style,
                  style_had,
                  has_had,
                  stats,
                },
                brewery: { brewery_name },
              } = beer;

              return (
                <Anchor
                  href={`https://untappd.com/b/${beer_slug}/${bid}`}
                  target="_blank"
                  underline="never"
                  key={bid}
                >
                  <Card mt="lg" className="beer-style-card">
                    <Flex justify="space-between" align="center">
                      <Image src={beer_label} alt={beer_name} />
                      <Stack align="center" gap="0" maw="50%">
                        <Text ta="center" c="gray">
                          {brewery_name}
                        </Text>
                        <Text ta="center" c="gray" size="sm" mt="xs">
                          {beer_name}
                        </Text>
                        <Text ta="center" fw="500" size="sm">
                          {beer_style}
                        </Text>
                      </Stack>
                      <Stack align="center" gap="0">
                        <Text ta="center" mb="3">
                          Had?
                        </Text>
                        <Text ta="center" size="sm" c="gray">
                          Style: {style_had ? "Yes" : "No"}
                        </Text>
                        <Text ta="center" size="sm" c="gray">
                          Beer: {has_had ?? stats.user_count > 0 ? "Yes" : "No"}
                        </Text>
                      </Stack>
                    </Flex>
                  </Card>
                </Anchor>
              );
            })
          )}
        </>
      )}
    </Card>
  );
};
