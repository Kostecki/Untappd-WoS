import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		include: ["app/**/*.test.{ts,tsx}"],
		environment: "node",
		// Dummy values: modules read these at import time; tests never call Untappd
		env: {
			SESSION_SECRET: "test-session-secret",
			ADMIN_USER_ID: "1",
			UNTAPPD_API_URL: "https://api.untappd.test/v4",
			UNTAPPD_DEVICE_UDID: "test-device",
			UNTAPPD_CLIENT_ID: "test-client-id",
			UNTAPPD_CLIENT_SECRET: "test-client-secret",
		},
		restoreMocks: true,
		unstubGlobals: true,
	},
});
