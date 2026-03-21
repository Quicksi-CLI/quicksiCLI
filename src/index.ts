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

import { trackEvent, shutdownAnalytics } from "./utils/analytics";
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
 * Entry Point
 */
async function main(): Promise<void> {
  // 🚀 Track CLI start event
  // Used to measure total CLI runs and usage frequency
  trackEvent("cli_started");

  handleCliFlags();

  const templatesBasePath = await ensureTemplates();

  const templateArg = argv.template as string | undefined;
  const nameArg = argv.name as string | undefined;

  let templatePath: string;
  let projectName: string;

  if (templateArg) {
    // 🔥 DIRECT MODE

    if (templateArg.includes("/")) {
      templatePath = resolveTemplateFromArg(
        templatesBasePath,
        templateArg
      );
    } else {
      templatePath = resolveTemplateById(
        templatesBasePath,
        templateArg
      );
    }

    projectName = nameArg || throwProjectNameError();
  } else {
    // 🧠 INTERACTIVE MODE
    const answers = await promptUser(templatesBasePath);

    templatePath = resolveTemplatePath(
      templatesBasePath,
      answers
    );

    projectName = answers.name;
  }

  // 🔥 LOAD META (NEW)
  const meta = loadTemplateMeta(templatePath);

  const targetPath = createProjectDirectory(projectName);
  const config = loadTemplateConfig(templatePath);

  copyTemplateFiles(templatePath, targetPath);
  installDependencies(targetPath, templatePath);

  displaySuccessMessage(projectName, config, meta);

  // 📊 Track an analytics event (non-blocking)
  // This sends anonymous usage data to help improve Quicksi
  // - No personal or sensitive data is collected
  // - Failures here should never affect CLI execution
  trackEvent("template_used", {
    template_id: meta?.id,
    template_name: meta?.name,
  });

  await shutdownAnalytics();

  process.exit(0);
};


main().catch(async (err) => {
  // 🔍 Track unexpected CLI failure for debugging and product improvement
  // This helps us understand common errors without collecting personal data
  trackEvent("cli_error", { message: err.message });

  // 🚀 Ensure all pending analytics events are sent before the process exits
  // CLI processes are short-lived, so without this, events may be lost
  await shutdownAnalytics();

  // ❌ Exit with failure code to indicate the command did not complete successfully
  process.exit(1);
});

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
    return path.join(
      basePath,
      "tutorials",
      answers.tutorial!
    );
  }

  return path.join(
    basePath,
    answers.programmingLanguage,
    answers.framework!,
    answers.starter!
  );
}

/**
 * 🔥 Load template meta
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
 * 🔥 Success output (WITH AUTHOR)
 */
function displaySuccessMessage(
  projectName: string,
  config: any,
  meta?: any
): void {
  console.log("");

  figlet("QUICKSI CLI", (_, data) => {
    if (data) console.log(chalk.yellow(data));
  });

  console.log(chalk.green(`\n✅ Project created: ${projectName}`));
  console.log(chalk.cyan(`cd ${projectName}`));

  // 🔥 Template info
  if (meta?.name) {
    console.log(chalk.blue(`📦 Template: ${meta.name}`));
  }

  // 🔥 Author info
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
  throw new Error("Project name is required");
}

/**
 * Run CLI
 */
main().catch((err) => {
  console.error(chalk.red("\n❌ Error:"), err.message);
  process.exit(1);
});
