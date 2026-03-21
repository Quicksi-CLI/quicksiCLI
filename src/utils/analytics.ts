import { PostHog } from "posthog-node";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

// 🔥 Create PostHog client
const posthog = new PostHog(
  "phc_tK2blrhbcSCqArlitzGwIYBGsI31oOMQSXXlpVgwjH9",
  {
    host: "https://eu.i.posthog.com",

    // 🔥 VERY IMPORTANT for CLI
    flushAt: 1,
    flushInterval: 0,
  }
);

// 🔥 Persist anonymous user ID
const ID_PATH = path.join(os.homedir(), ".quicksi-id");

function getUserId(): string {
  try {
    if (fs.existsSync(ID_PATH)) {
      return fs.readFileSync(ID_PATH, "utf-8");
    }

    const id = Math.random().toString(36).substring(2);
    fs.writeFileSync(ID_PATH, id);
    return id;
  } catch {
    return "anonymous";
  }
}

/**
 * Track event safely (non-blocking)
 */
export function trackEvent(
  event: string,
  properties: Record<string, any> = {}
) {
  try {
    posthog.capture({
      distinctId: getUserId(),
      event,
      properties: {
        ...properties,
        platform: os.platform(),
        arch: os.arch(),
        node_version: process.version,
      },
    });
  } catch {
    // ❌ Never crash CLI
  }
}

/**
 * Flush before exit (important)
 */
export async function shutdownAnalytics() {
  try {
    await posthog.shutdown();
  } catch {}
}
