import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import AdmZip from "adm-zip";

/**
 * 🌐 Template Source Configuration
 *
 * Central repository containing all Quicksi templates.
 *
 * Structure:
 * - Templates are versioned using Git tags (e.g. v1.0.0)
 * - "main" branch is used as fallback / latest development version
 *
 * 📦 Example:
 * https://github.com/Quicksi-CLI/quicksi-templates
 */
const TEMPLATE_REPO = "https://github.com/Quicksi-CLI/quicksi-templates";

/**
 * 🌿 Default branch used when no version is specified
 */
const DEFAULT_BRANCH = "main";

/**
 * 📁 Local Cache Directory
 *
 * Templates are cached locally to:
 * - Avoid repeated downloads
 * - Improve CLI performance
 * - Support offline usage (after first download)
 *
 * Location:
 * ~/.quicksi/<version>
 */
const CACHE_BASE_DIR = path.join(os.homedir(), ".quicksi");

/**
 * 🏷️ Normalize Version String
 *
 * Ensures version format is consistent with Git tags.
 *
 * Example:
 * - "1.0.0" → "v1.0.0"
 * - "v1.0.0" → "v1.0.0"
 *
 * @param version - Raw version string
 * @returns Normalized version string
 */
function normalizeVersion(version: string): string {
    if (!version) return version;

    // 🚨 DO NOT prefix main
    if (version === "main") return version;

    return version.startsWith("v") ? version : `v${version}`;
}

/**
 * 🔗 Build Template Download URL
 *
 * Generates the correct GitHub archive URL based on version.
 *
 * Behavior:
 * - If version is "main" or undefined → download branch archive
 * - Otherwise → download tagged release archive
 *
 * @param version - Template version
 * @returns URL to zip archive
 */
function buildTemplateUrl(version?: string): string {
    if (!version || version === "main") {
        return `${TEMPLATE_REPO}/archive/refs/heads/${DEFAULT_BRANCH}.zip`;
    }

    return `${TEMPLATE_REPO}/archive/refs/tags/${version}.zip`;
}

/**
 * 📂 Resolve Cache Directory for Version
 *
 * Each version is cached independently to avoid conflicts.
 *
 * Example:
 * ~/.quicksi/v1.0.0
 *
 * @param version - Normalized version
 */
function getCacheDir(version: string): string {
    return path.join(CACHE_BASE_DIR, version);
}

/**
 * ⬇️ Download File as Buffer
 *
 * Handles:
 * - HTTPS requests
 * - Redirects (3xx responses)
 * - Binary data accumulation
 *
 * ⚠️ Notes:
 * - Rejects on non-200 responses
 * - Designed for downloading zip archives
 *
 * @param url - File URL
 * @returns Buffer containing downloaded file
 */
async function download(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        https
            .get(
                url,
                {
                    headers: {
                        "User-Agent": "quicksi-cli",
                    },
                },
                (res) => {
                    /**
                     * 🔁 Handle redirects
                     */
                    if (
                        res.statusCode &&
                        res.statusCode >= 300 &&
                        res.statusCode < 400 &&
                        res.headers.location
                    ) {
                        return resolve(download(res.headers.location));
                    }

                    /**
                     * ❌ Reject non-success responses
                     */
                    if (res.statusCode !== 200) {
                        return reject(
                            new Error(`Download failed with status code ${res.statusCode}`)
                        );
                    }

                    const chunks: Uint8Array[] = [];

                    /**
                     * 📥 Collect data chunks
                     */
                    res.on("data", (chunk) => chunks.push(chunk));

                    /**
                     * ✅ Combine all chunks into buffer
                     */
                    res.on("end", () => resolve(Buffer.concat(chunks)));

                    res.on("error", reject);
                }
            )
            .on("error", reject);
    });
}

