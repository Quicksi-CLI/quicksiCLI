import * as https from "https";
import * as os from "os";

export async function sendDownloadEvent(meta: any, globalVersion: string) {
    try {
        const data = JSON.stringify({
            template_id: meta?.id,
            version: globalVersion,
            author: meta?.author_id,
            programming_lang: meta?.programming_lang || "",
            resource_type: meta?.resource_type || "",
            platform: os.platform(),
            arch: os.arch(),
        });

        const req = https.request(
            "https://quicksi-server-7dcf88aff3f2.herokuapp.com/api/v1/downloads",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data),
                },
            },
            (res) => {
                res.on("data", () => { }); // consume
                res.on("end", () => { });
            }
        );

        req.on("error", () => { }); // prevent crash

        req.write(data);
        req.end();
    } catch {
        // silent fail
    }
};
