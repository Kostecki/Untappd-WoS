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
import { IconLogout } from "@tabler/icons-react";
import { Link } from "react-router";

import type { SessionUser } from "~/auth/auth.server";

import { Ring } from "../Ring";
import { SettingsModal } from "../SettingsModal";
import { setSettings, Settings } from "~/utils";

interface InputProps {
  user: SessionUser;
  stats: Stats;
  userLists: UserLists[];
  stockList?: StockList;
  setStockList: React.Dispatch<React.SetStateAction<StockList | undefined>>;
  setProfileFilters: React.Dispatch<React.SetStateAction<Filters>>;
  profileFilters: Filters;
}

export const Profile = ({
  user,
  stats,
  userLists,
  stockList,
  setStockList,
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
    const { name, checked } = event.currentTarget;

    const newFilters = {
      ...profileFilters,
      [name]: checked,
      showHaveHad: name === "showHaveHad" ? checked : false,
      showOnlyMissingOnList: name === "showOnlyMissingOnList" ? checked : false,
    };

    setProfileFilters(newFilters);
    setSettings(Settings.TABLE_FILTERS, newFilters);
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
            <SettingsModal
              user={user}
              userLists={userLists}
              stockList={stockList}
              setStockList={setStockList}
            />
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
              name="showHaveHad"
              label='Show "Have Had"'
              description="Also show styles already checked in"
              color="untappd"
              checked={profileFilters.showHaveHad}
              onChange={handleToggle}
            />
            {stockList && (
              <Switch
                name="showOnlyMissingOnList"
                label={`Show Only On List: "${stockList.listName}"`}
                description="Only show missing styles that are also on the list"
                color="untappd"
                checked={profileFilters.showOnlyMissingOnList}
                onChange={handleToggle}
              />
            )}
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
