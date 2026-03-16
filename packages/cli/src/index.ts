#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS_DIR = join(homedir(), ".claude", "commands");
const CONFIG_DIR = join(homedir(), ".claudiary");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const TEMPLATE_PATH = join(__dirname, "..", "templates", "blog.md");

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function init() {
  console.log("\n  claudiary — Turn Claude Code conversations into blog posts\n");

  // 1. Install blog.md command
  if (!existsSync(COMMANDS_DIR)) {
    mkdirSync(COMMANDS_DIR, { recursive: true });
  }

  const dest = join(COMMANDS_DIR, "blog.md");
  const alreadyExists = existsSync(dest);

  if (alreadyExists) {
    const overwrite = await ask("  /blog command already exists. Overwrite? (y/N) ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("  Skipped command installation.\n");
    } else {
      copyFileSync(TEMPLATE_PATH, dest);
      console.log("  ✓ Updated /blog command\n");
    }
  } else {
    copyFileSync(TEMPLATE_PATH, dest);
    console.log("  ✓ Installed /blog command → ~/.claude/commands/blog.md\n");
  }

  // 2. Configure output target
  console.log("  Where should blog posts be saved?\n");
  console.log("    1) Local markdown files (./blog/*.md)");
  console.log("    2) claudiary web (requires API key)");
  console.log("    3) Both\n");

  const choice = await ask("  Choose (1/2/3): ");

  const config: { output: string; apiKey?: string; apiUrl?: string } = {
    output: "local",
  };

  if (choice === "2" || choice === "3") {
    config.output = choice === "3" ? "both" : "claudiary";
    console.log(
      "\n  Get your API key at: https://claudiary.vercel.app/dashboard/api-keys\n",
    );
    const apiKey = await ask("  API Key: ");
    if (apiKey) {
      config.apiKey = apiKey;
      config.apiUrl = "https://claudiary.vercel.app/api/v1";
    } else {
      console.log("  No API key provided. Using local output only.");
      config.output = "local";
    }
  }

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("  ✓ Config saved → ~/.claudiary/config.json\n");

  // Done
  console.log("  Done! Run /blog in Claude Code to generate your first post.\n");
}

function status() {
  console.log("\n  claudiary status\n");

  const commandExists = existsSync(join(COMMANDS_DIR, "blog.md"));
  console.log(
    `  /blog command: ${commandExists ? "✓ installed" : "✗ not installed"}`,
  );

  if (existsSync(CONFIG_PATH)) {
    const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    console.log(`  Output: ${config.output}`);
    if (config.apiKey) {
      console.log(`  API Key: ${config.apiKey.slice(0, 13)}...`);
    }
  } else {
    console.log("  Config: ✗ not configured");
  }

  console.log("");
}

function help() {
  console.log(`
  claudiary — Turn Claude Code conversations into blog posts

  Usage:
    npx claudiary init      Install /blog command and configure output
    npx claudiary status    Check installation status
    npx claudiary help      Show this help

  After init, run /blog in Claude Code to generate posts.
`);
}

const command = process.argv[2];

switch (command) {
  case "init":
    init();
    break;
  case "status":
    status();
    break;
  case "help":
  case "--help":
  case "-h":
    help();
    break;
  default:
    if (command) {
      console.log(`\n  Unknown command: ${command}`);
    }
    help();
    break;
}
