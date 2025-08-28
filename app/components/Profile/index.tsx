import {
	ActionIcon,
	Avatar,
	Card,
	Divider,
	Flex,
	Group,
	Stack,
	Switch,
	Text,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import { Link } from "react-router";
import type { SessionUser } from "~/auth/auth.server";
import { isMobile, Settings, setSettings } from "~/utils";

import { Ring } from "../Ring";
import { SettingsModal } from "../SettingsModal";

interface InputProps {
	user: SessionUser;
	stylesInfo: StylesInfo;
	userLists: UserLists[];
	stockList?: StockList;
	stockListDetails?: StockListDetails;
	setStockList: React.Dispatch<React.SetStateAction<StockList | undefined>>;
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
	setStockList,
	setProfileFilters,
	profileFilters,
	latestCommit,
}: InputProps) => {
	const { ref, width } = useElementSize();
	const mobile = isMobile();

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
						latestCommit={latestCommit}
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
