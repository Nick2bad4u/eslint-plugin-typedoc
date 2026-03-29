/**
 * @packageDocumentation
 * Vitest coverage for `docs-integrity.test` behavior.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createRuleDocsUrl } from "../src/_internal/rule-docs-url";
import typefestPlugin from "../src/plugin";
import { parseMarkdownHeadingsAtLevel } from "./_internal/markdown-headings";

interface RuleWithMeta {
    readonly meta?: {
        readonly docs?: {
            readonly description?: unknown;
            readonly url?: unknown;
        };
    };
}

const canonicalHeadingOrder = [
    "Targeted pattern scope",
    "What this rule reports",
    "Why this rule exists",
    "❌ Incorrect",
    "✅ Correct",
    "Behavior and migration notes",
    "Additional examples",
    "ESLint flat config example",
    "When not to use it",
    "Package documentation",
    "Further reading",
    "Adoption resources",
] as const;

const requiredCoreHeadings = [
    "Targeted pattern scope",
    "What this rule reports",
    "Why this rule exists",
    "❌ Incorrect",
    "✅ Correct",
    "Package documentation",
    "Further reading",
] as const;

const canonicalHeadingOrderIndex = new Map<string, number>(
    canonicalHeadingOrder.map((heading, index) => [heading, index])
);

const legacyHeadingsPattern =
    /^##\s+(?:Targeted assertion pattern|Upstream helper TSDoc|Upstream helper status|Upstream type TSDoc|What it checks|Why)$/mv;

const legacyExampleHeadingLabelPattern =
    /\((?:additional scenario|team-scale usage)\)/v;

const unlinkedTopSummaryPattern =
    /^(?:Prefer|Require) `[^`]+` from `(?:ts-extras|type-fest)`/mv;
const ruleCatalogIdLinePattern = /^> \*\*Rule catalog ID:\*\* R\d{3}$/gmv;

/**
 * Assert canonical heading presence/order and core placement constraints.
 *
 * @param headings - Parsed H2 heading names.
 */
function assertCanonicalHeadingSchema(headings: readonly string[]): void {
    let lastHeadingOrder = -1;

    for (const heading of headings) {
        const headingOrder = canonicalHeadingOrderIndex.get(heading);

        expect(headingOrder).toBeDefined();

        const safeHeadingOrder = headingOrder ?? -1;

        expect(safeHeadingOrder).toBeGreaterThanOrEqual(lastHeadingOrder);

        lastHeadingOrder = safeHeadingOrder;
    }

    const packageDocsIndex = headings.indexOf("Package documentation");
    const furtherReadingIndex = headings.indexOf("Further reading");
    const targetedPatternScopeIndex = headings.indexOf(
        "Targeted pattern scope"
    );
    const whatThisRuleReportsIndex = headings.indexOf("What this rule reports");

    for (const requiredHeading of requiredCoreHeadings) {
        expect(headings).toContain(requiredHeading);
    }

    expect(targetedPatternScopeIndex).toBe(0);
    expect(whatThisRuleReportsIndex).toBe(targetedPatternScopeIndex + 1);
    expect(packageDocsIndex).toBeGreaterThanOrEqual(0);
    expect(furtherReadingIndex).toBeGreaterThanOrEqual(0);
    expect(packageDocsIndex).toBe(furtherReadingIndex - 1);
}

/**
 * Assert optional detail heading placement/order.
 *
 * @param markdown - Rule documentation markdown.
 */
function assertOptionalDetailHeadingPlacement(markdown: string): void {
    const packageHeadingOffset = markdown.indexOf("## Package documentation");
    const matchedPatternsOffset = markdown.indexOf("### Matched patterns");
    const detectionBoundariesOffset = markdown.indexOf(
        "### Detection boundaries"
    );
    const targetedScopeOffset = markdown.indexOf("## Targeted pattern scope");
    const whatThisRuleReportsOffset = markdown.indexOf(
        "## What this rule reports"
    );

    if (matchedPatternsOffset !== -1) {
        expect(packageHeadingOffset).toBeGreaterThan(matchedPatternsOffset);

        const inTargetedScope =
            matchedPatternsOffset > targetedScopeOffset &&
            matchedPatternsOffset < whatThisRuleReportsOffset;
        const inWhatThisRuleReports =
            matchedPatternsOffset > whatThisRuleReportsOffset &&
            (packageHeadingOffset === -1 ||
                matchedPatternsOffset < packageHeadingOffset);

        expect(inTargetedScope || inWhatThisRuleReports).toBeTruthy();
    }

    if (detectionBoundariesOffset !== -1) {
        expect(packageHeadingOffset).toBeGreaterThan(detectionBoundariesOffset);

        const inTargetedScope =
            detectionBoundariesOffset > targetedScopeOffset &&
            detectionBoundariesOffset < whatThisRuleReportsOffset;
        const inWhatThisRuleReports =
            detectionBoundariesOffset > whatThisRuleReportsOffset &&
            (packageHeadingOffset === -1 ||
                detectionBoundariesOffset < packageHeadingOffset);

        expect(inTargetedScope || inWhatThisRuleReports).toBeTruthy();
    }

    if (matchedPatternsOffset !== -1 && detectionBoundariesOffset !== -1) {
        expect(detectionBoundariesOffset).toBeGreaterThan(
            matchedPatternsOffset
        );
    }
}

