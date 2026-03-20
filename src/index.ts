#!/usr/bin/env node

import figlet from "figlet";
import * as inquirer from "inquirer";
import * as fs from "fs";
import * as path from "path";
import * as shell from "shelljs";
// import * as template from "./utils/template";
import chalk from "chalk";
import * as yargs from "yargs";
import { ensureTemplates, clearTemplateCache } from "./utils/templateFetcher";

const CURR_DIR = process.cwd();

interface Answers {
  programmingLanguage: string;
  framework?: string;
  starter?: string;
  tutorial?: string;
  name: string;
}

async function run() {
  // CLI flags
  if (yargs.argv["clear-cache"]) {
    clearTemplateCache();
    return;
  }

  // 🔥 Fetch templates
  const baseTemplates = await ensureTemplates();

  // 🔥 Dynamic loading
  const PROGRAMMING_LANGUAGE = fs.readdirSync(baseTemplates);

  const JAVASCRIPTFRAMEWORK = fs.readdirSync(
    path.join(baseTemplates, "javascript")
  );
  const TYPESCRIPTFRAMEWORK = fs.readdirSync(
    path.join(baseTemplates, "typescript")
  );
  const TUTORIALSTARTER = fs.readdirSync(
    path.join(baseTemplates, "tutorials")
  );

  // dynamic helper
  const getChoices = (lang: string, framework: string) =>
    fs.readdirSync(path.join(baseTemplates, lang, framework));

  const QUESTIONS: any[] = [
    {
      name: "programmingLanguage",
      type: "list",
      message:
        "Hello, I am Quicksi your personal assistant, what starter would you like to choose",
      choices: PROGRAMMING_LANGUAGE,
    },
    {
      name: "framework",
      type: "list",
      message: "Choose a framework",
      choices: (answers: any) => {
        if (answers.programmingLanguage === "javascript")
          return JAVASCRIPTFRAMEWORK;
        if (answers.programmingLanguage === "typescript")
          return TYPESCRIPTFRAMEWORK;
        return [];
      },
      when: (answers: any) =>
        answers.programmingLanguage !== "tutorials",
    },
    {
      name: "starter",
      type: "list",
      message: "Choose a starter",
      choices: (answers: any) =>
        getChoices(answers.programmingLanguage, answers.framework),
      when: (answers: any) =>
        answers.programmingLanguage !== "tutorials",
    },
    {
      name: "tutorial",
      type: "list",
      message: "Choose tutorial starter",
      choices: TUTORIALSTARTER,
      when: (answers: any) =>
        answers.programmingLanguage === "tutorials",
    },
    {
      name: "name",
      type: "input",
      message: "Project name:",
      validate: (input: string) =>
        /^([A-Za-z\-\_\d])+$/.test(input)
          ? true
          : "Invalid project name",
    },
  ];

  // const answers = await inquirer.prompt(QUESTIONS);
  const answers = (await inquirer.prompt(QUESTIONS)) as Answers;

  let templatePath: string;

  if (answers.programmingLanguage === "tutorials") {
    if (!answers.tutorial) {
      throw new Error("Tutorial is required");
    }
    templatePath = path.join(
      baseTemplates,
      "tutorials",
      answers.tutorial
    );
  } else {
    if (!answers.framework || !answers.starter) {
      throw new Error("Framework and starter are required");
    }
    templatePath = path.join(
      baseTemplates,
      answers.programmingLanguage,
      answers.framework,
      answers.starter
    );
  }

  const projectName = answers.name;
  const targetPath = path.join(CURR_DIR, projectName);

  if (!createProject(targetPath)) return;

  const config = getTemplateConfig(templatePath);

  createDirectoryContents(templatePath, projectName);

  postProcess(targetPath, templatePath);

  showMessage(projectName, config);
}

run();

function showMessage(projectName: string, config: any) {
  console.log("");

  // figlet("QUICKSI", (_, data) => {
  //   if (data) {
  //     console.log(chalk.yellow(data));
  //   }
  // });
  figlet("QUICKSI", (err: Error | null, data: string | undefined) => {
    if (err) {
      console.log("Error generating figlet");
      return;
    }

    if (data) {
      console.log(data);
    }
  });

  console.log(chalk.green(`Project created: ${projectName}`));
  console.log(chalk.green(`cd ${projectName}`));
  console.log("");

  if (config?.postMessage) {
    console.log(chalk.yellow(config.postMessage));
  }
}

function getTemplateConfig(templatePath: string) {
  const configPath = path.join(templatePath, ".template.json");
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red("Folder already exists"));
    return false;
  }
  fs.mkdirSync(projectPath);
  return true;
}

function postProcess(targetPath: string, templatePath: string) {
  if (fs.existsSync(path.join(templatePath, "package.json"))) {
    shell.cd(targetPath);
    shell.exec("npm install");
  }
}

function createDirectoryContents(
  templatePath: string,
  projectName: string
) {
  const files = fs.readdirSync(templatePath);

  files.forEach((file) => {
    if (file === ".template.json") return;

    const orig = path.join(templatePath, file);
    const dest = path.join(process.cwd(), projectName, file);

    if (fs.statSync(orig).isDirectory()) {
      fs.mkdirSync(dest);
      createDirectoryContents(orig, path.join(projectName, file));
    } else {
      const content = fs.readFileSync(orig, "utf-8");
      fs.writeFileSync(dest, content);
    }
  });
}