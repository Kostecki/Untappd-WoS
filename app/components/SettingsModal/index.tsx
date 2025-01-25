import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Flex,
  Group,
  Modal,
  Select,
  Switch,
  Text,
  Tooltip,
  type ComboboxItem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";

import type { SessionUser } from "~/auth/auth.server";
import { setSettings, Settings } from "~/utils";

interface InputProps {
  user: SessionUser;
  userLists: UserLists[];
  latestCommit: LatestCommit;
  stockList?: StockList;
  setStockList: React.Dispatch<React.SetStateAction<StockList | undefined>>;
}

export const SettingsModal = ({
  user,
  userLists,
  stockList,
  setStockList,
  latestCommit,
}: InputProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const lists = userLists
    .map((list) => ({
      value: String(list.list_id),
      label: list.list_name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleListSelect = (option: ComboboxItem) => {
    const newStockList = {
      listId: option.value,
      listName: option.label,
    };

    setStockList(newStockList);
    setSettings(Settings.STOCK_LIST, newStockList);
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="User Settings">
        <Select
          label="Your lists on Untappd"
          description={`Select a list with beers you already have. Used for features like "have the beer, but it's not yet checked in"`}
          placeholder="Select a list"
          data={lists}
          value={stockList ? stockList.listId : null}
          allowDeselect
          clearable
          onChange={(_, option) => handleListSelect(option)}
        />

        {/* TODO: Actually implement this */}
        {false && (
          <>
            <Text mt="xl" mb="xs">
              Extra features
            </Text>
            <Switch
              label="Country badges"
              description='Show progress on each of the "country badges"'
            />
          </>
        )}

        <Flex justify="space-between" align="center" mt="xl">
          {user.isAdmin && (
            <Group gap={0}>
              <Text size="sm" mr="5">
                Last commit:
              </Text>
              <Tooltip label={latestCommit.message} position="bottom" withArrow>
                <Anchor
                  href={`https://github.com/Kostecki/Untappd-WoS/commit/${latestCommit.hash}`}
                  target="_blank"
                  fs="italic"
                  c="dimmed"
                  size="sm"
                >
                  <Text>{latestCommit.hash}</Text>
                </Anchor>
              </Tooltip>
            </Group>
          )}
          <Group ml="lg">
            <Button
              size="compact-sm"
              variant="transparent"
              color="untappd"
              mr="-6px"
              onClick={close}
            >
              Save
            </Button>
          </Group>
        </Flex>
      </Modal>

      <ActionIcon
        aria-label="Settings"
        variant="transparent"
        color="dark"
        onClick={open}
      >
        <IconSettings stroke={1} />
      </ActionIcon>
    </>
  );
};
