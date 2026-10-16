import { Anchor, Stack, Text } from "@mantine/core";

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

const StyleBeer = ({ item }: { item: TopRatedBeer | RelatedBeersResponse }) => {
	const {
		beer: { bid, beer_name, beer_slug, rating_score },
		brewery: { brewery_name, country_name },
	} = item;
	const seenNearby = "venue" in item ? item : undefined;

	return (
		<Anchor
			href={`https://untappd.com/b/${beer_slug}/${bid}`}
			target="_blank"
			underline="never"
		>
			<Stack gap={0} px="sm" py="xs" className="related-beer">
				<Text size="sm" c="dark">
					{beer_name}
				</Text>
				<Text size="sm" c="dimmed">
					{brewery_name}, {country_name} {countryToEmoji(country_name)}
				</Text>
				<Text size="xs" c="dimmed">
					{seenNearby
						? `${
								seenNearby.venue
									? `Seen at ${seenNearby.venue.venue_name}`
									: "Checked in"
							} · ${formatDistance(seenNearby.distance)} · ${formatAgo(
								seenNearby.recent_created_at,
							)}`
						: `Rated ${rating_score.toFixed(2)}`}
				</Text>
			</Stack>
		</Anchor>
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
			{topRated.length > 0 && (
				<>
					<Text size="xs" c="dimmed" fw="500" px="sm">
						Top rated, still brewed (European breweries first)
					</Text>
					{topRated.map((item) => (
						<StyleBeer key={item.beer.bid} item={item} />
					))}
				</>
			)}

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
