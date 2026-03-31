#!/usr/bin/env node

/**
 * 🚀 Quicksi CLI Entry Point
 *
 * This is the main executable for the Quicksi CLI.
 * It handles:
 * - CLI argument parsing
 * - Template resolution (local + remote)
 * - Interactive prompts
 * - Project scaffolding
 * - Dependency installation
 * - Analytics tracking
 *
 * 📦 Responsibilities:
 * 1. Parse user input (CLI args or interactive mode)
 * 2. Resolve correct template (by ID or path)
 * 3. Download/cache templates (version-aware)
 * 4. Generate project structure
 * 5. Install dependencies
 * 6. Provide user feedback
 *
 * 🔐 Design Principles:
 * - Fail gracefully (never crash unexpectedly)
 * - Keep UX simple and intuitive
 * - Support both beginner (interactive) and advanced (CLI args) usage
 */

import figlet from "figlet";
import * as inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import * as shell from "shelljs";
import chalk from "chalk";
import yargs from "yargs";

import {
  clearTemplateCache,
  ensureTemplates,
} from "./utils/templateFetcher";

import {
  resolveTemplateById,
} from "./utils/templateIndex";

import { getAuthorById } from "./utils/getAuthorById";

import { sendDownloadEvent } from "./utils/analytics";
import { getLatestVersion } from "./utils/getLatestVersion";

/**
 * 🧾 CLI Argument Configuration
 *
 * Supported usage:
 * - quicksi <template> <name>
 * - quicksi (interactive mode)
 *
 * Options:
 * --clear-cache → clears locally cached templates
 */
const argv = yargs(process.argv.slice(2))
  .command("$0 [template] [name]")
  .option("clear-cache", {
    type: "boolean",
    description: "Clear template cache",
  })
  .help().argv as any;

/**
 * 🧩 Interactive Prompt Answers
 */
interface Answers {
  programmingLanguage: string;
  framework?: string;
  starter?: string;
  tutorial?: string;
  name: string;
}

/**
 * 🔍 Parse Template Argument
 *
 * Supports versioned templates:
 * Example:
 * - react@1.0.0
 * - react@v1.0.0
 *
 * @param input - Raw CLI template argument
 */
function parseTemplateArg(input: string): {
  template: string;
  version?: string;
} {
  const [template, version] = input.split("@");
  return { template, version };
}

/**
 * 🧠 Main CLI Execution Flow
 */
async function main(): Promise<void> {

  handleCliFlags();

  const templateArg = argv.template as string | undefined;
  const nameArg = argv.name as string | undefined;

  let templatePath: string;
  let projectName: string;
  let templatesBasePath: string;
  let globalVersion: string = "main";

  /**
   * ⚡ Non-interactive mode (CLI arguments provided)
   */
  if (templateArg) {
    const parsed = parseTemplateArg(templateArg);

    /**
     * 🔄 Version resolution
     * - Use provided version OR
     * - Fetch latest version dynamically
     */
    let versionToUse = parsed.version;

    if (!versionToUse) {
      versionToUse = await getLatestVersion();
    }

    globalVersion = versionToUse;

    console.log(chalk.gray(`📌 Using version: ${versionToUse}`));

    templatesBasePath = await ensureTemplates(versionToUse);

    /**
     * Resolve template:
     * - Full path (language/framework/starter)
     * - OR template ID
     */
    if (parsed.template.includes("/")) {
      templatePath = resolveTemplateFromArg(
        templatesBasePath,
        parsed.template
      );
    } else {
      templatePath = resolveTemplateById(
        templatesBasePath,
        parsed.template
      );
    }

    projectName = nameArg || throwProjectNameError();
  } else {
    /**
     * 🎯 Interactive mode
     */
    const versionToUse = await getLatestVersion();

    console.log(chalk.gray(`📌 Using version: ${versionToUse}`));

    templatesBasePath = await ensureTemplates(versionToUse);

    const answers = await promptUser(templatesBasePath);

    templatePath = resolveTemplatePath(
      templatesBasePath,
      answers
    );

    projectName = answers.name;
  }

  /**
   * 📦 Load template metadata
   */
  const meta = loadTemplateMeta(templatePath);

  /**
   * 👤 Enrich author info dynamically (via author_id)
   */
  if (meta?.author_id) {
    try {
      const author = await getAuthorById(meta.author_id);

      if (author) {
        meta.author = author;
      }
    } catch {
      // Silent fallback (non-critical feature)
    }
  }

  /**
   * 🏗️ Project scaffolding
   */
  const targetPath = createProjectDirectory(projectName);
  const config = loadTemplateConfig(templatePath);

  copyTemplateFiles(templatePath, targetPath);
  installDependencies(targetPath, templatePath);

  /**
   * 🎉 Display success output
   */
  displaySuccessMessage(projectName, config, meta);

  /**
   * 📊 Analytics tracking
   */
  if (meta?.id) {
    await Promise.race([
      sendDownloadEvent(meta, globalVersion),
      new Promise((r) => setTimeout(r, 500)),
    ]);
  }
}

/**
 * ⚙️ Handle CLI Flags
 *
 * Currently supports:
 * --clear-cache → removes all cached templates
 */
function handleCliFlags(): void {
  if (argv["clear-cache"]) {
    clearTemplateCache();
    return;
  }
}

/**
 * 🧭 Interactive Prompt Flow
 *
 * Guides user through:
 * - Language selection
 * - Framework selection
 * - Starter/template selection
 * - Project naming
 */
