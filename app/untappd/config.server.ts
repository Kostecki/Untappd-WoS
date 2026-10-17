import { createHmac } from "node:crypto";
import invariant from "tiny-invariant";

const API_BASE_URL = process.env.UNTAPPD_API_URL;
const DEVICE_UDID = process.env.UNTAPPD_DEVICE_UDID;
const CLIENT_ID = process.env.UNTAPPD_CLIENT_ID;
const CLIENT_SECRET = process.env.UNTAPPD_CLIENT_SECRET;
invariant(API_BASE_URL, "UNTAPPD_API_URL must be set in .env");
invariant(DEVICE_UDID, "UNTAPPD_DEVICE_UDID must be set in .env");
invariant(CLIENT_ID, "UNTAPPD_CLIENT_ID must be set in .env");
invariant(CLIENT_SECRET, "UNTAPPD_CLIENT_SECRET must be set in .env");

// UNTAPPD_API_URL points at the v4 API (https://api.untappd.com/v4); v5 lives next to it
const API_HOST = API_BASE_URL.replace(/\/v\d+\/?$/, "");

// What the official Android app 5.0.0 sends (see docs/untappd-api.md)
/** Native app version: X-Untappd-App-Version header and app_version at login */
const APP_VERSION = "5.0.0";
/** `utv` query param: baked into the JS bundle, which is 4.0.0 in app 5.0.0 */
const UTV = "4.0.0";
/** The app's HTTP stack is OkHttp 4.12.0 */
const USER_AGENT = "okhttp/4.12.0";
/** Sent as Accept-Language; English keeps style names matching the app's data */
const LANGUAGE = "en";

/** Device fields the app sends to /xauth (from react-native-device-info) */
const DEVICE = {
	name: "Pixel 8",
	systemName: "Android",
	systemVersion: "15",
};

/**
 * A stable per-user device id in the format of Android's ANDROID_ID
 * (16 hex characters), so every user doesn't appear to share one phone
 */
const getDeviceUdid = (userName: string) =>
	createHmac("sha256", DEVICE_UDID)
		.update(userName.trim().toLowerCase())
		.digest("hex")
		.slice(0, 16);

export {
	API_HOST,
	APP_VERSION,
	CLIENT_ID,
	CLIENT_SECRET,
	DEVICE,
	getDeviceUdid,
	LANGUAGE,
	USER_AGENT,
	UTV,
};
