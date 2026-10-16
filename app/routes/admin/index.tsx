import {
	ActionIcon,
	Anchor,
	Button,
	Card,
	Code,
	Container,
	Divider,
	Group,
	Input,
	List,
	Loader,
	Menu,
	Stack,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
	IconArrowLeft,
	IconChevronDown,
	IconChevronRight,
	IconDots,
	IconFileSpreadsheet,
	IconTrash,
	IconUpload,
	IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Form,
	Link,
	redirect,
	useFetcher,
	useNavigation,
	useSubmit,
} from "react-router";
import { dataWithError, dataWithSuccess } from "remix-toast";

import { requireAdmin } from "~/auth/user.server";
import { importFile } from "~/temporary-venues/import.server";
import {
	deleteTemporaryVenue,
	getTemporaryVenue,
	isVisible,
	listTemporaryVenues,
	newTemporaryVenueId,
	saveTemporaryVenue,
} from "~/temporary-venues/store.server";
import { getBeerTypes } from "~/untappd/api.server";
import { cached } from "~/untappd/cache.server";
import { isInvalidToken } from "~/untappd/client.server";
import type { Route } from "./+types/index";

const maxUploadBytes = 2 * 1024 * 1024;
const styleListTtlMs = 24 * 60 * 60 * 1000;

export function meta(_: Route.MetaArgs) {
	return [{ title: "Admin | Wheel of Styles" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await requireAdmin(request);

	const venues = (await listTemporaryVenues()).map((venue) => ({
		id: venue.id,
		name: venue.name,
		location: venue.location,
		url: venue.url,
		active: venue.active,
		visible: isVisible(venue),
		endsOn: venue.endsOn,
		updatedAt: venue.updatedAt,
		unknownStyles: venue.unknownStyles,
		menus: venue.menus.map((menu) => ({
			name: menu.name,
			count: menu.items.length,
		})),
	}));

	return { venues };
}

type ActionData = { errors?: string[] } | null;

const optionalText = (value: FormDataEntryValue | null) => {
	const text = typeof value === "string" ? value.trim() : "";
	return text || null;
};

const optionalDate = (value: FormDataEntryValue | null) => {
	const text = optionalText(value);
	return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
};

const getStyles = (accessToken: string) =>
	cached("beer-types", styleListTtlMs, () => getBeerTypes(accessToken));

/** Reads and imports the uploaded file, matching styles against Untappd's list */
const importUpload = async (
	file: FormDataEntryValue | null,
	accessToken: string,
) => {
	if (!(file instanceof File) || file.size === 0) {
		return { ok: false as const, errors: ["Choose an .xlsx or .csv file."] };
	}
	if (file.size > maxUploadBytes) {
		return { ok: false as const, errors: ["The file is larger than 2 MB."] };
	}

	const styles = await getStyles(accessToken);
	const styleIdsByName = new Map(
		styles.map((style) => [style.type_name.toLowerCase(), style.type_id]),
	);

	try {
		return await importFile(file, styleIdsByName, accessToken);
	} catch (error) {
		if (isInvalidToken(error)) throw redirect("/logout");
		throw error;
	}
};

const summary = ({
	menus,
	unknownStyles,
	lookedUp,
}: {
	menus: TemporaryVenueMenu[];
	unknownStyles: string[];
	lookedUp: number;
}) => {
	const beers = menus.reduce((sum, menu) => sum + menu.items.length, 0);
	const fetched = lookedUp > 0 ? ` ${lookedUp} filled in from Untappd.` : "";
	const unknown =
		unknownStyles.length > 0
			? ` ${unknownStyles.length} unknown style name(s).`
			: "";
	return `${beers} beers in ${menus.length} menu(s).${fetched}${unknown}`;
};

export async function action({ request }: Route.ActionArgs) {
	const admin = await requireAdmin(request);
	const form = await request.formData();
	const intent = form.get("intent");
	const id = Number(form.get("id"));
	const now = new Date().toISOString();

	if (intent === "create") {
		const name = optionalText(form.get("name"));
		if (!name) {
			return dataWithError<ActionData>(
				{ errors: ["Give the venue a name."] },
				"Venue not created",
			);
		}

		const result = await importUpload(form.get("file"), admin.accessToken);
		if (!result.ok) {
			return dataWithError<ActionData>(
				{ errors: result.errors },
				"Venue not created",
			);
		}

		await saveTemporaryVenue({
			id: await newTemporaryVenueId(),
			name,
			location: optionalText(form.get("location")),
			url: optionalText(form.get("url")),
			active: true,
			endsOn: optionalDate(form.get("endsOn")),
			createdAt: now,
			updatedAt: now,
			unknownStyles: result.unknownStyles,
			menus: result.menus,
		});

		return dataWithSuccess<ActionData>(
			null,
			`Created "${name}": ${summary(result)}`,
		);
	}

	const venue = await getTemporaryVenue(id);
	if (!venue) {
		return dataWithError<ActionData>(null, "That venue no longer exists");
	}

	switch (intent) {
		case "toggle":
			await saveTemporaryVenue({
				...venue,
				active: !venue.active,
				updatedAt: now,
			});
			return null;

		case "set-end-date":
			await saveTemporaryVenue({
				...venue,
				endsOn: optionalDate(form.get("endsOn")),
				updatedAt: now,
			});
			return null;

		case "replace": {
			const result = await importUpload(form.get("file"), admin.accessToken);
			if (!result.ok) {
				return dataWithError<ActionData>(
					{ errors: result.errors },
					"Beers not replaced",
				);
			}
			await saveTemporaryVenue({
				...venue,
				menus: result.menus,
				unknownStyles: result.unknownStyles,
				updatedAt: now,
			});
			return dataWithSuccess<ActionData>(
				null,
				`Replaced beers for "${venue.name}": ${summary(result)}`,
			);
		}

		case "delete":
			await deleteTemporaryVenue(id);
			return dataWithSuccess<ActionData>(null, `Deleted "${venue.name}"`);

		default:
			return dataWithError<ActionData>(null, "Unknown action");
	}
}

// Browsers report CSV as text/csv or (Windows) application/vnd.ms-excel
const dropzoneAccept = {
	"text/csv": [".csv"],
	"application/vnd.ms-excel": [".csv"],
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
		".xlsx",
	],
};

const uploadAccept =
	".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const uploadHelp = (
	<Text size="sm" c="dimmed">
		An Excel file from the{" "}
		<Anchor href="/admin/template.xlsx" size="sm" download>
			template
		</Anchor>
		, or a CSV. One row per beer with a header row. Only <Code>bid</Code> (the
		Untappd beer id) is required; <Code>name</Code>, <Code>brewery</Code>,{" "}
		<Code>style</Code>, <Code>abv</Code>, <Code>country</Code> and{" "}
		<Code>rating</Code> are filled in from Untappd when left empty.{" "}
		<Code>menu</Code> groups beers into menus. For CSV, comma or semicolon
		separated.
	</Text>
);

