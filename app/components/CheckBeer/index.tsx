import {
  ActionIcon,
  Anchor,
  Box,
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Text,
  Tooltip,
  type ComboboxStore,
} from "@mantine/core";
import { useState } from "react";
import { IconBarcode, IconSearch } from "@tabler/icons-react";

import countryToEmoji from "~/countries";

import { SearchSelect } from "../SearchSelect";
import { Barcode } from "../BarcodeScanner";

import "./style.css";

interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
  stockListDetails: StockListDeatils | undefined;
}

enum searchOptions {
  TEXT,
  BARCODE,
}

export const CheckBeer = ({ styles, stockListDetails }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedBeer, setSelectedBeer] = useState<
    BeerStringSearchResponse | undefined
  >(undefined);
  const [beerDetails, setBeerDetails] = useState<
    BeerWithStylesHad[] | undefined
  >(undefined);
  const [activeSearchOptions, setActiveSearchOptions] = useState<searchOptions>(
    searchOptions.TEXT
  );

  const setStylesHadStatus = <T extends BarcodeAPIResponse | BeerInfoResponse>(
    beers: T[]
  ): BeerWithStylesHad[] => {
    return beers.map((beer) => {
      const matchedStyle = styles.find(
        (style) => style.styleName === beer.beer.beer_style
      );

      return {
        ...beer,
        beer: {
          ...beer.beer,
          style_had: matchedStyle?.had ?? false,
        },
      };
    });
  };

  const fetchDetails = async (
    inputDataList?: BeerStringSearchResponse[] | VenueDetails[],
    barcode?: number,
    optionValue?: string,
    combobox?: ComboboxStore
  ) => {
    setLoading(true);

    console.log("fetchDetails called");

    if (barcode) {
      const beerDetails = await fetch(`/api/barcode/${barcode}`);
      const beerDetailsData: BarcodeAPIResponse[] = await beerDetails.json();

      const beerDetailsDataWithStyle = setStylesHadStatus(beerDetailsData);
      setBeerDetails(beerDetailsDataWithStyle);
    }

    if (optionValue) {
      const beer = (inputDataList as BeerStringSearchResponse[])?.find(
        (beer) => beer.beer.bid.toString() === optionValue
      );

      if (beer) {
        setSelectedBeer(beer);

        const beerDetails = await fetch(`/api/beer/${beer.beer.bid}`);
        const beerDetailsData: BeerInfoResponse[] = await beerDetails.json();

        const beerDetailsDataWithStyle = setStylesHadStatus(beerDetailsData);
        setBeerDetails(beerDetailsDataWithStyle);

        console.log("Beer details fetched:", beerDetails);
      }
    }

    setLoading(false);
    combobox?.closeDropdown();
  };

  const findBeerByStyle = (styleName: string) => {
    const beer = stockListDetails?.listItems.some(
      (beer) => beer.beer.beer_style === styleName
    );

    return beer;
  };

  const HaveHadStatus = ({ beer }: { beer: BeerWithStylesHad }) => {
    const {
      beer: { beer_style, style_had },
    } = beer;
    const haveStyleInStock = findBeerByStyle(beer_style);
    const haveButNotDrunk = !style_had && haveStyleInStock;

    const text = style_had ? "Yes" : "No";

    return (
      <>
        <Text size="sm" c="dimmed">
          Had style: {text}
          {haveButNotDrunk && (
            <Box component="span">
              <Text component="span" size="sm" c="dimmed">
                , But on list:{" "}
                <Text fs="italic" component="span">
                  "{stockListDetails?.listName}"
                </Text>
              </Text>
              <Divider orientation="vertical" />
            </Box>
          )}
        </Text>
      </>
    );
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
              setSelectedBeer(undefined);
              setBeerDetails(undefined);
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
              setSelectedBeer(undefined);
              setBeerDetails(undefined);
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
          selectedBeer={selectedBeer}
          setSelectedBeer={setSelectedBeer}
          setBeerDetails={setBeerDetails}
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
              Barcode belongs to multiple beers ({beerDetails.length})
            </Text>
          )}

          {beerDetails.length === 0 ? (
            <Text fs="italic">No beers found</Text>
          ) : (
            beerDetails.map((beer) => {
              const {
                beer: { bid, beer_slug, beer_label, beer_name, beer_style },
                brewery: { brewery_name, country_name },
              } = beer;

              const hadBeer = () => {
                if ("stats" in beer.beer) {
                  const stats = beer.beer.stats;
                  return stats.user_count > 0 ? "Yes" : "No";
                }

                if ("has_had" in beer.beer) {
                  const has_had = beer.beer.has_had;
                  return has_had ? "Yes" : "No";
                }
              };

              return (
                <Anchor
                  href={`https://untappd.com/b/${beer_slug}/${bid}`}
                  target="_blank"
                  underline="never"
                  key={bid}
                >
                  <Card mt="lg" className="beer-style-card" p="xs">
                    <Grid align="center" justify="space-between">
                      <Grid.Col span={3}>
                        <Image src={beer_label} alt={beer_name} />
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Text ta="center">{countryToEmoji(country_name)}</Text>
                        <Text ta="center" c="gray">
                          {brewery_name}
                        </Text>
                        <Text ta="center" c="gray" size="sm" mt="xs">
                          {beer_name}
                        </Text>
                        <Text ta="center" fw="500" size="sm">
                          {beer_style}
                        </Text>
                      </Grid.Col>
                    </Grid>
                    <Divider my="xs" opacity={0.5} />
                    <Group>
                      <HaveHadStatus beer={beer} />
                      <Divider orientation="vertical" />
                      <Text ta="center" size="sm" c="dimmed">
                        Had beer: {hadBeer()}
                      </Text>
                    </Group>
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
