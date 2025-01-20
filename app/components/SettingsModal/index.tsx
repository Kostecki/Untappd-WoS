import {
  ActionIcon,
  Anchor,
  Button,
  Flex,
  Modal,
  Select,
  Switch,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";

import type { SessionUser } from "~/auth/auth.server";

interface InputProps {
  user: SessionUser;
}

export const SettingsModal = ({ user }: InputProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="User Settings">
        {/* TODO: Actually implement this */}
        <Select
          label="Your lists on Untappd"
          description={`Select a list with beers you already have. Used for features like "have the beer, but it's not yet checked in"`}
          placeholder="Select a list"
          data={["React", "Angular", "Vue", "Svelte"]}
        />

        <Text mt="xl" mb="xs">
          Extra features
        </Text>

        {/* TODO: Actually implement this */}
        <Switch
          label="Country badges"
          description='Show progress on each of the "country badges"'
        />

        <Flex justify="space-between" align="center" mt="xl">
          {/* TODO: Actually implement this */}
          {user.isAdmin && (
            <Tooltip label="Commit message">
              <Anchor
                href={`https://github.com/Kostecki/Untappd-WoS/commit/${123}`}
                target="_blank"
                fs="italic"
                c="untappd"
                size="sm"
              >
                <Text>Last commit: ??</Text>
              </Anchor>
            </Tooltip>
          )}
          <Button
            size="compact-sm"
            variant="transparent"
            color="untappd"
            mr="-6px"
          >
            Save
          </Button>
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
