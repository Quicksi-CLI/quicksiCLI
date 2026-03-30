import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

import {
  buildTemplateIndex,
  resolveTemplateById,
} from "../../src/utils/templateIndex";

describe("templateIndex", () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = path.join(os.tmpdir(), "quicksi-template-test");

    fs.mkdirSync(baseDir, { recursive: true });

    /**
     * Create structure:
     * baseDir/js/react/basic/.meta.json
     */
    const templateDir = path.join(baseDir, "js", "react", "basic");
    fs.mkdirSync(templateDir, { recursive: true });

    fs.writeFileSync(
      path.join(templateDir, ".meta.json"),
      JSON.stringify({
        id: "react-basic",
        name: "React Basic",
      })
    );
  });

  afterEach(() => {
    fs.rmSync(baseDir, { recursive: true, force: true });
  });

  it("builds template index correctly", () => {
    const index = buildTemplateIndex(baseDir);

    expect(index["react-basic"]).toBeDefined();
    expect(index["react-basic"].path).toBe("js/react/basic");
  });

  it("resolves template by ID", () => {
    const result = resolveTemplateById(baseDir, "react-basic");

    expect(result).toContain("js/react/basic");
  });

  it("throws if template not found", () => {
    expect(() =>
      resolveTemplateById(baseDir, "unknown")
    ).toThrow("Template not found");
  });

  it("skips templates without meta.json", () => {
    const emptyDir = path.join(baseDir, "js", "vue", "empty");
    fs.mkdirSync(emptyDir, { recursive: true });

    const index = buildTemplateIndex(baseDir);

    expect(index["empty"]).toBeUndefined();
  });

  it("skips invalid JSON", () => {
    const badDir = path.join(baseDir, "js", "react", "broken");
    fs.mkdirSync(badDir, { recursive: true });

    fs.writeFileSync(
      path.join(badDir, ".meta.json"),
      "{ invalid json"
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const index = buildTemplateIndex(baseDir);

    expect(index["broken"]).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("skips templates without id", () => {
    const badDir = path.join(baseDir, "js", "react", "no-id");
    fs.mkdirSync(badDir, { recursive: true });

    fs.writeFileSync(
      path.join(badDir, ".meta.json"),
      JSON.stringify({ name: "No ID" })
    );

    const index = buildTemplateIndex(baseDir);

    expect(index["no-id"]).toBeUndefined();
  });

  it("warns on duplicate IDs", () => {
    const dupDir = path.join(baseDir, "js", "react", "duplicate");
    fs.mkdirSync(dupDir, { recursive: true });

    fs.writeFileSync(
      path.join(dupDir, ".meta.json"),
      JSON.stringify({
        id: "react-basic",
        name: "Duplicate",
      })
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const index = buildTemplateIndex(baseDir);

    expect(warnSpy).toHaveBeenCalled();
    expect(index["react-basic"].name).toBe("React Basic");

    warnSpy.mockRestore();
  });
});
