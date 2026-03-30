import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

import {
  trackEvent,
  shutdownAnalytics,
  sendDownloadEvent,
} from "../../src/utils/analytics";

// 🔥 Mock PostHog
vi.mock("posthog-node", () => {
  class MockPostHog {
    capture = vi.fn();
    shutdown = vi.fn();
  }

  return {
    PostHog: MockPostHog,
  };
});

// 🔥 Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true })
) as any;

describe("analytics", () => {
  const idPath = path.join(os.homedir(), ".quicksi-id");

  beforeEach(() => {
    if (fs.existsSync(idPath)) {
      fs.rmSync(idPath);
    }
  });

  it("trackEvent does not throw", () => {
    expect(() => trackEvent("test_event")).not.toThrow();
  });

  it("shutdownAnalytics resolves safely", async () => {
    await expect(shutdownAnalytics()).resolves.not.toThrow();
  });

  it("sendDownloadEvent does not throw on success", async () => {
    await expect(
      sendDownloadEvent({ id: "test" }, "v1")
    ).resolves.not.toThrow();
  });

  it("sendDownloadEvent handles fetch failure", async () => {
    global.fetch = vi.fn(() => Promise.reject("fail")) as any;

    await expect(
      sendDownloadEvent({ id: "test" }, "v1")
    ).resolves.not.toThrow();
  });
});
