import { Autocomplete, Card, Divider, Text } from "@mantine/core";

export const CheckBeer = () => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="25px" fw="500">
        Check Beer
      </Text>
      <Text fs="italic" mt="xs" c="dimmed">
        Check a specific beer, by name or barcode, to see if it's a new style
      </Text>

      <Divider mt="xs" mb="lg" />

      <Autocomplete
        placeholder="Find beer"
        data={["React", "Angular", "Vue", "Svelte"]}
      />
    </Card>
  );
};
