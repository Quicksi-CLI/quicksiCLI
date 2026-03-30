import * as ejs from 'ejs';

/**
 * 🧩 Template Data Interface
 *
 * Defines the structure of data passed into template rendering.
 *
 * 📦 Current Fields:
 * - projectName: Name of the project being generated
 *
 * 🔄 Extensibility:
 * - This interface can be extended in the future to support more variables
 *   (e.g. authorName, description, framework, etc.)
 */
export interface TemplateData {
    projectName: string;
}

/**
 * 🖨️ Render Template Content
 *
 * Uses EJS (Embedded JavaScript Templates) to interpolate dynamic values
 * into template files during project generation.
 *
 * 📦 Purpose:
 * - Replace placeholders in template files with actual values
 * - Enable dynamic scaffolding of projects
 *
 * Example:
 * Template:
 *   "Project: <%= projectName %>"
 *
 * Output:
 *   "Project: my-app"
 *
 * ⚙️ Implementation:
 * - Delegates rendering to the `ejs` engine
 * - Supports full EJS syntax (loops, conditionals, etc.)
 *
 * 🔐 Notes:
 * - Assumes template content is trusted (no sandboxing)
 * - Avoid rendering untrusted user input directly
 *
 * @param content - Raw template string containing EJS syntax
 * @param data - Object containing values to inject into the template
 * @returns Rendered string with all placeholders resolved
 */
export function render(content: string, data: TemplateData) {
    return ejs.render(content, data);
}
