/**
 * @packageDocumentation
 * Synchronize or validate the README rules matrix from canonical plugin metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";
import {
    typedocConfigMetadataByName,
    typedocConfigNamesByReadmeOrder,
    typedocConfigReferenceToName,
} from "../dist/_internal/typedoc-config-references.js";

/**
 * @typedef {Readonly<{
 *     meta?: {
 *         docs?: {
 *             typedocConfigs?: readonly string[] | string;
 *             url?: string;
 *         };
 *         fixable?: string;
 *         hasSuggestions?: boolean;
 *     };
 * }>} ReadmeRuleModule
 */

/** @typedef {Readonly<Record<string, ReadmeRuleModule>>} ReadmeRulesMap */
/** @typedef {import("../dist/_internal/typedoc-config-references.js").TypedocConfigName} PresetName */

const presetOrder = [...typedocConfigNamesByReadmeOrder];
const presetNameSet = new Set(presetOrder);
const rulesSectionHeading = "## Rules";
const presetDocsUrlBase =
    "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets";

/** @type {Readonly<Record<PresetName, string>>} */
const presetDocSlugByName = {
    all: "all",
    jsdoc: "jsdoc",
    markdown: "markdown",
    minimal: "minimal",
    recommended: "recommended",
    strict: "strict",
    tsdoc: "tsdoc",
};

