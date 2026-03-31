const fs = require("fs");

const REPO = "Quicksi-CLI/quicksiCLI";
const API = `https://api.github.com/repos/${REPO}/releases`;

async function fetchDownloads() {
    const res = await fetch(API);

    if (!res.ok) {
        throw new Error(`GitHub API failed: ${res.status}`);
    }

    const releases = await res.json();

    let stats = {
        linux: 0,
        macos: 0,
        windows: 0,
        total: 0,
    };

    for (const release of releases) {
        for (const asset of release.assets || []) {
            const name = asset.name.toLowerCase();
            const count = asset.download_count || 0;

            stats.total += count;

            if (name.includes("linux")) {
                stats.linux += count;
            } else if (name.includes("mac") || name.includes("darwin")) {
                stats.macos += count;
            } else if (name.includes("win") || name.endsWith(".exe")) {
                stats.windows += count;
            }
        }
    }

    return stats;
}

async function main() {
    const stats = await fetchDownloads();

    fs.mkdirSync("stats", { recursive: true });

    fs.writeFileSync(
        "stats/downloads.json",
        JSON.stringify({
            schemaVersion: 1,
            label: "downloads",
            message: stats.total.toString(),
            color: "blue",
            linux: stats.linux,
            macos: stats.macos,
            windows: stats.windows,
        }, null, 2)
    );

    fs.writeFileSync("stats/linux.json", JSON.stringify({
        schemaVersion: 1,
        label: "linux downloads",
        message: stats.linux.toString(),
        color: "blue",
    }));

    fs.writeFileSync("stats/macos.json", JSON.stringify({
        schemaVersion: 1,
        label: "macOS downloads",
        message: stats.macos.toString(),
        color: "blue",
    }));

    fs.writeFileSync("stats/windows.json", JSON.stringify({
        schemaVersion: 1,
        label: "windows downloads",
        message: stats.windows.toString(),
        color: "blue",
    }));

    console.log("✅ Stats generated:", stats);
}

main().catch(console.error);
