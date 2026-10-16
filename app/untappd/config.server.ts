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

// Version the official app reports as `utv` (see docs/untappd-api.md)
const APP_VERSION = "4.0.0";

export { API_HOST, APP_VERSION, CLIENT_ID, CLIENT_SECRET, DEVICE_UDID };
