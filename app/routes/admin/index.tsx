import {
	Anchor,
	Badge,
	Button,
	Card,
	Code,
	Container,
	Divider,
	Group,
	Input,
	List,
	Stack,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowLeft, IconFileSpreadsheet, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, useFetcher, useNavigation, useSubmit } from "react-router";
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

	return importFile(file, styleIdsByName);
};

const summary = (menus: TemporaryVenueMenu[], unknownStyles: string[]) => {
	const beers = menus.reduce((sum, menu) => sum + menu.items.length, 0);
	const unknown =
		unknownStyles.length > 0
			? ` ${unknownStyles.length} unknown style name(s).`
			: "";
	return `${beers} beers in ${menus.length} menu(s).${unknown}`;
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
			`Created "${name}": ${summary(result.menus, result.unknownStyles)}`,
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
				`Replaced beers for "${venue.name}": ${summary(result.menus, result.unknownStyles)}`,
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
		</Anchor>{" "}
		(it has a dropdown of all Untappd styles), or a CSV. One row per beer with a
		header row. Required: <Code>bid</Code>, <Code>name</Code>,{" "}
		<Code>brewery</Code>, <Code>style</Code> (the Untappd style name). Optional:{" "}
		<Code>menu</Code> (groups beers into menus), <Code>abv</Code>,{" "}
		<Code>country</Code>, <Code>rating</Code>. For CSV, comma or semicolon
		separated.
	</Text>
);

const statusBadge = (
	venue: Route.ComponentProps["loaderData"]["venues"][0],
) => {
	if (venue.visible) return <Badge color="green">Visible</Badge>;
	if (!venue.active) return <Badge color="gray">Inactive</Badge>;
	return <Badge color="orange">Ended</Badge>;
};

const VenueRow = ({
	venue,
}: {
	venue: Route.ComponentProps["loaderData"]["venues"][0];
}) => {
	const fetcher = useFetcher();
	const replaceForm = useRef<HTMLFormElement>(null);
	const beerCount = venue.menus.reduce((sum, menu) => sum + menu.count, 0);

	return (
		<Table.Tr>
			<Table.Td>
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
			</Table.Td>
			<Table.Td>{statusBadge(venue)}</Table.Td>
			<Table.Td>
				<fetcher.Form method="post">
					<input type="hidden" name="intent" value="toggle" />
					<input type="hidden" name="id" value={venue.id} />
					<Switch
						color="untappd"
						checked={venue.active}
						onChange={(event) => fetcher.submit(event.currentTarget.form)}
						aria-label="Active"
					/>
				</fetcher.Form>
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
					/>
				</fetcher.Form>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
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
						<Button
							size="compact-xs"
							variant="subtle"
							color="gray"
							onClick={() =>
								replaceForm.current
									?.querySelector<HTMLInputElement>("input[type=file]")
									?.click()
							}
						>
							Replace beers
						</Button>
					</Form>
					<fetcher.Form
						method="post"
						onSubmit={(event) => {
							if (!confirm(`Delete "${venue.name}"?`)) event.preventDefault();
						}}
					>
						<input type="hidden" name="intent" value="delete" />
						<input type="hidden" name="id" value={venue.id} />
						<Button
							size="compact-xs"
							variant="subtle"
							color="red"
							type="submit"
						>
							Delete
						</Button>
					</fetcher.Form>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};

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
							<Table.Th>Status</Table.Th>
							<Table.Th>Active</Table.Th>
							<Table.Th>Last day</Table.Th>
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