async function promptUser(basePath: string): Promise<Answers> {
  const languages = readDir(basePath);

  const questions: any[] = [
    {
      name: "programmingLanguage",
      type: "list",
      message: "Select a programming language",
      choices: languages,
    },
    {
      name: "framework",
      type: "list",
      message: "Select a framework",
      choices: (answers: Answers) =>
        readDir(path.join(basePath, answers.programmingLanguage)),
      when: (answers: Answers) =>
        answers.programmingLanguage !== "tutorials",
    },
    {
      name: "starter",
      type: "list",
      message: "Select a starter template",
      choices: (answers: Answers) =>
        readDir(
          path.join(
            basePath,
            answers.programmingLanguage,
            answers.framework!
          )
        ),
      when: (answers: Answers) =>
        answers.programmingLanguage !== "tutorials",
    },
    {
      name: "tutorial",
      type: "list",
      message: "Select a tutorial starter",
      choices: readDir(path.join(basePath, "tutorials")),
      when: (answers: Answers) =>
        answers.programmingLanguage === "tutorials",
    },
    {
      name: "name",
      type: "input",
      message: "Project name:",
      validate: validateProjectName,
    },
  ];

  return (await inquirer.prompt(questions)) as Answers;
}

/**
 * 🔍 Resolve Template from Full Path Argument
 *
 * Format:
 * quicksi language/framework/starter app-name
 */
function resolveTemplateFromArg(
  basePath: string,
  input: string
): string {
  const parts = input.split("/");

  if (parts.length < 3) {
    throw new Error(
      `Invalid format.\nUse:\nquicksi language/framework/starter app-name`
    );
  }

  const [lang, framework, starter] = parts;

  const fullPath = path.join(basePath, lang, framework, starter);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Template not found: ${input}`);
  }

  return fullPath;
}

/**
 * 📁 Resolve Template Path (Interactive Mode)
 */
function resolveTemplatePath(
  basePath: string,
  answers: Answers
): string {
  if (answers.programmingLanguage === "tutorials") {
    return path.join(basePath, "tutorials", answers.tutorial!);
  }

  return path.join(
    basePath,
    answers.programmingLanguage,
    answers.framework!,
    answers.starter!
  );
}

/**
 * 📦 Load Template Metadata (.meta.json)
 */
function loadTemplateMeta(templatePath: string): any {
  const metaPath = path.join(templatePath, ".meta.json");

  if (!fs.existsSync(metaPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * 📁 Create Project Directory
 */
function createProjectDirectory(projectName: string): string {
  const target = path.join(process.cwd(), projectName);

  if (fs.existsSync(target)) {
    throw new Error(`Directory "${projectName}" already exists`);
  }

  fs.mkdirSync(target);
  return target;
}

/**
 * ⚙️ Load Template Configuration (.template.json)
 */
function loadTemplateConfig(templatePath: string): any {
  const configPath = path.join(templatePath, ".template.json");

  if (!fs.existsSync(configPath)) return {};

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

/**
 * 📄 Copy Template Files (Recursive)
 */
function copyTemplateFiles(source: string, target: string): void {
  const files = fs.readdirSync(source);

  files.forEach((file) => {
    if (file === ".template.json" || file === ".meta.json") return;

    const src = path.join(source, file);
    const dest = path.join(target, file);

    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dest);
      copyTemplateFiles(src, dest);
    } else {
      fs.writeFileSync(dest, fs.readFileSync(src, "utf-8"));
    }
  });
}

/**
 * 📦 Install Dependencies
 *
 * Runs `npm install` if package.json exists
 */
function installDependencies(
  target: string,
  templatePath: string
): void {
  if (!fs.existsSync(path.join(templatePath, "package.json")))
    return;

  console.log("\n📦 Installing dependencies...\n");

  shell.cd(target);
  shell.exec("npm install");
}

/**
 * 🎉 Display Success Output
 */
function displaySuccessMessage(
  projectName: string,
  config: any,
  meta?: any
): void {
  console.log("");

  const banner = figlet.textSync("QUICKSI CLI");
  console.log(chalk.yellow(banner));

  console.log(chalk.green(`\n✅ Project created: ${projectName}`));
  console.log(chalk.cyan(`cd ${projectName}`));

  if (meta?.name) {
    console.log(chalk.blue(`📦 Template: ${meta.name}`));
  }

  if (meta?.author?.name) {
    console.log("");
    console.log(
      chalk.magenta(`👤 Template contributed by ${meta.author.name}`)
    );

    if (meta.author.github_username) {
      console.log(
        chalk.gray(
          `🔗 https://github.com/${meta.author.github_username}`
        )
      );
    }
  }

  if (config?.postMessage) {
    console.log("");
    console.log(chalk.yellow(config.postMessage));
  }

  console.log("");
}

/**
 * 🛠️ Utilities
 */
function readDir(dir: string): string[] {
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function validateProjectName(input: string): true | string {
  return /^([A-Za-z\-_\\d]+)$/.test(input)
    ? true
    : "Invalid project name";
}

function throwProjectNameError(): never {
  throw new Error("Project name is required e.g quicksi <resource-name> <custome-project-name>");
}

/**
 * ▶️ Run CLI
 */
main().catch(async (err) => {
  console.error(chalk.red("\n❌ Error:"), err.message);

  process.exit(1);
});
