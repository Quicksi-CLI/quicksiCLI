import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import AdmZip from "adm-zip";

/**
 * Configuration
 */
const TEMPLATE_REPO = "https://github.com/Quicksi-CLI/quicksi-templates";
const DEFAULT_BRANCH = "main";
const CACHE_BASE_DIR = path.join(os.homedir(), ".quicksi");

/**
 * Build template download URL
 */
function buildTemplateUrl(version?: string): string {
    return version
        ? `${TEMPLATE_REPO}/archive/refs/tags/${version}.zip`
        : `${TEMPLATE_REPO}/archive/refs/heads/${DEFAULT_BRANCH}.zip`;
}

/**
 * Get version-specific cache directory
 */
function getCacheDir(version?: string): string {
    return version
        ? path.join(CACHE_BASE_DIR, version)
        : path.join(CACHE_BASE_DIR, "latest");
}

/**
 * Download file as buffer (handles redirects)
 */
async function download(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                if (
                    res.statusCode &&
                    res.statusCode >= 300 &&
                    res.statusCode < 400 &&
                    res.headers.location
                ) {
                    return resolve(download(res.headers.location));
                }

                if (res.statusCode !== 200) {
                    return reject(
                        new Error(`Download failed with status code ${res.statusCode}`)
                    );
                }

                const chunks: Uint8Array[] = [];

                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => resolve(Buffer.concat(chunks)));
                res.on("error", reject);
            })
            .on("error", reject);
    });
}

/**
 * Ensure templates exist locally (version-aware)
 */
export async function ensureTemplates(version?: string): Promise<string> {
    const cacheDir = getCacheDir(version);

    // ✅ Use cache if valid
    if (fs.existsSync(cacheDir)) {
        try {
            return resolveTemplatesPath(cacheDir);
        } catch {
            fs.rmSync(cacheDir, { recursive: true, force: true });
        }
    }

    console.log("📦 Downloading templates...");

    try {
        const url = buildTemplateUrl(version);
        const buffer = await download(url);

        validateDownloadedFile(buffer);

        prepareCacheDirectory(cacheDir);
        extractTemplates(buffer, cacheDir);

        console.log("✅ Templates ready");

        return resolveTemplatesPath(cacheDir);
    } catch (error) {
        console.error("❌ Failed to download templates");
        throw error;
    }
}

/**
 * Validate downloaded content
 */
function validateDownloadedFile(buffer: Buffer): void {
    if (buffer.length < 1000) {
        throw new Error(
            "Downloaded file is invalid (too small). Possible network or repo issue."
        );
    }
}

/**
 * Clean and prepare cache directory
 */
function prepareCacheDirectory(dir: string): void {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }

    fs.mkdirSync(dir, { recursive: true });
}

/**
 * Extract zip contents
 */
function extractTemplates(buffer: Buffer, dir: string): void {
    const zip = new AdmZip(buffer);
    zip.extractAllTo(dir, true);
}

/**
 * Resolve templates directory path
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
 * Clear all template cache
 */
export function clearTemplateCache(): void {
    if (!fs.existsSync(CACHE_BASE_DIR)) {
        console.log("ℹ️ No cache to clear");
        return;
    }

    fs.rmSync(CACHE_BASE_DIR, { recursive: true, force: true });
    console.log("🧹 Template cache cleared");
};
