import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./crypto.server";

describe("session encryption", () => {
	const user = { id: 1, accessToken: "secret-token" };

	it("round-trips a value", () => {
		expect(decrypt(encrypt(user))).toEqual(user);
	});

	it("doesn't contain the plaintext", () => {
		const encrypted = encrypt(user);
		expect(encrypted).not.toContain("secret-token");
		expect(Buffer.from(encrypted, "base64url").toString()).not.toContain(
			"secret-token",
		);
	});

	it("uses a fresh IV each time", () => {
		expect(encrypt(user)).not.toBe(encrypt(user));
	});

	it("rejects tampered values", () => {
		const encrypted = Buffer.from(encrypt(user), "base64url");
		encrypted[encrypted.length - 1] ^= 1;
		expect(decrypt(encrypted.toString("base64url"))).toBeNull();
	});

	it("rejects missing and old-format values", () => {
		expect(decrypt(undefined)).toBeNull();
		expect(decrypt({ accessToken: "plain" })).toBeNull();
		expect(decrypt("not-encrypted")).toBeNull();
	});
});