/**
 * 📦 Ensure Templates Are Available Locally
 *
 * Main entry point for template resolution.
 *
 * Behavior:
 * 1. Normalize version
 * 2. Check local cache
 * 3. If valid → return cached path
 * 4. If missing/invalid → download + extract
 *
 * @param version - Template version
 * @returns Path to templates directory
 */
export async function ensureTemplates(version: string): Promise<string> {
    const normalizedVersion = normalizeVersion(version);

    console.log("Version:", normalizedVersion);
    console.log("URL:", buildTemplateUrl(normalizedVersion));

    const cacheDir = getCacheDir(normalizedVersion);

    /**
     * ✅ Attempt to use cached templates
     */
    if (fs.existsSync(cacheDir)) {
        try {
            return resolveTemplatesPath(cacheDir);
        } catch {
            /**
             * ⚠️ Cache is invalid → clean and re-download
             */
            fs.rmSync(cacheDir, { recursive: true, force: true });
        }
    }

    console.log("📦 Downloading templates...");

    try {
        const url = buildTemplateUrl(normalizedVersion);
        const buffer = await download(url);

        validateDownloadedFile(buffer);

        prepareCacheDirectory(cacheDir);
        extractTemplates(buffer, cacheDir);

        console.log("✅ Templates ready");

        return resolveTemplatesPath(cacheDir);
    } catch (error: any) {
        console.error("❌ Failed to download templates");
        console.error("ERROR:", error.message);
        throw error;
    }
}

/**
 * ✅ Validate Downloaded File
 *
 * Ensures downloaded buffer is not empty or corrupted.
 *
 * @param buffer - Downloaded data
 */
function validateDownloadedFile(buffer: Buffer): void {
    if (!buffer || buffer.length === 0) {
        throw new Error("Downloaded file is empty");
    }
}

/**
 * 🧹 Prepare Cache Directory
 *
 * - Removes existing directory (if any)
 * - Recreates clean directory
 *
 * @param dir - Target cache directory
 */
function prepareCacheDirectory(dir: string): void {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }

    fs.mkdirSync(dir, { recursive: true });
}

/**
 * 📂 Extract Template Archive
 *
 * Uses AdmZip to extract all files into cache directory.
 *
 * @param buffer - Zip file buffer
 * @param dir - Destination directory
 */
function extractTemplates(buffer: Buffer, dir: string): void {
    const zip = new AdmZip(buffer);
    zip.extractAllTo(dir, true);
}

/**
 * 📁 Resolve Templates Directory Path
 *
 * GitHub archives extract into a root folder like:
 * quicksi-templates-<version>/
 *
 * This function:
 * - Finds the root folder
 * - Returns the "templates" subdirectory
 *
 * @param cacheDir - Version cache directory
 * @returns Absolute path to templates folder
 */
function resolveTemplatesPath(cacheDir: string): string {
    if (!fs.existsSync(cacheDir)) {
        throw new Error("Template cache directory not found");
    }

    const folders = fs.readdirSync(cacheDir);

    if (folders.length === 0) {
        throw new Error("No templates found in cache");
    }

    const rootFolder = folders.find((f) =>
        f.includes("quicksi-templates")
    );

    if (!rootFolder) {
        throw new Error("Invalid template structure");
    }

    return path.join(cacheDir, rootFolder, "templates");
}

/**
 * 🧹 Clear All Template Cache
 *
 * Removes all cached template versions from the user's system.
 *
 * Useful for:
 * - Debugging
 * - Forcing fresh downloads
 * - Clearing disk space
 */
export function clearTemplateCache(): void {
    if (!fs.existsSync(CACHE_BASE_DIR)) {
        console.log("ℹ️ No cache to clear");
        return;
    }

    fs.rmSync(CACHE_BASE_DIR, { recursive: true, force: true });
    console.log("🧹 Template cache cleared");
};


// exported for testing purposes
export {
    normalizeVersion,
    buildTemplateUrl,
    getCacheDir,
    validateDownloadedFile,
    resolveTemplatesPath
};