const VenueRow = ({
	venue,
}: {
	venue: Route.ComponentProps["loaderData"]["venues"][0];
}) => {
	const fetcher = useFetcher();
	const beersFetcher = useFetcher();
	const replaceForm = useRef<HTMLFormElement>(null);
	const [showBeers, setShowBeers] = useState(false);
	const beerCount = venue.menus.reduce((sum, menu) => sum + menu.count, 0);
	const menus = beersFetcher.data as VenueMenuDetails[] | undefined;

	const { load } = beersFetcher;
	const loadBeers = useCallback(
		() => load(`/api/venue/${venue.id}`),
		[load, venue.id],
	);

	// Reload while open when the beers are replaced
	// biome-ignore lint/correctness/useExhaustiveDependencies: updatedAt is the trigger
	useEffect(() => {
		if (showBeers) loadBeers();
	}, [venue.updatedAt]);

	const toggleBeers = () => {
		if (!showBeers) loadBeers();
		setShowBeers(!showBeers);
	};

	return (
		<>
			<Table.Tr>
				<Table.Td>
					<Group gap="md" wrap="nowrap" align="center">
						<ActionIcon
							variant="subtle"
							color="gray"
							onClick={toggleBeers}
							aria-label={showBeers ? "Hide beers" : "Show beers"}
							aria-expanded={showBeers}
						>
							{showBeers ? (
								<IconChevronDown size={18} stroke={1.5} />
							) : (
								<IconChevronRight size={18} stroke={1.5} />
							)}
						</ActionIcon>
						<Stack gap={2}>
							<Text fw={500}>
								{venue.url ? (
									<Anchor href={venue.url} target="_blank" c="dark">
										{venue.name}
									</Anchor>
								) : (
									venue.name
								)}
							</Text>
							{venue.location && (
								<Text size="xs" c="dimmed">
									{venue.location}
								</Text>
							)}
							<Text size="xs" c="dimmed">
								{beerCount} beers ·{" "}
								{venue.menus
									.map((menu) => `${menu.name} (${menu.count})`)
									.join(", ")}
							</Text>
							{venue.unknownStyles.length > 0 && (
								<Tooltip
									multiline
									w={320}
									withArrow
									label={venue.unknownStyles.join(", ")}
								>
									<Text size="xs" c="orange" w="fit-content">
										{venue.unknownStyles.length} unknown style name(s)
									</Text>
								</Tooltip>
							)}
						</Stack>
					</Group>
				</Table.Td>
				<Table.Td>
					<fetcher.Form method="post">
						<input type="hidden" name="intent" value="set-end-date" />
						<input type="hidden" name="id" value={venue.id} />
						<TextInput
							type="date"
							name="endsOn"
							size="xs"
							defaultValue={venue.endsOn ?? ""}
							onChange={(event) => fetcher.submit(event.currentTarget.form)}
							aria-label="Last day"
							// Active but hidden: the last day has passed
							error={venue.active && !venue.visible ? "Ended" : undefined}
							styles={{ error: { color: "var(--mantine-color-orange-7)" } }}
						/>
					</fetcher.Form>
				</Table.Td>
				<Table.Td>
					<fetcher.Form method="post">
						<input type="hidden" name="intent" value="toggle" />
						<input type="hidden" name="id" value={venue.id} />
						<Group justify="center">
							<Switch
								color="untappd"
								checked={venue.active}
								onChange={(event) => fetcher.submit(event.currentTarget.form)}
								aria-label="Active"
							/>
						</Group>
					</fetcher.Form>
				</Table.Td>
				<Table.Td style={{ verticalAlign: "middle" }}>
					{/* Picked from the menu below; submits as soon as a file is chosen */}
					<Form method="post" encType="multipart/form-data" ref={replaceForm}>
						<input type="hidden" name="intent" value="replace" />
						<input type="hidden" name="id" value={venue.id} />
						<input
							type="file"
							name="file"
							accept={uploadAccept}
							hidden
							onChange={() => replaceForm.current?.requestSubmit()}
						/>
					</Form>
					<Group justify="center">
						<Menu position="bottom-end" withArrow>
							<Menu.Target>
								<ActionIcon variant="subtle" color="gray" aria-label="Actions">
									<IconDots size={18} stroke={1.5} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconUpload size={14} />}
									onClick={() =>
										replaceForm.current
											?.querySelector<HTMLInputElement>("input[type=file]")
											?.click()
									}
								>
									Replace beers
								</Menu.Item>
								<Menu.Item
									color="red"
									leftSection={<IconTrash size={14} />}
									onClick={() => {
										if (confirm(`Delete "${venue.name}"?`)) {
											fetcher.submit(
												{ intent: "delete", id: venue.id },
												{ method: "post" },
											);
										}
									}}
								>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Table.Td>
			</Table.Tr>
			{showBeers && (
				<Table.Tr>
					<Table.Td colSpan={4} bg="var(--mantine-color-gray-0)">
						{!menus ? (
							<Loader size="sm" color="untappd" m="sm" />
						) : (
							<VenueBeers menus={menus} />
						)}
					</Table.Td>
				</Table.Tr>
			)}
		</>
	);
};

