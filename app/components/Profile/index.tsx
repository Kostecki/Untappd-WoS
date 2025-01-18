import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { IconLogout, IconSettings } from "@tabler/icons-react";

import type { SessionUser } from "~/auth/auth.server";
import { Ring } from "../Ring";

interface InputProps {
  user: SessionUser;
}

export const Profile = ({ user }: InputProps) => {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Flex justify="space-between">
        <Group>
          <Avatar src={user.userAvatarURL} alt={fullName} />
          <Text>{fullName}</Text>
        </Group>
        <Group>
          <ActionIcon variant="transparent" aria-label="Settings" color="dark">
            <IconSettings stroke={1} />
          </ActionIcon>
          <ActionIcon variant="transparent" aria-label="Logout" color="dark">
            <IconLogout stroke={1} />
          </ActionIcon>
        </Group>
      </Flex>

      <Divider my="md" />

      <Group justify="space-between">
        <Stack>
          <Switch label='Show "have had' />
          <Switch label="Show missing" />
          <Switch label="Show missing and also on list: [name]" />
        </Stack>
        <Button variant="outline" color="untappd">
          Refresh Data
        </Button>
      </Group>

      <Divider my="md" />

      <Flex justify="space-between">
        <Ring value={52} maxValue={53}>
          <Flex justify="center" direction="column">
            <Text size="md" ta="center" fw="bold">
              Badge
            </Text>
            <Text size="sm" ta="center">
              52 / 53
            </Text>
          </Flex>
        </Ring>
        <Ring value={264} maxValue={269}>
          <Flex justify="center" direction="column">
            <Text size="md" ta="center" fw="bold">
              Style
            </Text>
            <Text size="sm" ta="center">
              264 / 269
            </Text>
            <Text size="sm" fs="italic" ta="center" mt="3" mb="-5">
              Left: 5
            </Text>
            <Text size="sm" fs="italic" ta="center">
              Have: 0
            </Text>
          </Flex>
        </Ring>
        <Ring value={4} maxValue={5}>
          <Flex justify="center" direction="column">
            <Text size="md" ta="center" fw="bold">
              Level
            </Text>
            <Text size="sm" ta="center">
              4 / 5
            </Text>
          </Flex>
        </Ring>
      </Flex>
    </Card>
  );
};
