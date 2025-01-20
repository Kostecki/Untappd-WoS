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
import { SettingsModal } from "../SettingsModal";
import { Link } from "react-router";

interface InputProps {
  user: SessionUser;
  stats: any; // TODO: Add type
  setProfileFilters: React.Dispatch<React.SetStateAction<Filters>>;
  profileFilters: Filters;
}

export const Profile = ({
  user,
  stats,
  setProfileFilters,
  profileFilters,
}: InputProps) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const {
    hadCount,
    notHadCount,
    totalCount,
    level: { currentLevel, progressToNext, checkInsPerLevel, maxLevel },
  } = stats;

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.checked;

    setProfileFilters((prevFilters) => ({
      ...prevFilters,
      showHaveHad: newValue,
    }));
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Flex justify="space-between">
          <Group>
            <Avatar src={user.userAvatarURL} alt={fullName} />
            <Text>{fullName}</Text>
          </Group>
          <Group>
            <SettingsModal user={user} />
            <ActionIcon
              component={Link}
              variant="transparent"
              aria-label="Logout"
              color="dark"
              to="/logout"
            >
              <IconLogout stroke={1} />
            </ActionIcon>
          </Group>
        </Flex>

        <Divider my="md" />

        <Group justify="space-between">
          <Stack>
            <Switch
              label='Show "Have Had"'
              color="untappd"
              checked={profileFilters.showHaveHad}
              onChange={handleToggle}
            />
            {/* <Switch
            label='Show Only List "[Name]"'
            color="untappd"
            checked={showOnlyMissingOnList}
            onChange={() => setProfileFilters(prev => ({ ...prev, showOnlyMissingOnList: !prev.showOnlyMissingOnList }))}
          /> */}
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
    </>
  );
};
