import { describe, it, expect, vi } from "vitest";
import https from "https";
import { getAuthorById } from "../../src/utils/getAuthorById";

vi.mock("https");

describe("getAuthorById", () => {
  it("returns author data", async () => {
    const mockData = JSON.stringify({
      authors: {
        john: { name: "John" },
      },
    });

    (https.get as any).mockImplementation((url: any, cb: any) => {
      const res = {
        on: (event: string, handler: any) => {
          if (event === "data") handler(mockData);
          if (event === "end") handler();
        },
      };
      cb(res);
      return { on: () => {} };
    });

    const author = await getAuthorById("john");
    expect(author).toEqual({ name: "John" });
  });
});
