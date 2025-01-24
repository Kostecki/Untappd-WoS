import {
  Anchor,
  Box,
  Card,
  Divider,
  Flex,
  Image,
  Stack,
  Text,
  type ComboboxStore,
} from "@mantine/core";
import { useState } from "react";

import { SearchSelect } from "../SearchSelect";

import "./style.css";
interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
}

export const CheckBeer = ({ styles }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedBeer, setSelectedBeer] = useState<any>(null);
  const [beerDetails, setBeerDetails] = useState<any>(null);
  const [hadStyle, setHadStyle] = useState<boolean | undefined>(undefined);

  const selectHandler = async (
    optionValue: string,
    beers: any,
    combobox: ComboboxStore
  ) => {
    setLoading(true);

    const beer = beers?.find(
      (beer: any) => beer.beer.bid.toString() === optionValue
    );
    if (beer) {
      setSelectedBeer(beer.beer);

      const beerDetails = await fetch(`/api/beer/${beer.beer.bid}`);
      const beerDetailsData = await beerDetails.json();

      const hadStyle = styles.find(
        (style) => style.styleName === beerDetailsData.beer_style
      )?.had;
      setHadStyle(hadStyle);

      setBeerDetails(beerDetailsData);
    }

    setLoading(false);
    combobox.closeDropdown();
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="25px" fw="500">
        Check Beer
      </Text>
      <Text fs="italic" mt="xs" c="dimmed">
        Check a specific beer, by name or barcode, to see if it's a new style
      </Text>

      <Divider mt="xs" mb="lg" />

      <SearchSelect
        apiURL="/api/beers"
        placeholder="Search for a beer"
        emptyText="No beers found"
        loading={loading}
        setLoading={setLoading}
        selected={selectedBeer}
        setSelected={setSelectedBeer}
        setDetails={setBeerDetails}
        optionSelectHandler={selectHandler}
      />

      {beerDetails && (
        <Anchor
          href={`https://untappd.com/b/${beerDetails.beer_slug}/${beerDetails.bid}`}
          target="_blank"
          underline="never"
        >
          <Card mt="lg" className="beer-style-card">
            <Flex justify="space-between" align="center">
              <Image src={beerDetails.beer_label} alt={beerDetails.beer_name} />
              <Stack align="center" gap="0">
                <Text c="gray">{beerDetails.beer_name}</Text>
                <Text c="gray">{beerDetails.brewery.brewery_name}</Text>
                <Text fw="500">{beerDetails.beer_style}</Text>
              </Stack>
              <Stack align="center" gap="0">
                <Text size="xl">{hadStyle ? "🤷‍♂️" : "👍"}</Text>
                <Text size="sm">Had?</Text>
                <Text size="sm" c="gray">
                  Style: {hadStyle ? "Yes" : "No"}
                </Text>
                <Text size="sm" c="gray">
                  Beer: {beerDetails.stats.user_count > 0 ? "Yes" : "No"}
                </Text>
              </Stack>
            </Flex>
          </Card>
        </Anchor>
      )}
    </Card>
  );
};
