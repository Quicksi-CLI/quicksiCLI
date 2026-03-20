// src/types/adm-zip.d.ts
declare module "adm-zip";

import * as https from "https";
import AdmZip from "adm-zip";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const TEMPLATE_REPO_ZIP =
    "https://github.com/Quicksi-CLI/quicksi-templates/archive/refs/heads/main.zip";

//   version pinning
//   const TEMPLATE_URL = version
//   ? `.../refs/tags/${version}.zip`
//   : `.../refs/heads/main.zip`;

const CACHE_DIR = path.join(os.homedir(), ".quicksi");

function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // 🔥 HANDLE REDIRECT
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        return resolve(download(res.headers.location));
      }

      const data: Uint8Array[] = [];

      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => resolve(Buffer.concat(data)));
      res.on("error", reject);
    }).on("error", reject);
  });
}


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
