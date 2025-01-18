import { Autocomplete, Card, Divider, Text } from "@mantine/core";

export const VenueStyles = () => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="25px" fw="500">
        Venue Styles
      </Text>
      <Text fs="italic" mt="xs" c="dimmed">
        Pick a verified venue to see what styles they currently have
      </Text>

      <Divider mt="xs" mb="lg" />

      <Autocomplete
        placeholder="Find venue"
        data={["React", "Angular", "Vue", "Svelte"]}
      />
    </Card>
  );
};