/** @type {Readonly<Record<PresetName, string>>} */
const presetConfigReferenceByName = {
    all: "typedoc.configs.all",
    jsdoc: "typedoc.configs.jsdoc",
    markdown: "typedoc.configs.markdown",
    minimal: "typedoc.configs.minimal",
    recommended: "typedoc.configs.recommended",
    strict: "typedoc.configs.strict",
    tsdoc: "typedoc.configs.tsdoc",
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
const normalizeMarkdownLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

/**
 * @param {string} markdown
 *
 * @returns {Readonly<{ endOffset: number; startOffset: number }>}
 */
const getReadmeRulesSectionBounds = (markdown) => {
    const startOffset = markdown.indexOf(rulesSectionHeading);

    if (startOffset < 0) {
        throw new Error("README.md is missing the '## Rules' heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        startOffset + rulesSectionHeading.length
    );

    return {
        endOffset: nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset,
        startOffset,
    };
};

/**
 * @param {string} markdown
 *
 * @returns {string}
 */
export const extractReadmeRulesSection = (markdown) => {
    const { endOffset, startOffset } = getReadmeRulesSectionBounds(markdown);

    return markdown.slice(startOffset, endOffset);
};

/**
 * @param {string} markdown
 *
 * @returns {string}
 */
export const normalizeRulesSectionMarkdown = (markdown) =>
    markdown
        .replace(/\r\n/gv, "\n")
        .split("\n")
        .map((line) => {
            const trimmedLine = line.trimEnd();

            if (!/^\|.*\|$/v.test(trimmedLine)) {
                return trimmedLine;
            }

            const cells = trimmedLine
                .split("|")
                .slice(1, -1)
                .map((cell) => {
                    const trimmedCell = cell.trim();

                    if (!/^:?-+:?$/v.test(trimmedCell)) {
                        return trimmedCell;
                    }

                    const hasStartColon = trimmedCell.startsWith(":");
                    const hasEndColon = trimmedCell.endsWith(":");

                    if (hasStartColon && hasEndColon) {
                        return ":-:";
                    }

                    if (hasStartColon) {
                        return ":--";
                    }

                    if (hasEndColon) {
                        return "--:";
                    }

                    return "---";
                });

            return `| ${cells.join(" | ")} |`;
        })
        .join("\n")
        .trimEnd();

/**
 * @param {PresetName} presetName
 *
 * @returns {string}
 */
const createPresetDocsUrl = (presetName) =>
    `${presetDocsUrlBase}/${presetDocSlugByName[presetName]}`;

/**
 * @returns {readonly string[]}
 */
const createPresetLegendLines = () =>
    presetOrder.map((presetName) => {
        const docsUrl = createPresetDocsUrl(presetName);
        const icon = typedocConfigMetadataByName[presetName].icon;
        const configReference = presetConfigReferenceByName[presetName];

        return `  - [${icon}](${docsUrl}) — [\`${configReference}\`](${docsUrl})`;
    });

/**
 * @param {string} reference
 *
 * @returns {null | PresetName}
 */
const normalizeTypedocConfigName = (reference) => {
    if (Object.hasOwn(typedocConfigReferenceToName, reference)) {
        const key = /** @type {keyof typeof typedocConfigReferenceToName} */ (
            reference
        );

        return typedocConfigReferenceToName[key];
    }

    const asPresetName = /** @type {PresetName} */ (reference);

    return presetNameSet.has(asPresetName) ? asPresetName : null;
};

/**
 * @param {readonly string[] | string | undefined} typedocConfigs
 *
 * @returns {readonly PresetName[]}
 */
const normalizeTypedocConfigNames = (typedocConfigs) => {
    const references = Array.isArray(typedocConfigs)
        ? typedocConfigs
        : [typedocConfigs];

    /** @type {PresetName[]} */
    const names = [];
    /** @type {Set<PresetName>} */
    const seenPresetNames = new Set();

    for (const reference of references) {
        if (typeof reference !== "string") {
            continue;
        }

        const normalized = normalizeTypedocConfigName(reference);

        if (normalized === null || seenPresetNames.has(normalized)) {
            continue;
        }

        seenPresetNames.add(normalized);
        names.push(normalized);
    }

    return names;
};

/**
 * @param {ReadmeRuleModule} ruleModule
 *
 * @returns {"—" | "💡" | "🔧" | "🔧 💡"}
 */
const getRuleFixIndicator = (ruleModule) => {
    const fixable = ruleModule.meta?.fixable === "code";
    const hasSuggestions = ruleModule.meta?.hasSuggestions === true;

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
 * @param {ReadmeRuleModule} ruleModule
 *
 * @returns {string}
 */
const getPresetIndicator = (ruleModule) => {
    const presetNames = normalizeTypedocConfigNames(
        ruleModule.meta?.docs?.typedocConfigs
    );
    const presetNamesSet = new Set(presetNames);

    /** @type {string[]} */
    const icons = [];

    for (const presetName of presetOrder) {
        if (!presetNamesSet.has(presetName)) {
            continue;
        }

        const docsUrl = createPresetDocsUrl(presetName);
        const icon = typedocConfigMetadataByName[presetName].icon;

        icons.push(`[${icon}](${docsUrl})`);
    }

    return icons.length === 0 ? "—" : icons.join(" ");
};

/**
 * @param {readonly [string, ReadmeRuleModule]} entry
 *
 * @returns {string}
 */
const toRuleTableRow = ([ruleName, ruleModule]) => {
    const docsUrl = ruleModule.meta?.docs?.url;

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
    }

    return `| [\`${ruleName}\`](${docsUrl}) | ${getRuleFixIndicator(ruleModule)} | ${getPresetIndicator(ruleModule)} |`;
};

/**
 * Generate the canonical README rules section from plugin rules metadata.
 *
 * @param {ReadmeRulesMap} rules
 *
 * @returns {string}
 */
export const generateReadmeRulesSectionFromRules = (rules) => {
    const ruleEntries = Object.entries(rules).toSorted((left, right) =>
        left[0].localeCompare(right[0])
    );

    const rows = ruleEntries.map(toRuleTableRow);

    return [
        "## Rules",
        "",
        "- `Fix` legend:",
        "  - `🔧` = autofixable",
        "  - `💡` = suggestions available",
        "  - `—` = report only",
        "- `Preset key` legend:",
        ...createPresetLegendLines(),
        "",
        "| Rule | Fix | Preset key |",
        "| --- | :-: | :-- |",
        ...rows,
        "",
    ].join("\n");
};

/**
 * Synchronize the README rules table with canonical plugin metadata.
 *
 * @param {{ writeChanges: boolean }} input
 *
 * @returns {Promise<Readonly<{ changed: boolean }>>}
 */
export const syncReadmeRulesTable = async ({ writeChanges }) => {
    const workspaceRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const readmePath = resolve(workspaceRoot, "README.md");
    const readmeText = await readFile(readmePath, "utf8");
    const lineEnding = detectLineEnding(readmeText);

    const { endOffset, startOffset } = getReadmeRulesSectionBounds(readmeText);
    const readmePrefix = readmeText.slice(0, startOffset).trimEnd();
    const readmeSuffix = readmeText.slice(endOffset);

    const generatedRulesSection = generateReadmeRulesSectionFromRules(
        /** @type {ReadmeRulesMap} */ (builtPlugin.rules)
    );

    const existingRulesSection = extractReadmeRulesSection(readmeText);

    if (
        normalizeRulesSectionMarkdown(existingRulesSection) ===
        normalizeRulesSectionMarkdown(generatedRulesSection)
    ) {
        return {
            changed: false,
        };
    }

    const nextReadmeText = normalizeMarkdownLineEndings(
        `${readmePrefix}\n\n${generatedRulesSection}${readmeSuffix}`,
        lineEnding
    );

    if (readmeText === nextReadmeText) {
        return {
            changed: false,
        };
    }

    if (!writeChanges) {
        return {
            changed: true,
        };
    }

    await writeFile(readmePath, nextReadmeText, "utf8");

    return {
        changed: true,
    };
};

const runCli = async () => {
    const writeChanges = process.argv.includes("--write");
    const result = await syncReadmeRulesTable({ writeChanges });

    if (!result.changed) {
        console.log("README rules table is already synchronized.");

        return;
    }

    if (writeChanges) {
        console.log("README rules table synchronized from plugin metadata.");

        return;
    }

    console.error(
        "README rules table is out of sync. Run: npm run sync:readme-rules-table:write"
    );
    process.exitCode = 1;
};

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
