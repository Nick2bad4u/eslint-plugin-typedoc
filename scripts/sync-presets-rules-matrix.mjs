/**
 * @packageDocumentation
 * Synchronize or validate presets documentation tables from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";
import { generateReadmeRulesSectionFromRules } from "./sync-readme-rules-table.mjs";

/**
 * @typedef {Readonly<{
 *     meta?: {
 *         docs?: {
 *             typefestConfigs?: readonly string[] | string;
 *             url?: string;
 *         };
 *         fixable?: string;
 *         hasSuggestions?: boolean;
 *     };
 * }>} RuleModule
 */

/** @typedef {Readonly<Record<string, RuleModule>>} RulesMap */

/**
 * @typedef {"all"
 *     | "experimental"
 *     | "minimal"
 *     | "recommended"
 *     | "recommended-type-checked"
 *     | "strict"
 *     | "ts-extras/type-guards"
 *     | "type-fest/types"} PresetConfigName
 */

const matrixSectionHeading = "## Rule matrix";
const presetRulesSectionHeading = "## Rules in this preset";
const recommendedTypeCheckedLegacyHeading =
    "## What this preset adds on top of `recommended`";
const experimentalLegacyHeading = "## What this preset adds on top of `all`";
const presetsDocsDirectoryPath = "docs/rules/presets";

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

/** @type {Readonly<Record<PresetConfigName, string>>} */
const presetDocSlugByConfigName = {
    all: "all",
    experimental: "experimental",
    minimal: "minimal",
    recommended: "recommended",
    "recommended-type-checked": "recommended-type-checked",
    strict: "strict",
    "ts-extras/type-guards": "ts-extras-type-guards",
    "type-fest/types": "type-fest-types",
};

/** @type {readonly PresetConfigName[]} */
const standardPresetConfigNames = [
    "all",
    "minimal",
    "recommended",
    "strict",
    "ts-extras/type-guards",
    "type-fest/types",
];

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isUnknownRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {readonly string[]} values
 *
 * @returns {readonly string[]}
 */
const sortStrings = (values) =>
    [...values].toSorted((left, right) => left.localeCompare(right));

/**
 * @param {string} configRuleKey
 *
 * @returns {null | string}
 */
const toPluginRuleName = (configRuleKey) => {
    if (!configRuleKey.startsWith("typefest/")) {
        return null;
    }

    return configRuleKey.slice("typefest/".length);
};

/**
 * @param {PresetConfigName} presetConfigName
 *
 * @returns {readonly string[]}
 */
const collectPresetRuleNames = (presetConfigName) => {
    const presetConfig = builtPlugin.configs[presetConfigName];

    if (!isUnknownRecord(presetConfig)) {
        throw new TypeError(
            `Missing preset config '${presetConfigName}' in built plugin.`
        );
    }

    const rules = presetConfig["rules"];

    if (!isUnknownRecord(rules)) {
        return [];
    }

    const names = Object.keys(rules)
        .map(toPluginRuleName)
        .filter((name) => typeof name === "string");

    return sortStrings(names);
};

/**
 * @param {RuleModule} ruleModule
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
 * @param {string} ruleName
 *
 * @returns {RuleModule}
 */
const getRuleModuleByName = (ruleName) => {
    const candidate = builtPlugin.rules[ruleName];

    if (!isUnknownRecord(candidate)) {
        throw new TypeError(`Rule '${ruleName}' is missing from built plugin.`);
    }

    return /** @type {RuleModule} */ (candidate);
};

/**
 * @param {string} ruleName
 *
 * @returns {string}
 */
const toPresetRuleRow = (ruleName) => {
    const ruleModule = getRuleModuleByName(ruleName);
    const docsUrl = ruleModule.meta?.docs?.url;

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
    }

    return `| [\`${ruleName}\`](${docsUrl}) | ${getRuleFixIndicator(ruleModule)} |`;
};

/**
 * @param {readonly string[]} ruleNames
 *
 * @returns {string}
 */
const createPresetRulesTable = (ruleNames) => {
    if (ruleNames.length === 0) {
        return [
            "| Rule | Fix |",
            "| --- | :-: |",
            "| — | — |",
        ].join("\n");
    }

    return [
        "| Rule | Fix |",
        "| --- | :-: |",
        ...ruleNames.map(toPresetRuleRow),
    ].join("\n");
};

/**
 * @returns {readonly string[]}
 */
const createFixLegendLines = () => [
    "- `Fix` legend:",
    "  - `🔧` = autofixable",
    "  - `💡` = suggestions available",
    "  - `—` = report only",
];

/**
 * @param {PresetConfigName} presetConfigName
 *
 * @returns {string}
 */
const generateStandardPresetRulesSection = (presetConfigName) => {
    const presetRuleNames = collectPresetRuleNames(presetConfigName);

    return [
        presetRulesSectionHeading,
        "",
        ...createFixLegendLines(),
        "",
        createPresetRulesTable(presetRuleNames),
        "",
    ].join("\n");
};

