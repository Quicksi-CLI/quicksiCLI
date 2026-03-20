import * as fs from "fs";
import * as path from "path";

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
 * Build template index from .meta.json files
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

        if (!fs.existsSync(metaPath)) return;

        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

          if (!meta.id) {
            console.warn(`⚠️ Missing id in ${metaPath}`);
            return;
          }

          if (index[meta.id]) {
            console.warn(`⚠️ Duplicate template id: ${meta.id}`);
            return;
          }

          index[meta.id] = {
            ...meta,
            path: `${lang}/${framework}/${starter}`,
          };
        } catch (err) {
          console.warn(`⚠️ Failed to parse ${metaPath}`);
        }
      });
    });
  });

  return index;
}

/**
 * Resolve template by ID
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
 * Safe directory reader
 */
function safeReadDir(dir: string): string[] {
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}
