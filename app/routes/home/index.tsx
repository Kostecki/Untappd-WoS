import { Box, Container, Grid } from "@mantine/core";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLoaderData } from "react-router";

import { apiFetch } from "~/api.client";
import { requireUser } from "~/auth/user.server";
import { CheckBeer } from "~/components/CheckBeer";
import { Profile } from "~/components/Profile";
import { StylesTable } from "~/components/StylesTable";
import { VenueStyles } from "~/components/VenueStyles";
import { useUmamiIdentify } from "~/hooks/umami";
import { getSettings, Settings, setSettings } from "~/utils";
import type { Route } from "./+types/index";
import { getStylesInfo, getUserLists } from "./loader";

export function meta(_: Route.MetaArgs) {
	return [{ title: "Wheel of Styles" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const user = await requireUser(request);

	const [stylesInfo, userLists] = await Promise.all([
		getStylesInfo(user),
		getUserLists(user),
	]);

	const latestCommit = {
		hash: process.env.LATEST_COMMIT_HASH ?? "No commit hash",
		message: process.env.LATEST_COMMIT_MESSAGE ?? "No commit message",
	};

	const isProd = import.meta.env.PROD;

	const mbccEnabled = process.env.MBCC_ENABLED !== "0";

	return { user, stylesInfo, userLists, latestCommit, isProd, mbccEnabled };
}

const defaultProfileFilters: Filters = {
	showHaveHad: false,
	showOnlyMissing: true,
	showOnlyMissingOnList: false,
};

export default function Home() {
	const data = useLoaderData<typeof loader>();
	const { user, stylesInfo, userLists, latestCommit, mbccEnabled } = data;

	const [profileFilters, setProfileFilters] = useState<Filters>(
		defaultProfileFilters,
	);
	const [stockList, setStockList] = useState<StockList | undefined>(undefined);
	const [stockListDetails, setStockListDetails] = useState<
		StockListDetails | undefined
	>(undefined);

	const { id: userId, email, userName: username } = user;
	useUmamiIdentify(userId, email, username);

	useLayoutEffect(() => {
		const settings = getSettings();

		if (Object.keys(settings).length === 0 && settings.constructor === Object) {
			setSettings(Settings.STOCK_LIST, { listId: "", listName: "" });
			setSettings(Settings.TABLE_FILTERS, defaultProfileFilters);
		} else {
			setStockList(settings.stockList);
			setProfileFilters(settings.tableFilters);
		}
	}, []);

	useEffect(() => {
		const fetchListDetails = async () => {
			if (stockList?.listId) {
				const listDetailsResponse = await apiFetch(
					`/api/list/${stockList.listId}`,
					{ signal: controller.signal },
				);

				if (!listDetailsResponse.ok) {
					setStockListDetails(undefined);
					return;
				}

				const { list_name, listItems, styleIds }: ListDetailsPayload =
					await listDetailsResponse.json();

				setStockListDetails({
					listName: list_name,
					listItems,
					styles: styleIds,
				});
			} else {
				setStockListDetails(undefined);
			}
		};

		const controller = new AbortController();
		fetchListDetails().catch((error) => {
			if (!controller.signal.aborted) {
				console.error("Failed to load list details", error);
			}
		});

		return () => controller.abort();
	}, [stockList]);

	const filteredStyles = stylesInfo.styles.filter((style) => {
		if (profileFilters.showHaveHad) {
			// Show all styles, ignoring other filters
			return true;
		}

		if (profileFilters.showOnlyMissing) {
			// Show only missing styles, ignoring stock list filter
			return !style.had && !stockListDetails?.styles.includes(style.styleId);
		}

		if (profileFilters.showOnlyMissingOnList) {
			// Show only missing styles that are also in the stock list
			return !style.had && stockListDetails?.styles.includes(style.styleId);
		}

		// Default: Show only missing styles
		return !style.had;
	});

	return (
		<Container size="1200">
			<Grid mt="lg">
				<Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 2, lg: 1 }}>
					<StylesTable
						styles={filteredStyles}
						stockListDetails={stockListDetails}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 1, lg: 2 }}>
					<Profile
						user={user}
						stylesInfo={stylesInfo}
						userLists={userLists}
						stockList={stockList}
						stockListDetails={stockListDetails}
						setStockList={setStockList}
						profileFilters={profileFilters}
						setProfileFilters={setProfileFilters}
						latestCommit={latestCommit}
					/>
					<Box my="md">
						<VenueStyles styles={stylesInfo.styles} mbccEnabled={mbccEnabled} />
					</Box>
					<CheckBeer
						styles={stylesInfo.styles}
						stockListDetails={stockListDetails}
					/>
				</Grid.Col>
			</Grid>
		</Container>
	);
}
