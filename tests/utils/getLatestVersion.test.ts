import { describe, it, expect, vi, afterEach } from "vitest";

// 🔥 Mock BEFORE importing module
vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

import fetch from "node-fetch";
import {
  getLatestVersion,
  __resetVersionCache,
} from "../../src/utils/getLatestVersion";

describe("getLatestVersion", () => {
  afterEach(() => {
    vi.clearAllMocks();
    __resetVersionCache();
  });

  it("returns version from remote", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      text: async () => "v1.2.3",
    });

    const version = await getLatestVersion();

    expect(version).toBe("v1.2.3");
  });

  it("falls back to main on network error", async () => {
    (fetch as any).mockRejectedValue(new Error("fail"));

    const version = await getLatestVersion();

    expect(version).toBe("main");
  });

  it("falls back to main on non-OK response", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    const version = await getLatestVersion();

    expect(version).toBe("main");
  });

  it("falls back to main on empty response", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      text: async () => "",
    });

    const version = await getLatestVersion();

    expect(version).toBe("main");
  });

  it("uses cached version (only fetches once)", async () => {
    const mock = (fetch as any).mockResolvedValue({
      ok: true,
      text: async () => "v1.2.3",
    });

    const v1 = await getLatestVersion();
    const v2 = await getLatestVersion();

    expect(v1).toBe("v1.2.3");
    expect(v2).toBe("v1.2.3");
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
