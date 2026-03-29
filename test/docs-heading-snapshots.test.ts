/**
 * @packageDocumentation
 * Snapshot coverage for rule docs heading schemas.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { parseMarkdownHeadingsAtLevel } from "./_internal/markdown-headings";

interface RuleDocsHeadingSnapshot {
    packageLabel: "none" | "ts-extras" | "type-fest";
    ruleId: string;
    sectionHeadings: readonly string[];
}

/** Parse all H2 headings from markdown in order. */
const parseH2Headings = (markdown: string): readonly string[] =>
    parseMarkdownHeadingsAtLevel(markdown, 2);

/**
 * Resolve normalized package label marker from docs markdown.
 *
 * @param markdown - Rule docs markdown.
 *
 * @returns `type-fest`, `ts-extras`, or `none` when no marker is present.
 */
const getPackageLabel = (
    markdown: string
): RuleDocsHeadingSnapshot["packageLabel"] => {
    if (markdown.includes("TypeFest package documentation:")) {
        return "type-fest";
    }

    if (markdown.includes("ts-extras package documentation:")) {
        return "ts-extras";
    }

    return "none";
};

/**
 * Build deterministic heading snapshots for every rule docs page.
 *
 * @returns Sorted heading snapshot records keyed by rule id.
 */
const getRuleDocsHeadingSnapshots = (): readonly RuleDocsHeadingSnapshot[] => {
    const docsDirectory = path.join(process.cwd(), "docs", "rules");

    return fs
        .readdirSync(docsDirectory)
        .filter((entry) => entry.startsWith("prefer-") && entry.endsWith(".md"))
        .toSorted((left, right) => left.localeCompare(right))
        .map((entry) => {
            const filePath = path.join(docsDirectory, entry);
            const markdown = fs.readFileSync(filePath, "utf8");

            return {
                packageLabel: getPackageLabel(markdown),
                ruleId: entry.replace(/\.md$/v, ""),
                sectionHeadings: parseH2Headings(markdown),
            };
        });
};

describe("rule docs heading snapshots", () => {
    it("keeps canonical rule docs heading matrix stable", () => {
        expect(getRuleDocsHeadingSnapshots()).toMatchSnapshot();
    });
});