/**
 * @returns {string}
 */
const generateRecommendedTypeCheckedRulesSection = () => {
    const recommendedRuleNames = collectPresetRuleNames("recommended");
    const recommendedTypeCheckedRuleNames = collectPresetRuleNames(
        "recommended-type-checked"
    );
    const recommendedRuleNameSet = new Set(recommendedRuleNames);
    const additionalTypeAwareRuleNames = recommendedTypeCheckedRuleNames.filter(
        (ruleName) => !recommendedRuleNameSet.has(ruleName)
    );

    return [
        presetRulesSectionHeading,
        "",
        ...createFixLegendLines(),
        "",
        "### Type-aware additions over `recommended`",
        "",
        createPresetRulesTable(additionalTypeAwareRuleNames),
        "",
        "### Baseline rules inherited from `recommended`",
        "",
        createPresetRulesTable(recommendedRuleNames),
        "",
    ].join("\n");
};

/**
 * @returns {string}
 */
const generateExperimentalRulesSection = () => {
    const allRuleNames = collectPresetRuleNames("all");
    const experimentalRuleNames = collectPresetRuleNames("experimental");
    const allRuleNameSet = new Set(allRuleNames);
    const experimentalOnlyRuleNames = experimentalRuleNames.filter(
        (ruleName) => !allRuleNameSet.has(ruleName)
    );

    return [
        presetRulesSectionHeading,
        "",
        ...createFixLegendLines(),
        "",
        "### Experimental additions over `all`",
        "",
        createPresetRulesTable(experimentalOnlyRuleNames),
        "",
        "### Baseline rules inherited from `all`",
        "",
        createPresetRulesTable(allRuleNames),
        "",
    ].join("\n");
};

/**
 * @param {string} markdown
 * @param {readonly string[]} headingCandidates
 *
 * @returns {{ headingOffset: number; sectionEndOffset: number }}
 */
const findSectionBoundsByHeadings = (markdown, headingCandidates) => {
    /** @type {number[]} */
    const headingOffsets = [];

    for (const headingCandidate of headingCandidates) {
        const headingOffset = markdown.indexOf(headingCandidate);

        if (headingOffset >= 0) {
            headingOffsets.push(headingOffset);
        }
    }

    if (headingOffsets.length === 0) {
        throw new Error(
            `Missing expected section heading. Tried: ${headingCandidates.join(
                ", "
            )}`
        );
    }

    const headingOffset = Math.min(...headingOffsets);
    const nextHeadingOffset = markdown.indexOf("\n## ", headingOffset + 1);
    const sectionEndOffset =
        nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset + 1;

    return {
        headingOffset,
        sectionEndOffset,
    };
};

/**
 * @param {{
 *     markdown: string;
 *     generatedSection: string;
 *     headingCandidates: readonly string[];
 * }} input
 *
 * @returns {{ changed: boolean; nextMarkdown: string }}
 */
const replaceMarkdownSection = ({
    markdown,
    generatedSection,
    headingCandidates,
}) => {
    const lineEnding = detectLineEnding(markdown);
    const { headingOffset, sectionEndOffset } = findSectionBoundsByHeadings(
        markdown,
        headingCandidates
    );
    const existingSection = markdown.slice(headingOffset, sectionEndOffset);

    if (
        normalizeMarkdownTableSpacing(existingSection) ===
        normalizeMarkdownTableSpacing(generatedSection)
    ) {
        return {
            changed: false,
            nextMarkdown: markdown,
        };
    }

    const markdownPrefix = markdown.slice(0, headingOffset).trimEnd();
    const markdownSuffix = markdown.slice(sectionEndOffset);
    const nextMarkdown = normalizeMarkdownLineEndings(
        `${markdownPrefix}\n\n${generatedSection}` + markdownSuffix,
        lineEnding
    );

    return {
        changed: true,
        nextMarkdown,
    };
};

/**
 * Normalize markdown table row spacing so formatter-aligned columns compare
 * equivalently to compact generated rows.
 *
 * @param {string} markdown
 *
 * @returns {string}
 */
const normalizeMarkdownTableSpacing = (markdown) =>
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
        .join("\n");

/**
 * Generate the canonical presets page rule-matrix section from plugin rules
 * metadata.
 *
 * @param {RulesMap} rules - Plugin `rules` map.
 *
 * @returns {string} Full markdown section text starting at `## Rule matrix`.
 */
export const generatePresetsRulesMatrixSectionFromRules = (rules) => {
    const readmeRulesSection = generateReadmeRulesSectionFromRules(rules)
        .replace(/\r\n/gv, "\n")
        .split("\n");

    const rulesBodyWithoutHeading = readmeRulesSection.slice(2);

    return [
        matrixSectionHeading,
        "",
        ...rulesBodyWithoutHeading,
    ].join("\n");
};

/**
 * @param {{
 *     workspaceRoot: string;
 *     writeChanges: boolean;
 * }} input
 */
