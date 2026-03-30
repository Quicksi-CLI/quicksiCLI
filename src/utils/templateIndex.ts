import * as fs from "fs";
import * as path from "path";

/**
 * 🧩 Template Metadata Definition
 *
 * Represents the structure of a template as defined in `.meta.json`.
 *
 * 📦 Fields:
 * - id: Unique identifier for the template (required)
 * - name: Human-readable template name
 * - description: Optional description of the template
 * - author: Optional author metadata
 * - path: Relative path to the template (resolved at runtime)
 *
 * 🔐 Notes:
 * - `id` must be unique across all templates
 * - Duplicate IDs will be ignored with a warning
 */
export interface TemplateMeta {
    id: string;
    name: string;
    description?: string;
    author?: {
        name: string;
        github?: string;
        avatar?: string;
    };
    path: string;
}

/**
 * 📚 Build Template Index
 *
 * Scans the template directory structure and builds an index of all available templates.
 *
 * Expected Directory Structure:
 * basePath/
 *   └── language/
 *        └── framework/
 *             └── starter/
 *                  ├── .meta.json
 *                  └── template files...
 *
 * 📦 Behavior:
 * - Recursively traverses language → framework → starter folders
 * - Reads `.meta.json` files for template metadata
 * - Builds a lookup map using `id` as the key
 *
 * ⚠️ Error Handling:
 * - Missing `.meta.json` → skipped silently
 * - Invalid JSON → warning logged, template skipped
 * - Missing `id` → skipped
 * - Duplicate `id` → warning logged, first occurrence kept
 *
 * @param basePath - Root directory containing templates
 * @returns Record mapping template IDs to metadata
 */
export function buildTemplateIndex(basePath: string): Record<string, TemplateMeta> {
    const index: Record<string, TemplateMeta> = {};

    const languages = safeReadDir(basePath);

    languages.forEach((lang) => {
        const frameworks = safeReadDir(path.join(basePath, lang));

        frameworks.forEach((framework) => {
            const starters = safeReadDir(path.join(basePath, lang, framework));

            starters.forEach((starter) => {
                const templatePath = path.join(basePath, lang, framework, starter);
                const metaPath = path.join(templatePath, ".meta.json");

                /**
                 * Skip if metadata file does not exist
                 */
                if (!fs.existsSync(metaPath)) return;

                try {
                    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

                    /**
                     * Ensure template has a valid ID
                     */
                    if (!meta.id) {
                        return;
                    }

                    /**
                     * Prevent duplicate template IDs
                     */
                    if (index[meta.id]) {
                        console.warn(`⚠️ Duplicate template id: ${meta.id}`);
                        return;
                    }

                    /**
                     * Register template in index
                     */
                    index[meta.id] = {
                        ...meta,
                        path: `${lang}/${framework}/${starter}`,
                    };
                } catch (err) {
                    /**
                     * Invalid JSON or read error
                     */
                    console.warn(`⚠️ Failed to parse ${metaPath}`);
                }
            });
        });
    });

    return index;
}

/**
 * 🔍 Resolve Template by ID
 *
 * Finds a template using its unique ID and returns its absolute file path.
 *
 * 📦 Behavior:
 * - Builds the template index
 * - Looks up the requested ID
 * - Returns full path to template directory
 *
 * ⚠️ Errors:
 * - Throws if template is not found
 *
 * @param basePath - Root directory containing templates
 * @param id - Template ID
 * @returns Absolute path to template directory
 */
export function resolveTemplateById(
    basePath: string,
    id: string
): string {
    const index = buildTemplateIndex(basePath);

    if (!index[id]) {
        throw new Error(`Template not found: ${id}`);
    }

    return path.join(basePath, index[id].path);
}

/**
 * 📁 Safe Directory Reader
 *
 * Utility function to safely read directory contents.
 *
 * 📦 Behavior:
 * - Returns directory entries if path exists
 * - Returns empty array if path does not exist
 *
 * Purpose:
 * - Prevents runtime errors during traversal
 * - Simplifies nested directory iteration logic
 *
 * @param dir - Directory path
 * @returns Array of file/folder names
 */
function safeReadDir(dir: string): string[] {
    return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}
