/**
 * @packageDocumentation
 * Contract test that keeps presets matrix synchronized with plugin metadata.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { generatePresetsRulesMatrixSectionFromRules } from "../scripts/sync-presets-rules-matrix.mjs";
import typefestPlugin from "../src/plugin";

const MATRIX_SECTION_HEADING = "## Rule matrix";

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
        .join("\n");

/**
 * Extract the presets `## Rule matrix` section.
 *
 * @param markdown - Full presets markdown source.
 *
 * @returns Matrix section markdown including heading.
 */
const extractMatrixSection = (markdown: string): string => {
    const headingOffset = markdown.indexOf(MATRIX_SECTION_HEADING);

    if (headingOffset === -1) {
        throw new Error(
            "docs/rules/presets/index.md is missing the `## Rule matrix` section heading."
        );
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        headingOffset + MATRIX_SECTION_HEADING.length
    );
    const sectionEndOffset =
        nextHeadingOffset === -1 ? markdown.length : nextHeadingOffset + 1;

    return markdown.slice(headingOffset, sectionEndOffset);
};

describe("presets rules matrix synchronization", () => {
    it("matches the canonical matrix generated from plugin metadata", async () => {
        const presetsIndexPath = path.join(
            process.cwd(),
            "docs",
            "rules",
            "presets",
            "index.md"
        );
        const presetsMarkdown = await fs.readFile(presetsIndexPath, "utf8");

        const presetsMatrixSection = extractMatrixSection(presetsMarkdown);
        const expectedMatrixSection =
            generatePresetsRulesMatrixSectionFromRules(typefestPlugin.rules);

        expect(normalizeMarkdownTableSpacing(presetsMatrixSection)).toBe(
            normalizeMarkdownTableSpacing(expectedMatrixSection)
        );
    });
});
