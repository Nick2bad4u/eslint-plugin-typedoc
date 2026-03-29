/**
 * @packageDocumentation
 * Synchronize or validate the README rules table from built plugin metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import builtPlugin from "../plugin.mjs";

/** @typedef {import("eslint").ESLint.Plugin} EslintPlugin */

const RULES_HEADING = "## Rules";
const PRESET_ORDER = /** @type {const} */ ([
    "minimal",
    "recommended",
    "strict",
    "all",
]);
/** @typedef {(typeof PRESET_ORDER)[number]} PresetName */
/** @type {Record<PresetName, string>} */
const PRESET_ICONS = {
    all: "🟣",
    minimal: "🟢",
    recommended: "🟡",
    strict: "🔴",
};

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
 * @param {string} markdown
 *
 * @returns {{ readonly endOffset: number; readonly startOffset: number }}
 */
const getRulesSectionBounds = (markdown) => {
    const startOffset = markdown.indexOf(RULES_HEADING);

    if (startOffset < 0) {
        throw new Error("README.md is missing the '## Rules' heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        startOffset + RULES_HEADING.length
    );

    return {
        endOffset: nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset,
        startOffset,
    };
};

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {unknown} plugin
 *
 * @returns {EslintPlugin}
 */
const asPlugin = (plugin) => {
    if (!isRecord(plugin)) {
        throw new TypeError("Built plugin export is not an object.");
    }

    return /** @type {EslintPlugin} */ (plugin);
};

/**
 * @param {unknown} ruleModule
 *
 * @returns {"—" | "💡" | "🔧" | "🔧 💡"}
 */
const getFixIndicator = (ruleModule) => {
    if (!isRecord(ruleModule)) {
        return "—";
    }

    const meta = ruleModule["meta"];

    if (!isRecord(meta)) {
        return "—";
    }

    const fixable = meta["fixable"] === "code";
    const hasSuggestions = meta["hasSuggestions"] === true;

    if (fixable && hasSuggestions) {
        return "🔧 💡";
    }

    if (fixable) {
        return "🔧";
    }

    if (hasSuggestions) {
        return "💡";
    }

    return "—";
};

/**
 * @param {EslintPlugin} plugin
 *
 * @returns {Readonly<Record<string, readonly PresetName[]>>}
 */
const collectPresetMembership = (plugin) => {
    const membership = /** @type {Record<string, PresetName[]>} */ ({});

    for (const presetName of PRESET_ORDER) {
        const presetConfig = plugin.configs?.[presetName];

        if (!isRecord(presetConfig)) {
            continue;
        }

        const rules = presetConfig["rules"];

        if (!isRecord(rules)) {
            continue;
        }

        for (const qualifiedRuleName of Object.keys(rules)) {
            if (!qualifiedRuleName.startsWith("typedoc/")) {
                continue;
            }

            const ruleName = qualifiedRuleName.slice("typedoc/".length);

            if (!Array.isArray(membership[ruleName])) {
                membership[ruleName] = [];
            }

            membership[ruleName].push(presetName);
        }
    }

    return membership;
};

/**
 * @param {string} ruleName
 * @param {unknown} ruleModule
 * @param {Readonly<Record<string, readonly PresetName[]>>} membership
 *
 * @returns {string}
 */
const createRuleRow = (ruleName, ruleModule, membership) => {
    if (!isRecord(ruleModule)) {
        throw new TypeError(`Rule module '${ruleName}' is not an object.`);
    }

    const meta = ruleModule["meta"];

    if (!isRecord(meta)) {
        throw new TypeError(`Rule module '${ruleName}' is missing meta.`);
    }

    const docs = meta["docs"];

    if (!isRecord(docs)) {
        throw new TypeError(`Rule module '${ruleName}' is missing meta.docs.`);
    }

    const docsUrl = docs["url"];

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(
            `Rule module '${ruleName}' is missing meta.docs.url.`
        );
    }

    const presets = membership[ruleName] ?? [];
    const presetText =
        presets.length === 0
            ? "—"
            : presets
                  .map(
                      (presetName) =>
                          `${PRESET_ICONS[presetName]} ${presetName}`
                  )
                  .join(" · ");

    return `| [\`${ruleName}\`](${docsUrl}) | ${getFixIndicator(ruleModule)} | ${presetText} |`;
};

/**
 * @param {EslintPlugin} plugin
 *
 * @returns {string}
 */
const generateRulesSection = (plugin) => {
    const rules = plugin.rules ?? {};
    const membership = collectPresetMembership(plugin);
    const rows = Object.entries(rules)
        .toSorted(([leftName], [rightName]) =>
            leftName.localeCompare(rightName)
        )
        .map(([ruleName, ruleModule]) =>
            createRuleRow(ruleName, ruleModule, membership)
        );

    return [
        "## Rules",
        "",
        "| Rule | Fix | Presets |",
        "| --- | :-: | :-- |",
        ...rows,
        "",
    ].join("\n");
};

/**
 * @param {{ readonly writeChanges: boolean }} options
 *
 * @returns {Promise<{ readonly changed: boolean }>}
 */
export const syncReadmeRulesTable = async ({ writeChanges }) => {
    const repositoryRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const readmePath = resolve(repositoryRoot, "README.md");
    const readmeText = await readFile(readmePath, "utf8");
    const lineEnding = detectLineEnding(readmeText);

    const plugin = asPlugin(builtPlugin);
    const generatedRulesSection = normalizeLineEndings(
        generateRulesSection(plugin),
        lineEnding
    ).trimEnd();

    const { endOffset, startOffset } = getRulesSectionBounds(readmeText);
    const existingRulesSection = readmeText
        .slice(startOffset, endOffset)
        .trimEnd();

    if (generatedRulesSection === existingRulesSection) {
        return { changed: false };
    }

    if (!writeChanges) {
        throw new Error(
            "README rules table is out of date. Run `npm run sync:readme-rules-table:write`."
        );
    }

    const nextReadmeText =
        readmeText.slice(0, startOffset) +
        generatedRulesSection +
        readmeText.slice(endOffset);

    await writeFile(readmePath, nextReadmeText, "utf8");

    return { changed: true };
};

const writeChanges = process.argv.includes("--write");

syncReadmeRulesTable({ writeChanges })
    .then(({ changed }) => {
        if (changed) {
            console.log("README rules table updated.");
            return;
        }

        console.log("README rules table is up to date.");
    })
    .catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    });
