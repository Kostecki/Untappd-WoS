import { ActionIcon, Anchor, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconBrandGoogle } from "@tabler/icons-react";

import countryToEmoji from "~/countries";

const formatDistance = (km: number) =>
	km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

const formatAgo = (date: string) => {
	const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
	if (days <= 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 60) return `${days} days ago`;
	return new Date(date).toLocaleDateString();
};

const getGoogleSearchURL = (beerName: string, breweryName: string) =>
	`https://www.google.com/search?${new URLSearchParams({ q: `${beerName} - ${breweryName}` })}`;

const StyleBeer = ({ item }: { item: TopRatedBeer | RelatedBeersResponse }) => {
	const {
		beer: { bid, beer_name, beer_slug },
		brewery: { brewery_name, country_name },
	} = item;
	const seenNearby = "venue" in item ? item : undefined;

	return (
		<Group gap="xs" wrap="nowrap" className="related-beer" pr="sm">
			<Anchor
				href={`https://untappd.com/b/${beer_slug}/${bid}`}
				target="_blank"
				underline="never"
				style={{ flex: 1, minWidth: 0 }}
			>
				<Stack gap={0} px="sm" py="xs">
					<Text size="sm" c="dark">
						{beer_name}
					</Text>
					<Text size="sm" c="dimmed">
						{brewery_name}, {country_name} {countryToEmoji(country_name)}
					</Text>
					{seenNearby && (
						<Text size="xs" c="dimmed">
							{seenNearby.venue
								? `Seen at ${seenNearby.venue.venue_name}`
								: "Checked in"}{" "}
							· {formatDistance(seenNearby.distance)} ·{" "}
							{formatAgo(seenNearby.recent_created_at)}
						</Text>
					)}
				</Stack>
			</Anchor>
			<Tooltip label="Search on Google" withArrow>
				<ActionIcon
					component="a"
					href={getGoogleSearchURL(beer_name, brewery_name)}
					target="_blank"
					variant="subtle"
					color="gray"
					aria-label={`Search Google for ${beer_name}`}
				>
					<IconBrandGoogle size={18} stroke={1.5} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
};

export const StyleBeers = ({ topRated, nearby }: StyleBeersPayload) => {
	if (topRated.length === 0 && nearby.length === 0) {
		return (
			<Text size="sm" c="dimmed" fs="italic" ta="center" my="lg">
				No beers found in this style
			</Text>
		);
	}

	return (
		<Stack gap={0} my="sm">
			{topRated.map((item) => (
				<StyleBeer key={item.beer.bid} item={item} />
			))}

			{nearby.length > 0 && (
				<>
					<Text size="xs" c="dimmed" fw="500" px="sm" mt="md">
						Seen near you
					</Text>
					{nearby.map((item) => (
						<StyleBeer key={item.beer.bid} item={item} />
					))}
				</>
			)}
		</Stack>
	);
};
