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
  stats: any;
}

export const Profile = ({ user, stats }: InputProps) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const {
    hadCount,
    notHadCount,
    totalCount,
    level: { currentLevel, progressToNext, checkInsPerLevel, maxLevel },
  } = stats;

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
          <Switch label='Show "Have Had"' />
          <Switch label="Show Missing" />
          <Switch label='Show Only List "[Name]"' />
        </Stack>
        <Button variant="outline" color="untappd">
          Refresh Data
        </Button>
      </Group>

      <Divider my="md" />

      <Flex justify="space-between">
        <Ring value={currentLevel} maxValue={maxLevel}>
          <Flex justify="center" direction="column">
            <Text size="md" ta="center" fw="bold">
              Badge
            </Text>
            <Text size="sm" ta="center">
              {currentLevel} / {maxLevel}
            </Text>
          </Flex>
        </Ring>
        <Ring value={hadCount} maxValue={totalCount}>
          <Flex justify="center" direction="column">
            <Text size="md" ta="center" fw="bold">
              Style
            </Text>
            <Text size="sm" ta="center">
              {hadCount} / {totalCount}
            </Text>
            <Text size="sm" fs="italic" ta="center" mt="3" mb="-5">
              Left: {notHadCount}
            </Text>
            <Text size="sm" fs="italic" ta="center">
              Have: 0
            </Text>
          </Flex>
        </Ring>
        <Ring value={progressToNext} maxValue={checkInsPerLevel}>
          <Flex justify="center" direction="column">
            <Text size="md" ta="center" fw="bold">
              Level
            </Text>
            <Text size="sm" ta="center">
              {progressToNext} / {checkInsPerLevel}
            </Text>
          </Flex>
        </Ring>
      </Flex>
    </Card>
  );
};
