/**
 * @packageDocumentation
 * Synchronize preset docs with currently exported plugin preset rule lists.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import builtPlugin from "../plugin.mjs";

const presetNames = [
    "minimal",
    "recommended",
    "strict",
    "all",
];

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {string} markdown
 *
 * @returns {"\n" | "\r\n"}
 */
const detectLineEnding = (markdown) =>
    markdown.includes("\r\n") ? "\r\n" : "\n";

/**
 * @param {string} markdown
 * @param {"\n" | "\r\n"} lineEnding
 *
 * @returns {string}
 */
const normalizeLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

/**
 * @param {string} presetName
 *
 * @returns {readonly string[]}
 */
const getPresetRuleNames = (presetName) => {
    const presetConfig = builtPlugin.configs?.[presetName];

    if (!isRecord(presetConfig)) {
        throw new TypeError(`Missing preset config '${presetName}'.`);
    }

    const rules = presetConfig["rules"];

    if (!isRecord(rules)) {
        return [];
    }

    return Object.keys(rules)
        .filter((qualifiedRuleName) => qualifiedRuleName.startsWith("typedoc/"))
        .map((qualifiedRuleName) => qualifiedRuleName.slice("typedoc/".length))
        .toSorted((left, right) => left.localeCompare(right));
};

/**
 * @param {readonly string[]} ruleNames
 *
 * @returns {string}
 */
const generateIncludedRulesSection = (ruleNames) => {
    const bullets =
        ruleNames.length === 0
            ? ["- _No rules currently enabled._"]
            : ruleNames.map((ruleName) => `- \`typedoc/${ruleName}\``);

    return [
        "## Included rules",
        "",
        ...bullets,
        "",
    ].join("\n");
};

/**
 * @param {string} markdown
 * @param {string} section
 *
 * @returns {string}
 */
const replaceIncludedRulesSection = (markdown, section) => {
    const heading = "## Included rules";
    const startOffset = markdown.indexOf(heading);

    if (startOffset < 0) {
        throw new Error("Preset markdown is missing '## Included rules'.");
    }

    const endOffset = markdown.indexOf("\n## ", startOffset + heading.length);

    return (
        markdown.slice(0, startOffset) +
        section +
        (endOffset < 0 ? "" : markdown.slice(endOffset))
    );
};

/**
 * @param {{ readonly writeChanges: boolean }} options
 *
 * @returns {Promise<{ readonly changedFiles: readonly string[] }>}
 */
export const syncPresetRuleDocs = async ({ writeChanges }) => {
    const repositoryRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const presetsDirectory = resolve(
        repositoryRoot,
        "docs",
        "rules",
        "presets"
    );

    /** @type {string[]} */
    const changedFiles = [];

    for (const presetName of presetNames) {
        const presetPath = resolve(presetsDirectory, `${presetName}.md`);
        const markdown = await readFile(presetPath, "utf8");
        const lineEnding = detectLineEnding(markdown);
        const nextSection = normalizeLineEndings(
            generateIncludedRulesSection(getPresetRuleNames(presetName)),
            lineEnding
        ).trimEnd();
        const nextMarkdown = replaceIncludedRulesSection(markdown, nextSection);

        if (nextMarkdown === markdown) {
            continue;
        }

        if (!writeChanges) {
            throw new Error(
                `Preset doc is out of date: docs/rules/presets/${presetName}.md`
            );
        }

        await writeFile(presetPath, nextMarkdown, "utf8");
        changedFiles.push(`docs/rules/presets/${presetName}.md`);
    }

    return {
        changedFiles,
    };
};

const writeChanges = process.argv.includes("--write");

syncPresetRuleDocs({ writeChanges })
    .then(({ changedFiles }) => {
        if (changedFiles.length === 0) {
            console.log("Preset rules docs are up to date.");
            return;
        }

        console.log("Updated preset docs:");
        for (const changedFile of changedFiles) {
            console.log(`- ${changedFile}`);
        }
    })
    .catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    });
