/**
 * @packageDocumentation
 * Contract test that keeps README rule matrix synchronized with plugin metadata.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    generateReadmeRulesSectionFromRules,
    syncReadmeRulesTable,
} from "../scripts/sync-readme-rules-table.mjs";
import typefestPlugin from "../src/plugin";

const RULES_SECTION_HEADING = "## Rules";
const RULES_SECTION_SNAPSHOT_PATH = path.join(
    "__snapshots__",
    "readme-rules-section.generated.md"
);
const processEnvironment = globalThis.process.env;
const SHOULD_SYNC_README_IN_UPDATE_MODE =
    process.argv.includes("-u") ||
    process.argv.includes("--update") ||
    processEnvironment["TYPEFEST_UPDATE_GENERATED_DOCS"] === "1";

const syncReadmeRulesTableIfRequested = async (): Promise<void> => {
    if (!SHOULD_SYNC_README_IN_UPDATE_MODE) {
        return;
    }

    await syncReadmeRulesTable({ writeChanges: true });
};

/**
 * Normalize markdown table row spacing so formatter-aligned columns compare
 * equivalently to compact generated table rows.
 *
 * @param markdown - Markdown content that may include table rows.
 *
 * @returns Normalized markdown preserving table semantics.
 */
const normalizeMarkdownTableSpacing = (markdown: string): string =>
    markdown
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => {
            const trimmedLine = line.trimEnd();

            const cells = trimmedLine
                .split("|")
                .slice(1, -1)
                .map((cell) => {
                    const trimmedCell = cell.trim();
                    const isSeparatorCell = /^:?-+:?$/v.test(trimmedCell);
                    const hasStartColon = trimmedCell.startsWith(":");
                    const hasEndColon = trimmedCell.endsWith(":");
                    const separatorKey =
                        `${Number(hasStartColon)}${Number(hasEndColon)}` as
                            | "00"
                            | "01"
                            | "10"
                            | "11";
                    const normalizedSeparator = (
                        {
                            "00": "---",
                            "01": "--:",
                            "10": ":--",
                            "11": ":-:",
                        } as const
                    )[separatorKey];

                    return isSeparatorCell ? normalizedSeparator : trimmedCell;
                });

            return /^\|.*\|$/v.test(trimmedLine)
                ? `| ${cells.join(" | ")} |`
                : trimmedLine;
        })
        .join("\n")
        .trimEnd();

/**
 * Extract the README rules section body beginning at `## Rules` without
 * including the blank separator line before the next heading.
 *
 * @param markdown - Full README markdown source.
 *
 * @returns Rules section markdown including heading.
 */
const extractRulesSection = (markdown: string): string => {
    const headingOffset = markdown.indexOf(RULES_SECTION_HEADING);

    if (headingOffset === -1) {
        throw new Error("README.md is missing the `## Rules` section heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        headingOffset + RULES_SECTION_HEADING.length
    );

    const sectionEndOffset =
        nextHeadingOffset === -1 ? markdown.length : nextHeadingOffset;

    return markdown.slice(headingOffset, sectionEndOffset);
};

describe("readme rules table synchronization", () => {
    it("matches the canonical rules matrix generated from plugin metadata", async () => {
        await syncReadmeRulesTableIfRequested();

        const readmePath = path.join(process.cwd(), "README.md");
        const readmeMarkdown = await fs.readFile(readmePath, "utf8");

        const readmeRulesSection = extractRulesSection(readmeMarkdown);
        const expectedRulesSection = generateReadmeRulesSectionFromRules(
            typefestPlugin.rules
        );

        expect(normalizeMarkdownTableSpacing(readmeRulesSection)).toBe(
            normalizeMarkdownTableSpacing(expectedRulesSection)
        );
    });

    it("keeps generated rules markdown snapshot-stable", async () => {
        const generatedRulesSection = generateReadmeRulesSectionFromRules(
            typefestPlugin.rules
        );

        await expect(generatedRulesSection).toMatchFileSnapshot(
            RULES_SECTION_SNAPSHOT_PATH
        );
    });
});
