import {
	Anchor,
	Box,
	Card,
	type ComboboxStore,
	Divider,
	Stack,
	Tabs,
	Text,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { SearchSelect } from "../SearchSelect";
import { VenueBeerCard } from "../VenueBeerCard";

interface InputProps {
	styles: { styleId: number; styleName: string; had: boolean }[];
}

type FlattenedVenueMenuData = FlattenedMenuData & {
	mbcc_session?: MBCCSession;
};

const getMBCCSessionURL = (session: MBCCSession) => {
	return `https://mbcc.jonpacker.com/#session[{%22colour%22:%22${session}%22}]`;
};

export const VenueStyles = ({ styles }: InputProps) => {
	const [loading, setLoading] = useState(false);
	const [selectedVenue, setSelectedVenue] = useState<VenueDetails | undefined>(
		undefined,
	);
	const [mbccVenues, setMbccVenues] = useState<MBCCVenueDetails[]>([]);
	const [venueDetails, setVenueDetails] = useState<
		FlattenedVenueMenuData[] | undefined
	>(undefined);

	const isMBCCRelevant = import.meta.env.VITE_MBCC_ENABLED !== "0";

	useEffect(() => {
		const fetchMBCCVenues = async () => {
			if (!isMBCCRelevant) {
				setMbccVenues([]);
				return;
			}

			try {
				const response = await fetch("/api/mbcc/venues");
				const data = (await response.json()) as MBCCVenueDetails[];
				setMbccVenues(data);
			} catch (error) {
				console.error("Failed to load MBCC venues", error);
			}
		};

		fetchMBCCVenues();
	}, []);

	const isMBCCVenue = (venue: VenueDetails): venue is MBCCVenueDetails => {
		return "mbcc_event" in venue && venue.mbcc_event === true;
	};

	const handleVenueSelect = async (
		inputDataList?: VenueDetails[] | BeerStringSearchResponse[],
		_barcode?: number,
		optionValue?: string,
		combobox?: ComboboxStore,
	) => {
		setLoading(true);

		const venue = inputDataList?.find(
			(item): item is VenueDetails =>
				"venue_id" in item && String(item.venue_id) === optionValue,
		);

		if (venue) {
			setSelectedVenue(venue);

			const styleNameToId = new Map(
				styles.map((style) => [
					style.styleName.trim().toLowerCase(),
					style.styleId,
				]),
			);

			const haveHadStyleIds = styles
				.filter((style) => style.styleId && style.had)
				.map((style) => style.styleId);

			// Add 0 to filter out items without a style ("other" as style)
			haveHadStyleIds.push(0);

			const venueDetails = isMBCCVenue(venue)
				? await fetch("/api/mbcc/venue")
				: await fetch(`/api/venue/${venue.venue_id}`);
			const venueDetailsData: (VenueMenuDetails | MBCCVenueMenuDetails)[] =
				await venueDetails.json();

			// Flatten the menu data to have menus with all items from sub-sections and only new styles
			const flattenedMenuData = venueDetailsData.map((menu) => {
				return {
					menu_id: menu.menu_id,
					menu_name: menu.menu_name,
					menu_description: menu.menu_description,
					total_item_count: menu.total_item_count,
					created_at: menu.created_at,
					updated_at: menu.updated_at,
					mbcc_session: "mbcc_session" in menu ? menu.mbcc_session : undefined,
					items: menu.sections.items
						.flatMap((section) => section.items)
						.filter((item) => {
							const rawStyleId = item.beer.beer_style_id;
							const normalizedStyleName =
								item.beer.beer_style?.trim().toLowerCase() ?? "";
							const mappedStyleId = styleNameToId.get(normalizedStyleName);
							const effectiveStyleId =
								typeof rawStyleId === "number" && rawStyleId > 0
									? rawStyleId
									: mappedStyleId;

							if (effectiveStyleId === undefined) {
								return false;
							}

							return !haveHadStyleIds.includes(effectiveStyleId);
						}),
				};
			}) as FlattenedVenueMenuData[];

			setVenueDetails(flattenedMenuData);
		}

		setLoading(false);
		combobox?.closeDropdown();
	};

	const groupByStyles = (items: FlattenedVenueMenuData["items"]) => {
		return items
			.reduce<{ beer_style: string; beers: typeof items }[]>((acc, item) => {
				const style = item.beer?.beer_style?.trim() ?? "Unknown";
				let group = acc.find((group) => group.beer_style === style);

				if (!group) {
					group = { beer_style: style, beers: [] };
					acc.push(group);
				}

				group.beers.push(item);
				return acc;
			}, [])
			.sort((a, b) => a.beer_style.localeCompare(b.beer_style));
	};

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Text size="25px" fw="500">
				Venue Styles
			</Text>
			<Text fs="italic" mt="xs" c="dimmed">
				Pick a verified venue to see what new styles they might have
			</Text>

			<Divider mt="xs" mb="lg" />

			<SearchSelect
				apiURL="/api/venues"
				placeholder="Search for a venue"
				emptyText="No venues found"
				loading={loading}
				setLoading={setLoading}
				prependVenues={isMBCCRelevant ? mbccVenues : undefined}
				selectedVenue={selectedVenue}
				setSelectedVenue={setSelectedVenue}
				setVenueDetails={setVenueDetails}
				optionSelectHandler={handleVenueSelect}
				leftSection={true}
			/>

			{venueDetails && (
				<Box mt="lg">
					<Tabs
						color="untappd"
						mt="sm"
						defaultValue={String(venueDetails[0].menu_id)}
					>
						<Tabs.List>
							{venueDetails.map((item) => {
								const { menu_id, menu_name, total_item_count } = item;

								if (total_item_count === 0) {
									return null;
								}

								return (
									<Tabs.Tab key={menu_id} value={String(menu_id)}>
										{menu_name}
									</Tabs.Tab>
								);
							})}
						</Tabs.List>

						{venueDetails.map((item) => {
							const {
								menu_id,
								menu_description,
								total_item_count,
								items,
								mbcc_session,
							} = item;
							const menuURL =
								selectedVenue && isMBCCVenue(selectedVenue) && mbcc_session
									? getMBCCSessionURL(mbcc_session)
									: selectedVenue?.url;

							if (total_item_count === 0) {
								return null;
							}

							return (
								<Tabs.Panel key={menu_id} value={String(menu_id)}>
									<Stack mt="xs" mb="md" gap="0">
										<Text fs="italic" size="sm" c="dimmed">
											{menu_description}
										</Text>
										<Text c="untappd" size="sm" ta="right">
											<Anchor
												href={menuURL}
												target="_blank"
												c="untappd"
												underline="always"
												size="sm"
											>
												Menu on Untappd
											</Anchor>
										</Text>
									</Stack>

									{items.length === 0 && (
										<Text
											fs="italic"
											c="dimmed"
											fw="500"
											ta="center"
											mt="xl"
											mb="xs"
										>
											No new styles on this menu
										</Text>
									)}

									{groupByStyles(items).map((group, index) => (
										<VenueBeerCard
											key={group.beer_style}
											group={group}
											startOpen={index === 0}
										/>
									))}
								</Tabs.Panel>
							);
						})}
					</Tabs>
				</Box>
			)}
		</Card>
	);
};
