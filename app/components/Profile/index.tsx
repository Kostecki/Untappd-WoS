import {
	ActionIcon,
	Anchor,
	Avatar,
	Card,
	Divider,
	Flex,
	Group,
	Menu,
	Stack,
	Switch,
	Text,
	Tooltip,
} from "@mantine/core";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { IconLogout, IconSettings, IconTool } from "@tabler/icons-react";
import { Link } from "react-router";
import type { PublicUser } from "~/auth/auth.server";
import { Settings, setSettings, useIsMobile } from "~/utils";

import { Ring } from "../Ring";
import { SettingsModal } from "../SettingsModal";

interface InputProps {
	user: PublicUser;
	stylesInfo: StylesInfo;
	userLists: UserLists[];
	stockList?: StockList;
	stockListDetails?: StockListDetails;
	setStockListId: (listId: string | null) => void;
	setProfileFilters: React.Dispatch<React.SetStateAction<Filters>>;
	profileFilters: Filters;
	latestCommit: LatestCommit;
}

export const Profile = ({
	user,
	stylesInfo,
	userLists,
	stockList,
	stockListDetails,
	setStockListId,
	setProfileFilters,
	profileFilters,
	latestCommit,
}: InputProps) => {
	const { ref, width } = useElementSize();
	// Opened from the menu; the modal lives outside the menu, which unmounts
	// its dropdown when it closes
	const [settingsOpened, settings] = useDisclosure(false);
	const mobile = useIsMobile();

	const fullName = `${user.firstName} ${user.lastName}`;
	const {
		hadCount,
		notHadCount,
		totalCount,
		level: { currentLevel, progressToNext, checkInsPerLevel, maxLevel },
	} = stylesInfo.stats;

	const missingStyles = stylesInfo.styles
		.filter((style) => !style.had)
		.map((style) => style.styleId);

	const missingStylesHadCount = stockListDetails?.styles.filter((style) =>
		missingStyles.includes(style),
	).length;

	const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.currentTarget;

		const newFilters = {
			...profileFilters,
			[name]: checked,
			showHaveHad: name === "showHaveHad" ? checked : false,
			showOnlyMissing: name === "showOnlyMissing" ? checked : false,
			showOnlyMissingOnList: name === "showOnlyMissingOnList" ? checked : false,
		};

		setProfileFilters(newFilters);
		setSettings(Settings.TABLE_FILTERS, newFilters);
	};

	const BadgeLabel = () => (
		<Text size="md" ta="center" fw="bold">
			Badge
		</Text>
	);
	const StyleLabel = () => (
		<Text size="md" ta="center" fw="bold">
			Style
		</Text>
	);
	const LevelLabel = () => (
		<Text size="md" ta="center" fw="bold">
			Level
		</Text>
	);

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Flex justify="space-between" align="center">
				<Group>
					<Avatar src={user.userAvatarURL} alt={fullName} />
					<Stack gap={0}>
						<Text size="md">{fullName}</Text>
						<Text
							size="xs"
							fs="italic"
							c="dimmed"
							component="a"
							href={`https://untappd.com/user/${user.userName}`}
							target="_blank"
						>
							@{user.userName}
						</Text>
					</Stack>
				</Group>
				<Menu width={200} withArrow>
					<Menu.Target>
						<ActionIcon variant="transparent" color="dark" aria-label="Menu">
							<IconSettings stroke={1} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconSettings stroke={1} />}
							onClick={settings.open}
						>
							User Settings
						</Menu.Item>
						{user.isAdmin && (
							<Menu.Item
								leftSection={<IconTool stroke={1} />}
								component={Link}
								to="/admin"
								aria-label="Admin"
							>
								Admin Panel
							</Menu.Item>
						)}
						<Menu.Divider />

						<Menu.Item
							leftSection={<IconLogout stroke={1} />}
							component={Link}
							to="/logout"
							aria-label="Logout"
						>
							Logout
						</Menu.Item>

						<Menu.Divider />

						{user.isAdmin && (
							<Group gap={0} justify="center" mt="xs" mb="5">
								<Tooltip
									label={latestCommit.message}
									position="bottom"
									withArrow
								>
									<Anchor
										href={`https://github.com/Kostecki/Untappd-WoS/commit/${latestCommit.hash}`}
										target="_blank"
										fs="italic"
										c="dimmed"
										size="xs"
									>
										<Text>Latest commit: {latestCommit.hash}</Text>
									</Anchor>
								</Tooltip>
							</Group>
						)}
					</Menu.Dropdown>
				</Menu>
			</Flex>

			<SettingsModal
				opened={settingsOpened}
				onClose={settings.close}
				user={user}
				userLists={userLists}
				stockList={stockList}
				setStockListId={setStockListId}
			/>

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
					<Switch
						name="showOnlyMissing"
						label="Show Only Missing"
						description="Only show styles you haven't checked in yet (and don't own)"
						color="untappd"
						checked={profileFilters.showOnlyMissing}
						onChange={handleToggle}
					/>
					{stockList?.listId && (
						<Switch
							name="showOnlyMissingOnList"
							label={`Show Only On List: "${stockList.listName}"`}
							description="Only show missing styles that are also on the selected stock list"
							color="untappd"
							checked={profileFilters.showOnlyMissingOnList}
							onChange={handleToggle}
						/>
					)}
				</Stack>
			</Group>

			<Divider my="md" />
			<Flex justify="space-between" ref={ref}>
				<Flex direction="column">
					{mobile && <BadgeLabel />}
					<Ring size={width / 3} value={currentLevel} maxValue={maxLevel}>
						<Flex justify="center" direction="column">
							{!mobile && <BadgeLabel />}
							<Text size="sm" ta="center">
								{currentLevel} / {maxLevel}
							</Text>
						</Flex>
					</Ring>
				</Flex>
				<Flex direction="column">
					{mobile && <StyleLabel />}
					<Ring size={width / 3} value={hadCount} maxValue={totalCount}>
						<Flex justify="center" direction="column">
							{!mobile && <StyleLabel />}
							<Text size="sm" ta="center">
								{hadCount} / {totalCount}
							</Text>
							<Text size="sm" fs="italic" ta="center" mt="3" mb="-5">
								Left: {notHadCount}
							</Text>
							<Text size="sm" fs="italic" ta="center">
								Have: {missingStylesHadCount}
							</Text>
						</Flex>
					</Ring>
				</Flex>
				<Flex direction="column">
					{mobile && <LevelLabel />}
					<Ring
						size={width / 3}
						value={progressToNext}
						maxValue={checkInsPerLevel}
					>
						<Flex justify="center" direction="column">
							{!mobile && <LevelLabel />}
							<Text size="sm" ta="center">
								{progressToNext} / {checkInsPerLevel}
							</Text>
						</Flex>
					</Ring>
				</Flex>
			</Flex>
		</Card>
	);
};
