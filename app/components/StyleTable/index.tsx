import {
  Accordion,
  ActionIcon,
  Box,
  Card,
  Checkbox,
  Collapse,
  CopyButton,
  Flex,
  List,
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

const baseStyles = [
  { styleName: "Farmhouse Ale - Bière de Mars", had: false },
  { styleName: "Historical Beer - Burton Ale", had: false },
  {
    styleName: "Historical Beer - Kuit / Kuyt / Koyt",
    had: false,
  },
  { styleName: "Makgeolli", had: false },
  { styleName: "Mead - Acerglyn / Maple Wine", had: false },
];

export const StyleTable = () => {
  const [styles, setStyles] = useState(baseStyles);
  const [openRow, setOpenRow] = useState<string | undefined>(undefined);

  const toggleRow = (styleName: string) => {
    if (openRow === styleName) {
      setOpenRow(undefined);
    } else {
      setOpenRow(styleName);
    }
  };

  const filterStyles = (styleName: string) => {
    const filteredStyles = baseStyles.filter((styles) =>
      styles.styleName.toLowerCase().includes(styleName.toLowerCase())
    );

    setStyles(filteredStyles);
  };

  const rows = styles.map((style) => (
    <Fragment key={style.styleName}>
      <Table.Tr
        onClick={() => toggleRow(style.styleName)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <Table.Td>
          <Flex>
            {openRow === style.styleName ? (
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
                  onClick={copy}
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
      <Collapse in={openRow === style.styleName}>
        <List m="lg">
          <List.Item mb="md">
            <Text size="sm" c="dark">
              Biere de Norma
            </Text>
            <Text size="sm" c="dimmed">
              Hill Farmstead Brewery, United States
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm" c="dark">
              Biere de Norma
            </Text>
            <Text size="sm" c="dimmed">
              Hill Farmstead Brewery, United States
            </Text>
          </List.Item>
        </List>
      </Collapse>
    </Fragment>
  ));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <TextInput
        placeholder="Search for style"
        onChange={(event) => filterStyles(event.currentTarget.value)}
      />

      <Table mt="lg" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w="360px">Style</Table.Th>
            <Table.Th ta="center">Had?</Table.Th>
            <Table.Th ta="center">Copy</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Card>
  );
};
