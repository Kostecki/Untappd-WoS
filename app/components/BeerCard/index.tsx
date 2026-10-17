import { Badge, Card, Flex, Group, Rating, Stack, Text } from "@mantine/core";
import { IconCircleFilled, IconExternalLink } from "@tabler/icons-react";

import countryToEmoji from "~/countries";

import "./style.css";

interface BeerCardItem {
	beer: Beer;
	brewery: Pick<Brewery, "brewery_name" | "country_name">;
	has_had?: boolean;
	on_list?: boolean;
}

export const BeerCard = ({
	beerItem,
	styleCoveredBy,
}: {
	beerItem: BeerCardItem;
	/** Name of the list with another beer in this style */
	styleCoveredBy?: string;
}) => {
	const {
		beer: { bid, beer_name, beer_slug, beer_abv, beer_style, rating_score },
		brewery: { brewery_name, country_name },
		has_had,
		on_list,
	} = beerItem;

	return (
		<Card
			component="a"
			href={`https://untappd.com/b/${beer_slug}/${bid}`}
			target="_blank"
			className="beer-card"
			shadow="none"
			p="xs"
		>
			<Flex justify="space-between">
				<Stack gap="0">
					<Stack gap={0} mb="xs">
						<Group gap="xs">
							<Text>{beer_name}</Text>
							{has_had && (
								<Badge size="xs" variant="light" color="gray">
									Had
								</Badge>
							)}
							{on_list && (
								<Badge size="xs" variant="light" color="untappd">
									On your list
								</Badge>
							)}
							{styleCoveredBy && (
								<Badge size="xs" variant="dot" color="untappd">
									Style on your list
								</Badge>
							)}
						</Group>
						<Text size="sm" fs="italic" c="gray">
							{beer_style}
						</Text>
					</Stack>
					<Group gap={5}>
						<Text size="xs">{beer_abv}% ABV</Text>
						<Text size="xs">•</Text>
						<Text size="xs">{brewery_name}</Text>
						<Text size="xs">{countryToEmoji(country_name)}</Text>
						<Text size="xs">•</Text>
						<Group gap={0}>
							<Rating
								value={rating_score}
								fractions={10}
								size="xs"
								mt="-2px"
								mr="6"
								readOnly
								emptySymbol={<IconCircleFilled color="#d8d8d8" size={12} />}
								fullSymbol={<IconCircleFilled color="#ffc100" size={12} />}
							/>
							<Text size="xs">({rating_score.toFixed(2)})</Text>
						</Group>
					</Group>
				</Stack>
				<Stack gap="0">
					<IconExternalLink size={16} />
				</Stack>
			</Flex>
		</Card>
	);
};
