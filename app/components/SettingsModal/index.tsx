import {
	Anchor,
	Button,
	Flex,
	Group,
	Modal,
	Select,
	Switch,
	Text,
	Tooltip,
} from "@mantine/core";
import type { PublicUser } from "~/auth/auth.server";

interface InputProps {
	opened: boolean;
	onClose: () => void;
	user: PublicUser;
	userLists: UserLists[];
	latestCommit: LatestCommit;
	stockList?: StockList;
	setStockListId: (listId: string | null) => void;
}

export const SettingsModal = ({
	opened,
	onClose,
	user,
	userLists,
	stockList,
	setStockListId,
	latestCommit,
}: InputProps) => {
	const lists = userLists
		.map((list) => ({
			value: String(list.list_id),
			label: list.list_name,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

	return (
		<Modal opened={opened} onClose={onClose} title="User Settings">
			<Select
				label="Your lists on Untappd"
				description={`Select a list with beers you already have. Used for features like "have the beer, but it's not yet checked in"`}
				placeholder="Select a list"
				data={lists}
				value={stockList ? stockList.listId : null}
				allowDeselect
				clearable
				// null when the selection is cleared
				onChange={(listId) => setStockListId(listId)}
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
						onClick={onClose}
					>
						Save
					</Button>
				</Group>
			</Flex>
		</Modal>
	);
};
