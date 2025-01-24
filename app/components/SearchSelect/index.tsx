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
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "~/utils";

interface InputProps {
  apiURL: string;
  placeholder: string;
  emptyText: string;
  loading: boolean;
  setLoading: any;
  selected: any;
  setSelected: any;
  setDetails: any;
  optionSelectHandler: any;
  leftSection?: boolean;
}

export const SearchSelect = ({
  apiURL,
  placeholder,
  emptyText,
  loading,
  setLoading,
  selected,
  setSelected,
  optionSelectHandler,
  setDetails,
  leftSection = false,
}: InputProps) => {
  const mobile = isMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<[] | null>(null);
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
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${apiURL}/${query}`);
        const data = await response.json();
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
      setData(null);
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

  const options = (data || []).map((input: any) => {
    if (apiURL.includes("/venues")) {
      return (
        <Combobox.Option
          value={input.venue.venue_id.toString()}
          key={input.venue.venue_id}
        >
          {mobile ? (
            <Group gap={0}>
              <VerifiedImageComponent is_verified={input.venue.is_verified} />
              <Stack gap={0}>
                <TextComponents venue={input.venue} />
              </Stack>
            </Group>
          ) : (
            <Flex align="center">
              <VerifiedImageComponent is_verified={input.venue.is_verified} />
              <Flex justify="space-between" w="100%">
                <TextComponents venue={input.venue} />
              </Flex>
            </Flex>
          )}
        </Combobox.Option>
      );
    } else if (apiURL.includes("/beers")) {
      return (
        <Combobox.Option value={input.beer.bid.toString()} key={input.beer.bid}>
          <Text size="sm">
            {input.beer.beer_name}
            <Text c="dimmed" component="span" fs="italic" ml="xs" size="sm">
              ({input.brewery.brewery_name})
            </Text>
          </Text>
        </Combobox.Option>
      );
    }
  });

  return (
    <Combobox
      onOptionSubmit={(option) =>
        optionSelectHandler(data, null, option, combobox)
      }
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          placeholder={placeholder}
          value={selected?.venue_name || selected?.beer_name || searchQuery}
          onChange={(event) => {
            setSearchQuery(event.currentTarget.value);
            setSelected(null);
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          leftSection={
            leftSection &&
            (selected ? (
              <Image
                src={selected.is_verified ? "verified.svg" : "unverified.svg"}
                h={16}
                w={16}
                mt="2px"
                style={{ opacity: selected.is_verified ? 1 : 0.3 }}
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
                  setSearchQuery("");
                  setSelected(null);
                  setData(null);
                  setDetails(null);
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
