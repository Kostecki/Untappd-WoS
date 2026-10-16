import {
	Anchor,
	Badge,
	Button,
	Collapse,
	Flex,
	Group,
	Loader,
	Stack,
	Switch,
	Text,
} from "@mantine/core";
import { IconMapPin, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

import countryToEmoji from "~/countries";
import { getLocationQuery } from "~/hooks/location";

const placesCache = new Map<number, BeerFindPlace[]>();

const formatDistance = (km: number) =>
	km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

const formatAgo = (date: string) => {
	const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
	if (days <= 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 60) return `${days} days ago`;
	return new Date(date).toLocaleDateString();
};

const Places = ({
	places,
	shopsOnly,
}: {
	places: BeerFindPlace[];
	shopsOnly: boolean;
}) => {
	const visible = shopsOnly ? places.filter((place) => place.isShop) : places;

	if (visible.length === 0) {
		return (
			<Text size="xs" c="dimmed" fs="italic">
				{shopsOnly ? "No shops nearby" : "Not found nearby"}
			</Text>
		);
	}

	return (
		<Stack gap={4}>
			{visible.map((place) => (
				<Group key={place.venueId} gap="xs" wrap="nowrap">
					<Text size="xs" c="dimmed" w={50} ta="right">
						{formatDistance(place.distance)}
					</Text>
					<Anchor
						href={`https://untappd.com/v/${place.venueSlug}/${place.venueId}`}
						target="_blank"
						size="xs"
						c="dark"
					>
						{place.venueName}
					</Anchor>
					{place.isShop && (
						<Badge size="xs" color="untappd" variant="light">
							Shop
						</Badge>
					)}
					<Text size="xs" c="dimmed">
						{place.source === "menu"
							? `on menu since ${formatAgo(place.date)}`
							: `checked in ${formatAgo(place.date)}`}
					</Text>
				</Group>
			))}
		</Stack>
	);
};

// Search engines find web shops better than Untappd does
const getOnlineSearchURL = (beerName: string, breweryName: string) =>
	`https://www.google.com/search?${new URLSearchParams({ q: `"${beerName}" ${breweryName} buy` })}`;

const StyleBeer = ({
	item,
	shopsOnly,
}: {
	item: TopRatedBeer | RelatedBeersResponse;
	shopsOnly: boolean;
}) => {
	const [places, setPlaces] = useState<BeerFindPlace[] | undefined>(
		placesCache.get(item.beer.bid),
	);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const {
		beer: { bid, beer_name, beer_slug, rating_score },
		brewery: { brewery_name, country_name },
	} = item;
	const seenNearby = "venue" in item ? item : undefined;

	const toggle = async () => {
		setOpen((value) => !value);
		if (places) return;

		setLoading(true);
		try {
			const response = await fetch(
				`/api/beer/${bid}/find${await getLocationQuery()}`,
			);
			const data: BeerFindPlace[] = response.ok ? await response.json() : [];
			placesCache.set(bid, data);
			setPlaces(data);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Stack gap={4} px="sm" py="xs" className="related-beer">
			<Flex justify="space-between" align="flex-start" gap="xs">
				<Stack gap={0}>
					<Anchor
						href={`https://untappd.com/b/${beer_slug}/${bid}`}
						target="_blank"
						size="sm"
						c="dark"
					>
						{beer_name}
					</Anchor>
					<Text size="sm" c="dimmed">
						{brewery_name}, {country_name} {countryToEmoji(country_name)}
					</Text>
					{seenNearby ? (
						<Text size="xs" c="dimmed">
							{seenNearby.venue
								? `Seen at ${seenNearby.venue.venue_name}`
								: "Checked in"}{" "}
							· {formatDistance(seenNearby.distance)} ·{" "}
							{formatAgo(seenNearby.recent_created_at)}
						</Text>
					) : (
						<Text size="xs" c="dimmed">
							Rated {rating_score.toFixed(2)}
						</Text>
					)}
				</Stack>
				<Stack gap={2} align="flex-end">
					<Button
						component="a"
						href={getOnlineSearchURL(beer_name, brewery_name)}
						target="_blank"
						size="compact-xs"
						variant="subtle"
						color="gray"
						leftSection={<IconSearch size={14} />}
					>
						Search online
					</Button>
					<Button
						size="compact-xs"
						variant="subtle"
						color="gray"
						leftSection={<IconMapPin size={14} />}
						onClick={toggle}
					>
						Where to find
					</Button>
				</Stack>
			</Flex>

			<Collapse expanded={open}>
				{loading ? (
					<Loader size="xs" color="untappd" ml="sm" />
				) : (
					places && <Places places={places} shopsOnly={shopsOnly} />
				)}
			</Collapse>
		</Stack>
	);
};

export const StyleBeers = ({ topRated, nearby }: StyleBeersPayload) => {
	const [shopsOnly, setShopsOnly] = useState(false);

	if (topRated.length === 0 && nearby.length === 0) {
		return (
			<Text size="sm" c="dimmed" fs="italic" ta="center" my="lg">
				No beers found in this style
			</Text>
		);
	}

	return (
		<Stack gap={0} my="sm">
			<Group justify="flex-end" px="sm">
				<Switch
					size="xs"
					color="untappd"
					label="Shops only"
					checked={shopsOnly}
					onChange={(event) => setShopsOnly(event.currentTarget.checked)}
				/>
			</Group>

			{topRated.length > 0 && (
				<>
					<Text size="xs" c="dimmed" fw="500" px="sm" mt="xs">
						Top rated, still brewed
					</Text>
					{topRated.map((item) => (
						<StyleBeer key={item.beer.bid} item={item} shopsOnly={shopsOnly} />
					))}
				</>
			)}

			{nearby.length > 0 && (
				<>
					<Text size="xs" c="dimmed" fw="500" px="sm" mt="md">
						Seen near you
					</Text>
					{nearby.map((item) => (
						<StyleBeer key={item.beer.bid} item={item} shopsOnly={shopsOnly} />
					))}
				</>
			)}
		</Stack>
	);
};
