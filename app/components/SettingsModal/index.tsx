import { Modal, Select, Switch, Text } from "@mantine/core";
import type { PublicUser } from "~/auth/auth.server";

interface InputProps {
	opened: boolean;
	onClose: () => void;
	user: PublicUser;
	userLists: UserLists[];
	stockList?: StockList;
	setStockListId: (listId: string | null) => void;
}

export const SettingsModal = ({
	opened,
	onClose,
	userLists,
	stockList,
	setStockListId,
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
		</Modal>
	);
};