const syncPresetsRulesMatrixSection = async ({
    workspaceRoot,
    writeChanges,
}) => {
    const presetsIndexPath = resolve(
        workspaceRoot,
        "docs/rules/presets/index.md"
    );
    const presetsIndexMarkdown = await readFile(presetsIndexPath, "utf8");
    const generatedSection = generatePresetsRulesMatrixSectionFromRules(
        /** @type {RulesMap} */ (builtPlugin.rules)
    );

    const sectionReplacementResult = replaceMarkdownSection({
        generatedSection,
        headingCandidates: [matrixSectionHeading],
        markdown: presetsIndexMarkdown,
    });

    if (!sectionReplacementResult.changed) {
        return {
            changed: false,
        };
    }

    if (!writeChanges) {
        return {
            changed: true,
        };
    }

    await writeFile(
        presetsIndexPath,
        sectionReplacementResult.nextMarkdown,
        "utf8"
    );

    return {
        changed: true,
    };
};

/**
 * @param {{
 *     workspaceRoot: string;
 *     writeChanges: boolean;
 * }} input
 */
const syncPresetPageRuleTables = async ({ workspaceRoot, writeChanges }) => {
    /** @type {boolean} */
    let changed = false;

    for (const presetConfigName of standardPresetConfigNames) {
        const presetDocPath = resolve(
            workspaceRoot,
            presetsDocsDirectoryPath,
            `${presetDocSlugByConfigName[presetConfigName]}.md`
        );
        const presetMarkdown = await readFile(presetDocPath, "utf8");
        const generatedSection =
            generateStandardPresetRulesSection(presetConfigName);
        const replacementResult = replaceMarkdownSection({
            generatedSection,
            headingCandidates: [presetRulesSectionHeading],
            markdown: presetMarkdown,
        });

        if (!replacementResult.changed) {
            continue;
        }

        changed = true;

        if (writeChanges) {
            await writeFile(
                presetDocPath,
                replacementResult.nextMarkdown,
                "utf8"
            );
        }
    }

    const recommendedTypeCheckedDocPath = resolve(
        workspaceRoot,
        presetsDocsDirectoryPath,
        `${presetDocSlugByConfigName["recommended-type-checked"]}.md`
    );
    const recommendedTypeCheckedMarkdown = await readFile(
        recommendedTypeCheckedDocPath,
        "utf8"
    );
    const recommendedTypeCheckedSection =
        generateRecommendedTypeCheckedRulesSection();
    const recommendedTypeCheckedReplacementResult = replaceMarkdownSection({
        generatedSection: recommendedTypeCheckedSection,
        headingCandidates: [
            presetRulesSectionHeading,
            recommendedTypeCheckedLegacyHeading,
        ],
        markdown: recommendedTypeCheckedMarkdown,
    });

    if (!recommendedTypeCheckedReplacementResult.changed) {
        // Continue on to the experimental preset page update below.
    } else {
        changed = true;

        if (writeChanges) {
            await writeFile(
                recommendedTypeCheckedDocPath,
                recommendedTypeCheckedReplacementResult.nextMarkdown,
                "utf8"
            );
        }
    }

    const experimentalDocPath = resolve(
        workspaceRoot,
        presetsDocsDirectoryPath,
        `${presetDocSlugByConfigName.experimental}.md`
    );
    const experimentalMarkdown = await readFile(experimentalDocPath, "utf8");
    const experimentalSection = generateExperimentalRulesSection();
    const experimentalReplacementResult = replaceMarkdownSection({
        generatedSection: experimentalSection,
        headingCandidates: [
            presetRulesSectionHeading,
            experimentalLegacyHeading,
        ],
        markdown: experimentalMarkdown,
    });

    if (!experimentalReplacementResult.changed) {
        return {
            changed,
        };
    }

    changed = true;

    if (writeChanges) {
        await writeFile(
            experimentalDocPath,
            experimentalReplacementResult.nextMarkdown,
            "utf8"
        );
    }

    return {
        changed,
    };
};

/**
 * @param {{ writeChanges: boolean }} input
 */
const syncPresetsDocs = async ({ writeChanges }) => {
    const workspaceRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const presetsMatrixResult = await syncPresetsRulesMatrixSection({
        workspaceRoot,
        writeChanges,
    });
    const presetPagesResult = await syncPresetPageRuleTables({
        workspaceRoot,
        writeChanges,
    });

    if (!presetsMatrixResult.changed && !presetPagesResult.changed) {
        return {
            changed: false,
        };
    }

    return {
        changed: true,
    };
};

const runCli = async () => {
    const writeChanges = process.argv.includes("--write");
    const result = await syncPresetsDocs({ writeChanges });

    if (!result.changed) {
        console.log("Presets documentation tables are already synchronized.");

        return;
    }

    if (writeChanges) {
        console.log(
            "Presets documentation tables synchronized from plugin metadata."
        );

        return;
    }

    console.error(
        "Presets documentation tables are out of sync. Run: node scripts/sync-presets-rules-matrix.mjs --write"
    );
    process.exitCode = 1;
};

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
