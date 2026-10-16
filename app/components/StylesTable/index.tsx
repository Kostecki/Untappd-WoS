import {
	Box,
	Card,
	Checkbox,
	Collapse,
	Flex,
	Loader,
	Stack,
	Table,
	Text,
	TextInput,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Fragment, useState } from "react";

import { getLocationQuery } from "~/hooks/location";
import { StyleBeers } from "./StyleBeers";

import "./style.css";

interface InputProps {
	styles: { styleId: number; styleName: string; had: boolean }[];
	stockListDetails: StockListDetails | undefined;
}

const rowInfoCache = new Map<number, StyleBeersPayload>();

export const StylesTable = ({ styles, stockListDetails }: InputProps) => {
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [openRow, setOpenRow] = useState<number | undefined>(undefined);
	const [styleBeers, setStyleBeers] = useState<StyleBeersPayload>({
		topRated: [],
		nearby: [],
	});

	const { height: windowHeight } = useViewportSize();

	const getStyleBeers = async (
		styleId: number,
	): Promise<StyleBeersPayload> => {
		const cached = rowInfoCache.get(styleId);
		if (cached) {
			return cached;
		}

		const response = await fetch(
			`/api/style/${styleId}/beers${await getLocationQuery()}`,
		);
		const styleBeers: StyleBeersPayload = response.ok
			? await response.json()
			: { topRated: [], nearby: [] };
		rowInfoCache.set(styleId, styleBeers);

		return styleBeers;
	};

	const toggleRow = async (styleId: number) => {
		if (openRow === styleId) {
			setOpenRow(undefined);
		} else {
			setLoading(true);
			setOpenRow(styleId);

			setStyleBeers(await getStyleBeers(styleId));
			setLoading(false);
		}
	};

	const filteredStyles = styles.filter((style) =>
		style.styleName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const findBeerByStyle = (styleId: number) => {
		return stockListDetails?.listItems.find(
			(beer) => beer.beer.beer_style_id === styleId,
		);
	};

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<TextInput
				placeholder="Search for styles"
				onChange={(event) => setSearchTerm(event.currentTarget.value)}
			/>

			{/* Scroll on a wrapper so the table keeps its normal full-width layout */}
			<Box
				mt="lg"
				style={{
					overflowY: "auto",
					maxHeight: windowHeight - 140,
					scrollbarWidth: "thin",
				}}
			>
				<Table stickyHeader>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{`Styles (${filteredStyles.length})`}</Table.Th>
							<Table.Th ta="center" w={1} style={{ whiteSpace: "nowrap" }}>
								Have Had
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredStyles.map((style) => {
							const haveStyleInStock = stockListDetails?.styles.includes(
								style.styleId,
							);

							const ShowHaveStyleInStock = () => {
								if (haveStyleInStock) {
									const beer = findBeerByStyle(style.styleId);

									if (beer) {
										return (
											<Text fw="500" size="xs" ml="sm" fs="italic" c="dimmed">
												On list: {stockListDetails?.listName}
											</Text>
										);
									}
								}
							};

							return (
								<Fragment key={style.styleId}>
									<Table.Tr
										onClick={() => toggleRow(style.styleId)}
										style={{ cursor: "pointer", userSelect: "none" }}
									>
										<Table.Td>
											<Flex align="center">
												{openRow === style.styleId ? (
													<IconChevronDown size={20} color="gray" stroke={1.5} />
												) : (
													<IconChevronUp size={20} color="gray" stroke={1.5} />
												)}

												<Stack gap={0}>
													<Text fw="500" size="xs" ml="sm">
														{style.styleName}
													</Text>
													<ShowHaveStyleInStock />
												</Stack>
											</Flex>
										</Table.Td>

										<Table.Td>
											<Flex justify="center">
												<Checkbox
													color="untappd"
													checked={style.had}
													indeterminate={haveStyleInStock}
													readOnly
												/>
											</Flex>
										</Table.Td>

									</Table.Tr>
									<Table.Tr style={{ border: "none" }}>
										<Table.Td colSpan={2} p={0}>
											<Collapse expanded={openRow === style.styleId}>
												{loading ? (
													<Flex justify="center">
														<Loader color="untappd" my="lg" />
													</Flex>
												) : (
													<StyleBeers {...styleBeers} />
												)}
											</Collapse>
										</Table.Td>
									</Table.Tr>
								</Fragment>
							);
						})}
					</Table.Tbody>
				</Table>
			</Box>
		</Card>
	);
};