/** The uploaded beers per menu; styles Untappd doesn't know are highlighted */
const VenueBeers = ({ menus }: { menus: VenueMenuDetails[] }) => (
	<Stack gap="md" p="xs">
		{menus.map((menu) => {
			const beers = menu.sections.items.flatMap((section) => section.items);

			return (
				<Stack key={menu.menu_id} gap={4}>
					<Text size="sm" fw={500}>
						{menu.menu_name} ({beers.length})
					</Text>
					<Table striped withRowBorders={false} fz="xs" verticalSpacing={2}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Beer</Table.Th>
								<Table.Th>Brewery</Table.Th>
								<Table.Th>Style</Table.Th>
								<Table.Th ta="right">ABV</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{beers.map(({ beer, brewery }) => (
								<Table.Tr key={beer.bid}>
									<Table.Td>
										<Anchor
											href={`https://untappd.com/b/-/${beer.bid}`}
											target="_blank"
											size="xs"
											c="dark"
										>
											{beer.beer_name}
										</Anchor>
									</Table.Td>
									<Table.Td>{brewery.brewery_name}</Table.Td>
									<Table.Td>
										{beer.beer_style_id ? (
											beer.beer_style
										) : (
											<Tooltip label="Not an Untappd style name" withArrow>
												<Text span fz="xs" c="orange">
													{beer.beer_style}
												</Text>
											</Tooltip>
										)}
									</Table.Td>
									<Table.Td ta="right">
										{beer.beer_abv ? `${beer.beer_abv}%` : ""}
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Stack>
			);
		})}
	</Stack>
);

export default function Admin({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const { venues } = loaderData;
	const navigation = useNavigation();
	const submit = useSubmit();
	const createForm = useRef<HTMLFormElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const creating =
		navigation.state === "submitting" &&
		navigation.formData?.get("intent") === "create";

	// Clear the form after a successful create
	useEffect(() => {
		if (navigation.state === "idle" && !actionData?.errors) {
			createForm.current?.reset();
			setFile(null);
		}
	}, [navigation.state, actionData]);

	// The dropzone keeps the file in state, so add it to the form data here
	const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!file) {
			setFileError("Add a file with the beers.");
			return;
		}

		const formData = new FormData(event.currentTarget);
		formData.set("file", file);
		submit(formData, { method: "post", encType: "multipart/form-data" });
	};

	return (
		<Container size="1000" my="lg">
			<Anchor component={Link} to="/" size="sm" c="dimmed">
				<Group gap={4}>
					<IconArrowLeft size={14} />
					Back
				</Group>
			</Anchor>
			<Title order={2} mt="sm">
				Temporary venues
			</Title>
			<Text c="dimmed" size="sm">
				Uploaded venues show up in every venue search while they're active.
			</Text>

			<Card withBorder mt="lg" padding="lg">
				<Text fw={500} mb="xs">
					Add a venue
				</Text>
				<Form
					method="post"
					encType="multipart/form-data"
					ref={createForm}
					onSubmit={handleCreate}
				>
					<input type="hidden" name="intent" value="create" />
					<Stack gap="sm">
						<Group grow align="flex-start">
							<TextInput name="name" label="Name" required />
							<TextInput name="location" label="Location" />
						</Group>
						<Group grow align="flex-start">
							<TextInput name="url" label="Link" type="url" />
							<TextInput name="endsOn" label="Last day" type="date" />
						</Group>
						<Input.Wrapper
							label="Beers"
							required
							description={uploadHelp}
							error={fileError}
						>
							<Dropzone
								mt="xs"
								multiple={false}
								accept={dropzoneAccept}
								maxSize={maxUploadBytes}
								onDrop={([dropped]) => {
									setFile(dropped);
									setFileError(null);
								}}
								onReject={([rejection]) => {
									setFile(null);
									setFileError(
										rejection?.errors[0]?.code === "file-too-large"
											? "The file is larger than 2 MB."
											: "Use an .xlsx or .csv file.",
									);
								}}
							>
								<Group
									justify="center"
									gap="sm"
									mih={80}
									style={{ pointerEvents: "none" }}
								>
									<Dropzone.Accept>
										<IconFileSpreadsheet size={32} stroke={1.5} />
									</Dropzone.Accept>
									<Dropzone.Reject>
										<IconX size={32} stroke={1.5} />
									</Dropzone.Reject>
									<Dropzone.Idle>
										<IconFileSpreadsheet size={32} stroke={1.5} color="gray" />
									</Dropzone.Idle>
									<Stack gap={0}>
										<Text size="sm" fw={file ? 500 : undefined}>
											{file ? file.name : "Drop an .xlsx or .csv file here"}
										</Text>
										<Text size="xs" c="dimmed">
											{file
												? "Drop or click to choose another file"
												: "or click to choose a file"}
										</Text>
									</Stack>
								</Group>
							</Dropzone>
						</Input.Wrapper>
						{actionData?.errors && (
							<List size="sm" c="red" spacing={2}>
								{actionData.errors.map((error) => (
									<List.Item key={error}>{error}</List.Item>
								))}
							</List>
						)}
						<Group justify="flex-end">
							<Button type="submit" color="untappd" loading={creating}>
								Add venue
							</Button>
						</Group>
					</Stack>
				</Form>
			</Card>

			<Divider my="lg" />

			{venues.length === 0 ? (
				<Text c="dimmed" fs="italic" ta="center">
					No temporary venues yet
				</Text>
			) : (
				<Table verticalSpacing="sm">
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Venue</Table.Th>
							<Table.Th>Last day</Table.Th>
							<Table.Th ta="center">Active</Table.Th>
							<Table.Th />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{venues.map((venue) => (
							<VenueRow key={venue.id} venue={venue} />
						))}
					</Table.Tbody>
				</Table>
			)}
		</Container>
	);
}
