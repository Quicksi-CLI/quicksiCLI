import { describe, it, expect, vi, beforeEach } from "vitest";

// ✅ mock https BEFORE import
vi.mock("https", () => {
  return {
    request: vi.fn((options, callback) => {
      const res = {
        on: (event: string, cb: any) => {
          if (event === "end") cb();
        },
      };

      callback(res);

      return {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      };
    }),
  };
});

import { sendDownloadEvent } from "../../src/utils/analytics";

describe("analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sendDownloadEvent does not throw on success", async () => {
    await expect(
      sendDownloadEvent({ id: "test" }, "v1")
    ).resolves.not.toThrow();
  });

  it("sendDownloadEvent handles request failure", async () => {
    // override mock to simulate error
    const https = await import("https");

    (https.request as any).mockImplementation(() => {
      return {
        on: (event: string, cb: any) => {
          if (event === "error") cb(new Error("fail"));
        },
        write: vi.fn(),
        end: vi.fn(),
      };
    });

    await expect(
      sendDownloadEvent({ id: "test" }, "v1")
    ).resolves.not.toThrow();
  });
});
