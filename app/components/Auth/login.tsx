import {
  Card,
  Container,
  Flex,
  Image,
  Text,
  Stack,
  TextInput,
  Button,
  PasswordInput,
} from "@mantine/core";
import { Form, useNavigation } from "react-router";

export default function Login() {
  const navigation = useNavigation();
  const isLoading = ["submitting", "loading"].includes(navigation.state);

  return (
    <Container mt="xl" size="480">
      <Card shadow="sm" padding="lg" withBorder>
        <Flex justify="center">
          <Image
            src="/the-wheel.jpg"
            w="200"
            h="auto"
            alt="Wheel of Styles logo"
          />
        </Flex>
        <Text fs="italic" my="lg" c="dimmed" fw="500">
          Use your Untappd account to log in
        </Text>

        <Form method="post">
          <Stack>
            <TextInput name="username" placeholder="Username" required />
            <PasswordInput name="password" placeholder="Password" required />

            <Button
              variant="filled"
              color="#ffc000"
              type="submit"
              loading={isLoading}
            >
              Log in with Untappd
            </Button>
          </Stack>
        </Form>
      </Card>
    </Container>
  );
}
