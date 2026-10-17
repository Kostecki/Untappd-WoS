import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, vi } from "vitest";

/**
 * Points DATA_DIR at a fresh temp directory for each test and reloads
 * modules, since storage paths are read when a module is imported
 */
const useTempDataDir = () => {
	const dir = { path: "" };

	beforeEach(async () => {
		dir.path = await mkdtemp(path.join(tmpdir(), "wos-test-"));
		vi.stubEnv("DATA_DIR", dir.path);
		vi.resetModules();
	});

	afterEach(async () => {
		vi.unstubAllEnvs();
		await rm(dir.path, { recursive: true, force: true });
	});

	return dir;
};

export { useTempDataDir };
