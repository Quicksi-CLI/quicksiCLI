#!/usr/bin/env node

import figlet from "figlet";
import * as inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import * as shell from "shelljs";
import chalk from "chalk";
import yargs from "yargs";

import {
  ensureTemplates,
  clearTemplateCache,
} from "./utils/templateFetcher";

import {
  resolveTemplateById,
} from "./utils/templateIndex";

import { getAuthorById } from "./utils/getAuthorById";

import { trackEvent, shutdownAnalytics, sendDownloadEvent } from "./utils/analytics";
import { getLatestVersion } from "./utils/getLatestVersion";

/**
 * CLI Arguments
 */
const argv = yargs(process.argv.slice(2))
  .command("$0 [template] [name]")
  .option("clear-cache", {
    type: "boolean",
    description: "Clear template cache",
  })
  .help().argv as any;

/**
 * Types
 */
interface Answers {
  programmingLanguage: string;
  framework?: string;
  starter?: string;
  tutorial?: string;
  name: string;
}

/**
 * Parse template@version
 */
function parseTemplateArg(input: string): {
  template: string;
  version?: string;
} {
  const [template, version] = input.split("@");
  return { template, version };
}

/**
 * Entry Point
 */
async function main(): Promise<void> {
  trackEvent("cli_started");

  handleCliFlags();

  const templateArg = argv.template as string | undefined;
  const nameArg = argv.name as string | undefined;

  let templatePath: string;
  let projectName: string;
  let templatesBasePath: string;
  let globalVersion: string = "main";

  if (templateArg) {
    const parsed = parseTemplateArg(templateArg);

    // 🔥 VERSION RESOLUTION (NEW)
    let versionToUse = parsed.version;

    if (!versionToUse) {
      versionToUse = await getLatestVersion();
    };

    globalVersion = versionToUse

    console.log(chalk.gray(`📌 Using version: ${versionToUse}`));

    templatesBasePath = await ensureTemplates(versionToUse);

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

    // 🔥 also apply VERSION logic here
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

  // const meta = loadTemplateMeta(templatePath);
  const meta = loadTemplateMeta(templatePath);

  // 🔥 ENRICH AUTHOR FROM author_id
  if (meta?.author_id) {
    try {
      const author = await getAuthorById(meta.author_id);

      if (author) {
        meta.author = author;
      }
    } catch {
      // fallback silently
    }
  }

  const targetPath = createProjectDirectory(projectName);
  const config = loadTemplateConfig(templatePath);

  copyTemplateFiles(templatePath, targetPath);
  installDependencies(targetPath, templatePath);

  displaySuccessMessage(projectName, config, meta);

  // TRACK DOWNLOAD
  await sendDownloadEvent(meta, globalVersion);

  trackEvent("template_used", {
    template_id: meta?.id,
    template_name: meta?.name,
  });

  await shutdownAnalytics();

  process.exit(0);
}

/**
 * Handle CLI flags
 */
function handleCliFlags(): void {
  if (argv["clear-cache"]) {
    clearTemplateCache();
    process.exit(0);
  }
}

/**
 * Interactive prompt
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
 * Resolve template from full path
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
 * Resolve template (interactive)
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
 * Load template meta
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
 * Create project directory
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
 * Load template config
 */
function loadTemplateConfig(templatePath: string): any {
  const configPath = path.join(templatePath, ".template.json");

  if (!fs.existsSync(configPath)) return {};

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

/**
 * Copy files
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
 * Install dependencies
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
 * Success output
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
 * Utilities
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
 * Run CLI
 */
main().catch(async (err) => {
  trackEvent("cli_error", { message: err.message });

  await shutdownAnalytics();

  console.error(chalk.red("\n❌ Error:"), err.message);

  process.exit(1);
});
