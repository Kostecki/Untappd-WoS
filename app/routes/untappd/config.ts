import invariant from "tiny-invariant";

const API_BASE_URL = process.env.UNTAPPD_API_URL;
const DEVICE_UDID = process.env.UNTAPPD_DEVICE_UDID;
const CLIENT_ID = process.env.UNTAPPD_CLIENT_ID;
const CLIENT_SECRET = process.env.UNTAPPD_CLIENT_SECRET;
invariant(API_BASE_URL, "API_BASE_URL must be set in .env");
invariant(DEVICE_UDID, "DEVICE_UDID must be set in .env");
invariant(CLIENT_ID, "CLIENT_ID must be set in .env");
invariant(CLIENT_SECRET, "CLIENT_SECRET must be set in .env");

export { API_BASE_URL, DEVICE_UDID, CLIENT_ID, CLIENT_SECRET };
