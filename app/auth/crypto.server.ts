import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import invariant from "tiny-invariant";

const SESSION_SECRET = process.env.SESSION_SECRET;
invariant(SESSION_SECRET, "SESSION_SECRET must be set in .env");

// Separate key from the cookie signing secret, derived so no new env var is needed
const key = Buffer.from(
	hkdfSync("sha256", SESSION_SECRET, "", "wos-session-encryption", 32),
);

const algorithm = "aes-256-gcm";
const ivLength = 12;
const tagLength = 16;

/** Encrypts a JSON value into a base64url string (iv + auth tag + ciphertext) */
const encrypt = (value: unknown): string => {
	const iv = randomBytes(ivLength);
	const cipher = createCipheriv(algorithm, key, iv);
	const ciphertext = Buffer.concat([
		cipher.update(JSON.stringify(value), "utf8"),
		cipher.final(),
	]);

	return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
		"base64url",
	);
};

/** Returns the decrypted value, or null if it is missing, tampered with or from an old format */
const decrypt = <T>(payload: unknown): T | null => {
	if (typeof payload !== "string") return null;

	try {
		const data = Buffer.from(payload, "base64url");
		const iv = data.subarray(0, ivLength);
		const tag = data.subarray(ivLength, ivLength + tagLength);
		const ciphertext = data.subarray(ivLength + tagLength);

		const decipher = createDecipheriv(algorithm, key, iv);
		decipher.setAuthTag(tag);
		const plaintext = Buffer.concat([
			decipher.update(ciphertext),
			decipher.final(),
		]).toString("utf8");

		return JSON.parse(plaintext) as T;
	} catch {
		return null;
	}
};

export { decrypt, encrypt };
