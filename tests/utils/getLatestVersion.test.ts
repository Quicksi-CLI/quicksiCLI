import { describe, it, expect, vi } from "vitest";
import { getLatestVersion } from "../../src/utils/getLatestVersion";

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve("v1.2.3"),
  })
) as any;

describe("getLatestVersion", () => {
  it("returns version from remote", async () => {
    const version = await getLatestVersion();
    expect(version).toBe("v1.2.3");
  });

  it("falls back to main on error", async () => {
    global.fetch = vi.fn(() => Promise.reject("fail")) as any;

    const version = await getLatestVersion();
    expect(version).toBe("main");
  });
});