/**
 * Assert package documentation label by rule family.
 *
 * @param fileName - Rule docs file name.
 * @param markdown - Rule documentation markdown.
 */
function assertPackageLabel(fileName: string, markdown: string): void {
    if (fileName.startsWith("prefer-type-fest-")) {
        expect(markdown).toMatch(/^TypeFest package documentation:$/mv);
    }

    if (fileName.startsWith("prefer-ts-extras-")) {
        expect(markdown).toMatch(/^ts-extras package documentation:$/mv);
    }
}

/**
 * Assert that each rule doc defines exactly one canonical Rule catalog ID line.
 *
 * @param markdown - Rule documentation markdown.
 */
function assertRuleCatalogIdLine(markdown: string): void {
    const matches = markdown.match(ruleCatalogIdLinePattern) ?? [];
    const lines = markdown.split(/\r?\n/v);
    const ruleCatalogIdLineIndex = lines.findIndex((line) =>
        /^> \*\*Rule catalog ID:\*\* R\d{3}$/v.test(line)
    );
    const furtherReadingHeadingIndex = lines.indexOf("## Further reading");
    const separatorLine = lines[ruleCatalogIdLineIndex + 1];

    expect(matches).toHaveLength(1);
    expect(ruleCatalogIdLineIndex).toBeGreaterThanOrEqual(0);
    expect(furtherReadingHeadingIndex).toBeGreaterThanOrEqual(0);
    expect(separatorLine).toMatch(/^\s*$/v);
    expect(ruleCatalogIdLineIndex).toBe(furtherReadingHeadingIndex - 2);
}

/**
 * Narrow a dynamic plugin rule value to a shape that includes `meta.docs`.
 *
 * @param value - Dynamic rule module candidate.
 *
 * @returns `true` when the value is object-like and can be inspected for
 *   documentation metadata.
 */
function isRuleWithMeta(value: unknown): value is RuleWithMeta {
    return typeof value === "object" && value !== null;
}

/**
 * Parse H1 headings from Markdown content.
 *
 * @param markdown - Rule documentation markdown.
 *
 * @returns Ordered H1 heading names.
 */
function parseH1Headings(markdown: string): string[] {
    return [...parseMarkdownHeadingsAtLevel(markdown, 1)];
}

/**
 * Parse H2 headings from Markdown content.
 *
 * @param markdown - Rule documentation markdown.
 *
 * @returns Ordered H2 heading names.
 */
function parseH2Headings(markdown: string): string[] {
    return [...parseMarkdownHeadingsAtLevel(markdown, 2)];
}

describe("typefest rule docs", () => {
    it("every rule has a docs url and a matching docs/rules/<id>.md file", () => {
        const { rules } = typefestPlugin;

        expect(rules).toBeDefined();

        const docsDir = path.join(process.cwd(), "docs", "rules");

        for (const [ruleId, rule] of Object.entries(rules ?? {})) {
            const docs = isRuleWithMeta(rule)
                ? (rule.meta?.docs ?? null)
                : null;

            const url = docs?.url;

            if (typeof url === "string") {
                expect(url).toBe(createRuleDocsUrl(ruleId));
                expect(url).not.toContain(".md");
            }

            const description = docs?.description;

            expectTypeOf(description).toEqualTypeOf<string | undefined>();

            const expectedPath = path.join(docsDir, `${ruleId}.md`);

            expect(fs.existsSync(expectedPath)).toBeTruthy();
        }
    });

    it("rule docs keep a canonical heading schema and package documentation placement", async () => {
        const docsDir = path.join(process.cwd(), "docs", "rules");

        const ruleDocFiles = fs
            .readdirSync(docsDir)
            .filter(
                (entry) => entry.startsWith("prefer-") && entry.endsWith(".md")
            )
            .toSorted((left, right) => left.localeCompare(right));

        expect(ruleDocFiles.length).toBeGreaterThan(0);

        for (const fileName of ruleDocFiles) {
            const fullPath = path.join(docsDir, fileName);
            const markdown = await fs.promises.readFile(fullPath, "utf8");

            expect(markdown).not.toMatch(legacyHeadingsPattern);
            expect(markdown).not.toMatch(legacyExampleHeadingLabelPattern);
            expect(markdown).not.toMatch(unlinkedTopSummaryPattern);

            const h1Headings = parseH1Headings(markdown);
            const headings = parseH2Headings(markdown);
            const expectedRuleId = fileName.replace(/\.md$/v, "");

            expect(h1Headings).toHaveLength(1);
            expect(h1Headings[0]).toBe(expectedRuleId);
            expect(new Set(headings).size).toBe(headings.length);

            assertCanonicalHeadingSchema(headings);
            assertOptionalDetailHeadingPlacement(markdown);
            assertPackageLabel(fileName, markdown);
            assertRuleCatalogIdLine(markdown);
        }
    });
});
