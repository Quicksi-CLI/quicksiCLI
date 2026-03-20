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
const CACHE_DIR = path.join(os.homedir(), ".quicksi");

/**
 * Build template download URL
 */
function buildTemplateUrl(version?: string): string {
    return version
        ? `${TEMPLATE_REPO}/archive/refs/tags/${version}.zip`
        : `${TEMPLATE_REPO}/archive/refs/heads/${DEFAULT_BRANCH}.zip`;
};

/**
 * Download file as buffer (handles redirects)
 */

async function download(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                // Handle HTTP redirects
                if (
                    res.statusCode &&
                    res.statusCode >= 300 &&
                    res.statusCode < 400 &&
                    res.headers.location
                ) {
                    return resolve(download(res.headers.location));
                }

                // Validate response
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
};


export async function ensureTemplates(): Promise<string> {
    if (fs.existsSync(CACHE_DIR)) {
        return getTemplatesPath(CACHE_DIR);
    }

    console.log("📦 Downloading templates...");

    try {
        const buffer = await download(TEMPLATE_REPO_ZIP);

        console.log("Downloaded size:", buffer.length);

        const zip = new AdmZip(buffer);
        zip.extractAllTo(CACHE_DIR, true);

        console.log("✅ Templates ready");

        return getTemplatesPath(CACHE_DIR);
    } catch (err) {
        console.error("❌ Failed to download templates");
        throw err;
    }

}

function getTemplatesPath(cacheDir: string): string {
    const extractedFolder = fs.readdirSync(cacheDir)[0];
    return path.join(cacheDir, extractedFolder, "templates");
}

export function clearTemplateCache() {
    if (fs.existsSync(CACHE_DIR)) {
        fs.rmSync(CACHE_DIR, { recursive: true, force: true });
        console.log("🧹 Cache cleared");
    }
};
