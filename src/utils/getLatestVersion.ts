import fetch from "node-fetch";

/**
 * 🔄 Fetch Latest Template Version
 *
 * Retrieves the latest version identifier for Quicksi templates from
 * the central registry hosted on GitHub.
 *
 * Source:
 * https://raw.githubusercontent.com/Quicksi-CLI/quicksi-templates/main/VERSION
 *
 * 📦 Purpose:
 * - Determine which version of templates should be used
 * - Enable dynamic updates without requiring CLI redeployment
 * - Support version-based template resolution
 *
 * 📄 Expected Format:
 * - Plain text file containing a version string (e.g. "v1.2.0" or "main")
 * - No JSON or complex structure
 *
 * 🔐 Notes:
 * - Public, read-only resource (no authentication required)
 * - No user data is sent in this request
 *
 * ⚠️ Reliability & Fallback:
 * - If the request fails, returns "main" as a safe default
 * - Prevents CLI crashes due to network issues
 * - Logs a warning for visibility (non-blocking)
 *
 * @returns Promise resolving to version string (or "main" fallback)
 */
export async function getLatestVersion(): Promise<string> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Quicksi-CLI/quicksi-templates/main/VERSION"
    );

    /**
     * ❌ Validate HTTP response
     * Ensures the request succeeded before reading body
     */
    if (!res.ok) {
      throw new Error("Failed to fetch VERSION");
    }

    /**
     * 📥 Read and normalize version string
     * Trims whitespace/newlines from raw text response
     */
    const version = (await res.text()).trim();

    /**
     * ❌ Guard against empty or invalid file
     */
    if (!version) {
      throw new Error("Empty VERSION file");
    }

    return version;
  } catch (err) {
    /**
     * ⚠️ Graceful fallback
     *
     * If anything goes wrong (network issue, invalid response, etc.),
     * default to "main" to ensure the CLI continues functioning.
     */
    console.error("❌ VERSION fetch error:", err);
    console.log("⚠️ Failed to fetch VERSION, falling back to main");
    return "main";
  }
};

