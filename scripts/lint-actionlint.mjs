#!/usr/bin/env node

/**
 * Run actionlint for workflow files, excluding Build.yml by default to avoid
 * hangs. Pass --include-build to lint all workflows (including Build.yml).
 *
 * Defaults:
 *
 * - Disable shellcheck/pyflakes integrations unless explicitly provided.
 * - Enable color output unless -no-color is provided.
 * - Use config/linting/ActionLintConfig.yaml unless -config-file is provided.
 */

import { readdirSync } from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, ".github", "workflows");
const rawArgs = process.argv.slice(2);
const overrideExcluded = rawArgs.includes("--include-excluded");
const excludedFiles = new Set(["FILL_EXCLUDED_FILES_HERE.yml"]);
/** @type {Set<string>} */
const flagsWithValues = new Set([
    "-config-file",
    "-format",
    "-ignore",
    "-pyflakes",
    "-shellcheck",
    "-stdin-filename",
]);

/** @type {string[]} */
const userArgs = [];
/** @type {string[]} */
const fileArgs = [];

for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === undefined) {
        continue;
    }

    if (arg === "--include-excluded") {
        continue;
    }

    if (arg === "-" || !arg.startsWith("-")) {
        fileArgs.push(arg);
        continue;
    }

    userArgs.push(arg);

    if (flagsWithValues.has(arg)) {
        const value = rawArgs[index + 1];
        if (typeof value === "string") {
            userArgs.push(value);
            index += 1;
        }
    }
}

/** @param {string} flag */
const hasFlag = (flag) => userArgs.includes(flag);
/** @param {string[]} flags */
const hasAnyFlag = (flags) => flags.some((flag) => hasFlag(flag));
const useDefaultFiles =
    fileArgs.length === 0 && !hasAnyFlag(["-version", "-init-config"]);

if (!hasFlag("-config-file")) {
    userArgs.push("-config-file", path.join(repoRoot, "ActionLintConfig.yaml"));
}

if (!hasAnyFlag(["-color", "-no-color"])) {
    userArgs.push("-color");
}

if (!hasFlag("-shellcheck")) {
    userArgs.push("-shellcheck", "");
}

if (!hasFlag("-pyflakes")) {
    userArgs.push("-pyflakes", "");
}

const workflowFiles = useDefaultFiles
    ? readdirSync(workflowsDir, { withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map((entry) => path.join(workflowsDir, entry.name))
          .filter((filePath) => {
              const ext = path.extname(filePath).toLowerCase();
              if (ext !== ".yml" && ext !== ".yaml") {
                  return false;
              }

              if (overrideExcluded) {
                  return true;
              }

              return !excludedFiles.has(path.basename(filePath).toLowerCase());
          })
          .toSorted((left, right) => left.localeCompare(right))
    : [];

const targetFiles = useDefaultFiles ? workflowFiles : fileArgs;

if (useDefaultFiles && targetFiles.length === 0) {
    console.error(pc.red("No workflow files found to lint."));
    process.exit(1);
}

if (useDefaultFiles) {
    const scopeText = overrideExcluded
        ? "including" + ` ${pc.magenta([...excludedFiles].join(", "))}`
        : "excluding" + ` ${pc.magenta([...excludedFiles].join(", "))}`;
    console.log(
        `${pc.bold(pc.cyan("Running actionlint on"))} ${pc.magenta(
            String(targetFiles.length)
        )} ${pc.cyan(`workflow file(s), ${scopeText}.`)}`
    );
}

const result = spawnSync("actionlint", [...userArgs, ...targetFiles], {
    stdio: "inherit",
});

if (result.error) {
    console.error(pc.red("Failed to run actionlint:"), result.error);
    process.exit(1);
}

if (result.status === 0) {
    console.log(pc.green("✓ actionlint completed successfully."));
    process.exit(0);
}

if (result.status !== null) {
    console.error(
        `${pc.red("actionlint failed with exit code")} ${pc.bold(
            pc.magenta(String(result.status))
        )}.`
    );
    process.exit(result.status);
}

if (result.signal !== null) {
    console.error(
        `${pc.red("actionlint terminated by signal")} ${pc.bold(
            pc.magenta(result.signal)
        )}.`
    );
    process.exit(1);
}

process.exit(result.status ?? 1);
