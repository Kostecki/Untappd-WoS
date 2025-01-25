import {
  CloseButton,
  Combobox,
  Flex,
  Group,
  Image,
  Loader,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  useCombobox,
  type ComboboxStore,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

import countryToEmoji from "~/countries";
import { isMobile } from "~/utils";

interface InputProps {
  apiURL: string;
  placeholder: string;
  emptyText: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  optionSelectHandler: (
    inputDataList?: BeerStringSearchResponse[] | VenueDetails[],
    barcode?: number,
    optionValue?: string,
    combobox?: ComboboxStore
  ) => Promise<void>;
  selectedBeer?: BeerStringSearchResponse | undefined;
  setSelectedBeer?: React.Dispatch<
    React.SetStateAction<BeerStringSearchResponse | undefined>
  >;
  setBeerDetails?: React.Dispatch<
    React.SetStateAction<BeerWithStylesHad[] | undefined>
  >;
  selectedVenue?: VenueDetails | undefined;
  setSelectedVenue?: React.Dispatch<
    React.SetStateAction<VenueDetails | undefined>
  >;
  setVenueDetails?: React.Dispatch<
    React.SetStateAction<VenueMenuDetails[] | undefined>
  >;
  leftSection?: boolean;
}

export const SearchSelect = ({
  apiURL,
  placeholder,
  emptyText,
  loading,
  setLoading,
  optionSelectHandler,
  selectedBeer,
  setSelectedBeer,
  setBeerDetails,
  selectedVenue,
  setSelectedVenue,
  setVenueDetails,
  leftSection = false,
}: InputProps) => {
  const mobile = isMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<
    BeerStringSearchResponse[] | VenueDetails[] | undefined
  >(undefined);
  const [empty, setEmpty] = useState(false);

  const abortController = useRef<AbortController | null>(null);

  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    const fetchData = async (query: string) => {
      abortController.current?.abort();
      abortController.current = new AbortController();

      if (!query) {
        setData(undefined);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/${query}`);
        const data: BeerStringSearchResponse[] = await response.json();
        setData(data);
        setEmpty(data.length === 0);
      } catch (error) {
        console.error("Failed to get data", apiURL, error);
      }
      setLoading(false);
    };

    if (debouncedSearch.trim()) {
      fetchData(debouncedSearch);
    } else {
      setData(undefined);
      setEmpty(false);
    }
  }, [debouncedSearch]);

  const VerifiedImageComponent = ({
    is_verified,
  }: {
    is_verified: boolean;
  }) => {
    return (
      <Image
        src={is_verified ? "verified.svg" : "unverified.svg"}
        h="16"
        w="16"
        style={{ opacity: is_verified ? 1 : 0.3 }}
        mr="xs"
      />
    );
  };

  const TextComponents = ({
    venue,
  }: {
    venue: { venue_name: string; venue_city: string; venue_country: string };
  }) => {
    const { venue_name, venue_city, venue_country } = venue;
    return (
      <>
        <Text size="sm">{venue_name}</Text>
        <Text size="sm" c="dimmed" fs="italic">
          ({venue_city}, {venue_country})
        </Text>
      </>
    );
  };

  const options = (data || []).map((input) => {
    if (apiURL.includes("/venues")) {
      if ("venue_id" in input && "is_verified" in input) {
        const { venue_id, is_verified } = input;

        return (
          <Combobox.Option value={venue_id.toString()} key={venue_id}>
            {mobile ? (
              <Group gap={0}>
                <VerifiedImageComponent is_verified={is_verified} />
                <Stack gap={0}>
                  <TextComponents venue={input} />
                </Stack>
              </Group>
            ) : (
              <Flex align="center">
                <VerifiedImageComponent is_verified={is_verified} />
                <Flex justify="space-between" w="100%">
                  <TextComponents venue={input} />
                </Flex>
              </Flex>
            )}
          </Combobox.Option>
        );
      }
    } else if (apiURL.includes("/beers")) {
      if ("beer" in input && "brewery" in input) {
        const {
          beer: { bid, beer_name },
          brewery: { country_name, brewery_name },
        } = input;

        return (
          <Combobox.Option value={bid.toString()} key={bid}>
            <Flex direction="row" mt="-2px">
              <Text size="sm" mt="2px" mr="xs">
                {countryToEmoji(country_name)}
              </Text>
              <Text size="sm">{beer_name}</Text>
              <Text c="dimmed" component="span" fs="italic" ml="xs" size="sm">
                ({brewery_name})
              </Text>
            </Flex>
          </Combobox.Option>
        );
      }
    }
  });

  const selected = selectedBeer || selectedVenue;
  const setDetails = setBeerDetails || setVenueDetails;
  const setSelected = setSelectedBeer || setSelectedVenue;

  let textInputValue: string = searchQuery;
  if (selected) {
    if ("venue_name" in selected) {
      textInputValue = selected.venue_name;
    }

    if ("have_had" in selected) {
      textInputValue = selected.beer.beer_name;
    }
  }

  const isVerified =
    selected && "is_verified" in selected && selected?.is_verified;

  return (
    <Combobox
      onOptionSubmit={(option) =>
        optionSelectHandler(data, undefined, option, combobox)
      }
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          placeholder={placeholder}
          value={textInputValue}
          onChange={(event) => {
            if (setSelected) setSelected(undefined);
            setSearchQuery(event.currentTarget.value);
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          leftSection={
            leftSection &&
            (selected ? (
              <Image
                src={isVerified ? "verified.svg" : "unverified.svg"}
                h={16}
                w={16}
                mt="2px"
                style={{ opacity: isVerified ? 1 : 0.3 }}
              />
            ) : null)
          }
          rightSection={
            loading ? (
              <Loader size={18} />
            ) : searchQuery || selected ? (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (setSelected) setSelected(undefined);
                  if (setDetails) setDetails(undefined);
                  setSearchQuery("");
                }}
              />
            ) : null
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={data === null}>
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={200}>
            {options}
            {empty && <Combobox.Empty>{emptyText}</Combobox.Empty>}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
