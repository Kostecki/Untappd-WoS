import {
  ActionIcon,
  Anchor,
  Card,
  Checkbox,
  Collapse,
  CopyButton,
  Flex,
  List,
  Loader,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
} from "@tabler/icons-react";
import { Fragment, useState } from "react";
import { useViewportSize } from "@mantine/hooks";

import countryToEmoji from "~/countries";

import "./styles.css";

interface InputProps {
  styles: { styleId: number; styleName: string; had: boolean }[];
}

export const StylesTable = ({ styles }: InputProps) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openRow, setOpenRow] = useState<number | undefined>(undefined);
  const [relatedBeers, setRelatedBeers] = useState([]);

  const { height: windowHeight } = useViewportSize();

  const toggleRow = async (styleId: number) => {
    if (openRow === styleId) {
      setOpenRow(undefined);
    } else {
      setLoading(true);
      setOpenRow(styleId);

      const response = await fetch(`/api/related/${styleId}`);
      const relatedBeers = await response.json();
      setRelatedBeers(relatedBeers);

      setLoading(false);
    }
  };

  const filteredStyles = styles.filter((style) =>
    style.styleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <TextInput
        placeholder="Search for style"
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
      />

      <Table
        mt="lg"
        highlightOnHover
        stickyHeader
        style={{
          display: "block",
          overflowY: "scroll",
          maxHeight: windowHeight - 140,
          scrollbarWidth: "thin",
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w="360px">Style</Table.Th>
            <Table.Th ta="center">Have Had</Table.Th>
            <Table.Th ta="center">Copy</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredStyles.map((style) => (
            <Fragment key={style.styleId}>
              <Table.Tr
                onClick={() => toggleRow(style.styleId)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <Table.Td>
                  <Flex>
                    {openRow === style.styleId ? (
                      <IconChevronDown size="20" color="gray" stroke={1.5} />
                    ) : (
                      <IconChevronUp size="20" color="gray" stroke={1.5} />
                    )}

                    <Text fw="bold" size="sm" ml="sm">
                      {style.styleName}
                    </Text>
                  </Flex>
                </Table.Td>

                <Table.Td>
                  <Flex justify="center">
                    <Checkbox color="untappd" checked={style.had} readOnly />
                  </Flex>
                </Table.Td>

                <Table.Td>
                  <Flex justify="center">
                    <CopyButton value={style.styleName}>
                      {({ copied, copy }) => (
                        <ActionIcon
                          variant="transparent"
                          aria-label="Copy"
                          onClick={(event) => {
                            event.stopPropagation();
                            copy();
                          }}
                        >
                          {copied ? (
                            <IconCheck color="gray" stroke={1.5} />
                          ) : (
                            <IconCopy color="gray" stroke={1.5} />
                          )}
                        </ActionIcon>
                      )}
                    </CopyButton>
                  </Flex>
                </Table.Td>
              </Table.Tr>
              <Table.Tr style={{ border: "none" }}>
                <Table.Td colSpan={3} p={0}>
                  <Collapse in={openRow === style.styleId}>
                    {loading ? (
                      <Flex justify="center">
                        <Loader color="untappd" my="lg" />
                      </Flex>
                    ) : (
                      <List my="lg">
                        {relatedBeers.map((beer: BeerWithBrewery) => {
                          const {
                            beer: { beer_name, bid },
                            brewery: { brewery_name, country_name },
                          } = beer;

                          return (
                            <Anchor
                              href={`https://untappd.com/beer/${bid}`}
                              target="_blank"
                              key={bid}
                            >
                              <List.Item
                                key={bid}
                                px="sm"
                                py="xs"
                                className="related-beer"
                              >
                                <Text component="div" size="sm" c="dark">
                                  {beer_name}
                                </Text>
                                <Text component="div" size="sm" c="dimmed">
                                  {brewery_name}, {country_name}{" "}
                                  {countryToEmoji(country_name)}
                                </Text>
                              </List.Item>
                            </Anchor>
                          );
                        })}
                      </List>
                    )}
                  </Collapse>
                </Table.Td>
              </Table.Tr>
            </Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};
