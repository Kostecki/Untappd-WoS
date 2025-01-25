import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import {
  Box,
  Code,
  ColorSchemeScript,
  Container,
  createTheme,
  MantineProvider,
  Text,
  Title,
} from "@mantine/core";

import stylesheet from "./app.css?url";
import "@mantine/core/styles.css";

import type { Route } from "./+types/root";

const theme = createTheme({
  colors: {
    untappd: [
      "#fffbe1",
      "#fff5cb",
      "#ffea9a",
      "#ffde64",
      "#ffd438",
      "#ffcd1c",
      "#ffca09",
      "#e3b200",
      "#ca9e00",
      "#af8800",
    ],
  },
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mantine-color-scheme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Box className="pt-32 p-4">
      <Container size="md">
        <Title order={1}>{message}</Title>
        <Text>{details}</Text>
        {stack && (
          <pre style={{ padding: "16px", overflowX: "auto" }}>
            <Code block>{stack}</Code>
          </pre>
        )}
      </Container>
    </Box>
  );
}
