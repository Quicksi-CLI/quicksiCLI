/**
 * 📊 Quicksi Analytics
 *
 * This module handles anonymous usage tracking to help improve the CLI.
 *
 * - No personal or sensitive data is collected
 * - Tracking is non-blocking and will never crash the CLI
 * - Events are flushed before process exit to avoid data loss
 */

import { PostHog } from "posthog-node";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";


// 📊 Initialize PostHog client for anonymous CLI analytics
// - The API key is a public ingestion key (safe to expose in client-side/CLI apps)
// - No personal or sensitive data is collected
// - Events help improve Quicksi by tracking usage patterns and errors
//
// ⚡ CLI Optimization:
// - flushAt: 1 → send every event immediately (no batching)
// - flushInterval: 0 → disable periodic flushing
//   This ensures events are delivered before the CLI process exits
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
    } catch { }
}
