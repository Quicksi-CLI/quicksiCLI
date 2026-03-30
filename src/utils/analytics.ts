/**
 * 📊 Quicksi Analytics Module
 *
 * This module provides anonymous usage tracking for the Quicksi CLI.
 * The goal is to understand usage patterns, improve features, and identify errors
 * — without collecting personally identifiable information (PII).
 *
 * 🔐 Privacy Principles:
 * - No personal or sensitive user data is collected
 * - A random, anonymous ID is generated and stored locally
 * - No tracking across devices or external identity linkage
 *
 * ⚙️ Reliability:
 * - All analytics calls are non-blocking
 * - Failures are silently ignored to prevent CLI crashes
 * - Events are flushed before process exit to reduce data loss
 *
 * 📄 Learn more:
 * https://quicksi.io/privacy-policy
 */

import { PostHog } from "posthog-node";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

// Polyfills for pkg environment
import fetch from "node-fetch";
import { Blob } from "buffer";


// @ts-ignore
global.fetch = fetch;

// @ts-ignore
global.Blob = Blob;

const isPkg = typeof (process as any).pkg !== "undefined";


/**
 * 📊 PostHog Client Initialization
 *
 * This client is used to send anonymous analytics events.
 *
 * ℹ️ Notes:
 * - The API key used here is a public ingestion key (safe for CLI usage)
 * - No secrets or user credentials are exposed
 *
 * ⚡ CLI-Specific Optimizations:
 * - flushAt: 1 → send each event immediately (no batching)
 * - flushInterval: 0 → disable background flushing
 *
 * Why?
 * CLI processes are short-lived. Without immediate flushing,
 * events may never be sent before the process exits.
 *
 * Additionally, `shutdown()` is called before exit to ensure delivery.
 *
 * 📄 Privacy details:
 * https://quicksi.io/privacy-policy
 */

let posthog: PostHog | null = null;

if (!isPkg) {
    posthog = new PostHog(
        "phc_tK2blrhbcSCqArlitzGwIYBGsI31oOMQSXXlpVgwjH9",
        {
            host: "https://eu.i.posthog.com",
            flushAt: 1,
            flushInterval: 0,
        }
    );
}

/**
 * 📁 Anonymous User ID Storage
 *
 * A random identifier is generated and stored locally in the user's home directory.
 *
 * Purpose:
 * - Distinguish unique CLI users anonymously
 * - Avoid duplicate event counting
 *
 * Characteristics:
 * - Not linked to personal identity
 * - Not shared outside analytics context
 * - Can be deleted by the user at any time
 */
const ID_PATH = path.join(os.homedir(), ".quicksi-id");



/**
 * Retrieve or generate a persistent anonymous user ID.
 *
 * @returns {string} anonymous user identifier
 */
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
 * 📡 Track an analytics event (safe + non-blocking)
 *
 * @param event - Name of the event (e.g. "project_created")
 * @param properties - Additional metadata for the event
 *
 * Automatically includes:
 * - OS platform
 * - CPU architecture
 *
 * ⚠️ Important:
 * - Errors are swallowed intentionally
 * - Analytics must NEVER impact CLI functionality
 */
export function trackEvent(
    event: string,
    properties: Record<string, any> = {}
) {
    try {
        posthog?.capture({
            distinctId: getUserId(),
            event,
            properties: {
                ...properties,
                platform: os.platform(),
                arch: os.arch(),
            },
        });
    } catch {
        // Intentionally ignored — analytics must not crash the CLI

    }
}

/**
 * 🚪 Graceful Analytics Shutdown
 *
 * Ensures all queued events are flushed before the CLI process exits.
 *
 * Should be called before:
 * - process.exit()
 * - script completion in critical flows
 */
export async function shutdownAnalytics() {
    try {
        if (!isPkg && posthog) {
            await posthog.shutdown();
        }
    } catch {
        // Silent failure — do not interrupt CLI lifecycle
    }
}

/**
 * 📦 Template Download Tracking
 *
 * Sends a lightweight event when a user downloads a template/resource.
 *
 * Purpose:
 * - Measure template usage
 * - Understand developer preferences
 * - Improve ecosystem recommendations
 *
 * Data sent:
 * - template_id
 * - version (CLI version)
 * - author
 * - programming language
 * - resource type
 *
 * 🔐 Privacy:
 * - No personal user data is included
 * - No tracking beyond usage metrics
 *
 * 📄 Learn more:
 * https://quicksi.io/privacy-policy
 */
export async function sendDownloadEvent(meta: any, globalVersion: string) {
    try {
        await fetch("https://quicksi-server-7dcf88aff3f2.herokuapp.com/api/v1/downloads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                template_id: meta?.id,
                version: globalVersion,
                author: meta?.author_id,
                programming_lang: meta?.programming_lang || "",
                resource_type: meta?.resource_type || "",
            }),
        });
    } catch {
        // silent fail (no console noise in CLI)
    }
}

