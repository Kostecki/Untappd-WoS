import {
  CloseButton,
  Combobox,
  Flex,
  Group,
  Image,
  Loader,
  ScrollArea,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

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

  const options = (data || []).map((input: any) => {
    if (apiURL.includes("/venues")) {
      return (
        <Combobox.Option
          value={input.venue.venue_id.toString()}
          key={input.venue.venue_id}
        >
          <Flex justify="space-between">
            <Group gap="6">
              <Image
                src={
                  input.venue.is_verified ? "verified.svg" : "unverified.svg"
                }
                h={16}
                w={16}
                mt="2px"
                style={{ opacity: input.venue.is_verified ? 1 : 0.3 }}
              />
              {input.venue.venue_name}
            </Group>
            <Group>
              ({input.venue.venue_city}, {input.venue.venue_country})
            </Group>
          </Flex>
        </Combobox.Option>
      );
    } else if (apiURL.includes("/beers")) {
      return (
        <Combobox.Option value={input.beer.bid.toString()} key={input.beer.bid}>
          <Text>
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
      onOptionSubmit={(option) => optionSelectHandler(option, data, combobox)}
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
