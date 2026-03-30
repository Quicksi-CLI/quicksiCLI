import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import os from "os";

import {
    normalizeVersion,
    buildTemplateUrl,
    getCacheDir,
    validateDownloadedFile,
    resolveTemplatesPath
} from "../../src/utils/templateFetcher";

describe("templateFetcher utils", () => {
    it("normalizes version correctly", () => {
        expect(normalizeVersion("1.0.0")).toBe("v1.0.0");
        expect(normalizeVersion("v1.0.0")).toBe("v1.0.0");
    });

    it("builds correct template URL", () => {
        const url = buildTemplateUrl("v1.0.0");
        expect(url).toContain("/refs/tags/v1.0.0.zip");

        const mainUrl = buildTemplateUrl("main");
        expect(mainUrl).toContain("/refs/heads/main.zip");
    });

    it("returns correct cache directory", () => {
        const dir = getCacheDir("v1.0.0");
        expect(dir).toContain(path.join(".quicksi", "v1.0.0"));
    });

    it("throws on empty buffer", () => {
        expect(() => validateDownloadedFile(Buffer.alloc(0)))
            .toThrow("Downloaded file is empty");
    });

    it("resolves templates path correctly", () => {
        const base = path.join(os.tmpdir(), "quicksi-test");

        const fakeRoot = path.join(base, "quicksi-templates-123");
        const templatesDir = path.join(fakeRoot, "templates");

        fs.mkdirSync(templatesDir, { recursive: true });

        const result = resolveTemplatesPath(base);

        expect(result).toBe(templatesDir);

        fs.rmSync(base, { recursive: true, force: true });
    });
});
