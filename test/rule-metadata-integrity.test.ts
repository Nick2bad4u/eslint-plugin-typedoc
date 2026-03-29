/**
 * @packageDocumentation
 * Strong contract tests for required rule metadata across all registered rules.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { objectEntries } from "ts-extras";
import { describe, expect, it } from "vitest";

import { createRuleDocsUrl } from "../src/_internal/rule-docs-url";
import { isTypefestConfigReference } from "../src/_internal/typefest-config-references";
import typefestPlugin from "../src/plugin";

/** Allowed ESLint `meta.type` values for plugin rules. */
const expectedRuleTypes = new Set([
    "layout",
    "problem",
    "suggestion",
]);

/** Stable rule-catalog id format used in docs metadata. */
const ruleCatalogIdPattern = /^R\d{3}$/v;

/** Check whether a value is a non-empty trimmed string. */
const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

/** Guard unknown values to object-shaped records. */
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

/**
 * Read all rule source file names from `src/rules`.
 */
const getRuleSourceFileNames = (): readonly string[] => {
    const rulesDirectory = path.join(process.cwd(), "src", "rules");

    return fs
        .readdirSync(rulesDirectory)
        .filter((entry) => entry.endsWith(".ts"))
        .map((entry) => entry.replace(/\.ts$/v, ""))
        .toSorted((left, right) => left.localeCompare(right));
};

/**
 * Normalize `meta.docs.typefestConfigs` into a string array for assertions.
 */
const normalizeTypefestConfigReferences = (
    typefestConfigs: unknown
): readonly string[] => {
    if (typeof typefestConfigs === "string") {
        return [typefestConfigs];
    }

    if (!Array.isArray(typefestConfigs)) {
        return [];
    }

    const references: string[] = [];

    for (const reference of typefestConfigs) {
        if (typeof reference === "string") {
            references.push(reference);
        }
    }

    return references;
};

/**
 * Build an ordered 1-based sequence of expected rule numbers.
 */
const createExpectedRuleNumberSequence = (
    ruleCount: number
): readonly number[] => {
    const sequence: number[] = [];

    for (let index = 1; index <= ruleCount; index += 1) {
        sequence.push(index);
    }

    return sequence;
};

/**
 * Convert a rule-number set into an ascending numeric list.
 */
const getSortedRuleNumberValues = (
    values: ReadonlySet<number>
): readonly number[] => {
    const sortedValues: number[] = [];

    for (const value of values) {
        sortedValues.push(value);
    }

    sortedValues.sort((left, right) => left - right);

    return sortedValues;
};

/**
 * Read and validate one rule module as an object record.
 */
const getRuleRecord = (
    ruleName: string,
    ruleModule: unknown
): Readonly<Record<string, unknown>> => {
    expect(
        isRecord(ruleModule),
        `Rule '${ruleName}' must export an object`
    ).toBeTruthy();

    return isRecord(ruleModule) ? ruleModule : {};
};

/**
 * Read and validate one rule's `meta` object.
 */
const getRuleMetaRecord = (
    ruleName: string,
    ruleRecord: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> => {
    const meta = ruleRecord["meta"];

    expect(isRecord(meta), `Rule '${ruleName}' must define meta`).toBeTruthy();

    return isRecord(meta) ? meta : {};
};

/**
 * Read and validate one rule's docs metadata contract.
 */
const getRuleDocsRecord = (
    ruleName: string,
    metaRecord: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> => {
    const docs = metaRecord["docs"];

    expect(
        isRecord(docs),
        `Rule '${ruleName}' must define meta.docs`
    ).toBeTruthy();

    return isRecord(docs) ? docs : {};
};

/**
 * Assert schema/default-options contract including canonical option defaults.
 */
const assertDefaultOptionsContract = ({
    metaRecord,
    ruleName,
    ruleRecord,
}: Readonly<{
    metaRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
    ruleRecord: Readonly<Record<string, unknown>>;
}>): void => {
    const defaultOptions = ruleRecord["defaultOptions"];

    expect(
        Array.isArray(defaultOptions),
        `Rule '${ruleName}' must declare defaultOptions as an array`
    ).toBeTruthy();

    const metaDefaultOptions = metaRecord["defaultOptions"];

    if (metaDefaultOptions !== undefined) {
        expect(Array.isArray(metaDefaultOptions)).toBeTruthy();
        expect(metaDefaultOptions).toStrictEqual(defaultOptions);

        const typedMetaDefaultOptions =
            metaDefaultOptions as readonly unknown[];
        const typedDefaultOptions = defaultOptions as readonly unknown[];

        expect(typedMetaDefaultOptions).toHaveLength(
            typedDefaultOptions.length
        );

        for (const [index, optionValue] of typedDefaultOptions.entries()) {
            expect(typedMetaDefaultOptions[index]).toBe(optionValue);
        }
    }

    const schema = metaRecord["schema"];

    if (Array.isArray(schema) && schema.length > 0) {
        expect(metaDefaultOptions).toBeDefined();
        expect(metaDefaultOptions).toStrictEqual(defaultOptions);
    }
};

/**
 * Assert docs metadata and preset-membership invariants for one rule.
 */
const assertDocsContract = ({
    docsRecord,
    ruleName,
}: Readonly<{
    docsRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
}>): void => {
    const description = docsRecord["description"];
    const recommended = docsRecord["recommended"];
    const requiresTypeChecking = docsRecord["requiresTypeChecking"];
    const ruleCatalogId = docsRecord["ruleCatalogId"];
    const ruleId = docsRecord["ruleId"];
    const ruleNumber = docsRecord["ruleNumber"];
    const typefestConfigs = docsRecord["typefestConfigs"];
    const url = docsRecord["url"];

    expect(
        isNonEmptyString(description),
        `Rule '${ruleName}' must provide a non-empty docs.description`
    ).toBeTruthy();
    expect(
        typeof recommended === "boolean",
        `Rule '${ruleName}' must provide boolean docs.recommended`
    ).toBeTruthy();
    expect(
        typeof requiresTypeChecking === "boolean",
        `Rule '${ruleName}' must provide boolean docs.requiresTypeChecking`
    ).toBeTruthy();
    expect(
        typeof ruleCatalogId === "string" &&
            ruleCatalogIdPattern.test(ruleCatalogId),
        `Rule '${ruleName}' must provide docs.ruleCatalogId in 'R###' format`
    ).toBeTruthy();
    expect(
        typeof ruleId === "string" && ruleCatalogIdPattern.test(ruleId),
        `Rule '${ruleName}' must provide docs.ruleId in 'R###' format`
    ).toBeTruthy();
    expect(
        Number.isInteger(ruleNumber) &&
            typeof ruleNumber === "number" &&
            ruleNumber > 0,
        `Rule '${ruleName}' must provide positive integer docs.ruleNumber`
    ).toBeTruthy();
    expect(
        isNonEmptyString(url),
        `Rule '${ruleName}' must provide a non-empty docs.url`
    ).toBeTruthy();

    if (
        !isNonEmptyString(url) ||
        typeof ruleCatalogId !== "string" ||
        typeof recommended !== "boolean" ||
        typeof ruleId !== "string" ||
        typeof ruleNumber !== "number"
    ) {
        return;
    }

    expect(ruleId).toBe(`R${String(ruleNumber).padStart(3, "0")}`);

    const expectedRuleUrl = createRuleDocsUrl(ruleName);

    expect(url).toBe(expectedRuleUrl);

    const docsPath = path.join(
        process.cwd(),
        "docs",
        "rules",
        `${ruleName}.md`
    );

    expect(fs.existsSync(docsPath)).toBeTruthy();

    const typefestConfigReferences =
        normalizeTypefestConfigReferences(typefestConfigs);

    expect(
        typefestConfigReferences.length > 0,
        `Rule '${ruleName}' must declare at least one docs.typefestConfigs entry`
    ).toBeTruthy();
    expect(typefestConfigReferences).toHaveLength(
        new Set(typefestConfigReferences).size
    );

    for (const reference of typefestConfigReferences) {
        expect(
            isTypefestConfigReference(reference),
            `Rule '${ruleName}' has invalid docs.typefestConfigs reference '${reference}'`
        ).toBeTruthy();
    }

    const includesRecommendedReference = typefestConfigReferences.includes(
        "typefest.configs.recommended"
    );
    const includesRecommendedTypeCheckedReference =
        typefestConfigReferences.includes(
            "typefest.configs.recommended-type-checked"
        ) ||
        typefestConfigReferences.includes(
            'typefest.configs["recommended-type-checked"]'
        );

    expect(recommended).toBe(includesRecommendedReference);

    if (
        includesRecommendedTypeCheckedReference &&
        typeof requiresTypeChecking === "boolean"
    ) {
        expect(requiresTypeChecking).toBeTruthy();
        expect(includesRecommendedReference).toBeFalsy();
        expect(recommended).toBeFalsy();
    }
};

/**
 * Assert base rule metadata contract shared by every plugin rule.
 */
const assertBaseRuleMetadataContract = ({
    metaRecord,
    ruleName,
    ruleRecord,
}: Readonly<{
    metaRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
    ruleRecord: Readonly<Record<string, unknown>>;
}>): void => {
    const type = metaRecord["type"];
    const schema = metaRecord["schema"];
    const ruleNameProperty = ruleRecord["name"];

    expect(ruleNameProperty).toBe(ruleName);
    expect(
        isNonEmptyString(type) && expectedRuleTypes.has(type),
        `Rule '${ruleName}' has unsupported meta.type '${String(type)}'`
    ).toBeTruthy();
    expect(
        Array.isArray(schema),
        `Rule '${ruleName}' must declare a schema array`
    ).toBeTruthy();
};

/**
 * Assert message and fix/suggestion metadata consistency.
 */
const assertMessageAndFixContract = ({
    metaRecord,
    ruleName,
}: Readonly<{
    metaRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
}>): void => {
    const messages = metaRecord["messages"];

    expect(
        isRecord(messages),
        `Rule '${ruleName}' must define a messages record`
    ).toBeTruthy();

    if (!isRecord(messages)) {
        return;
    }

    const messageEntries = objectEntries(messages);

    expect(
        messageEntries.length,
        `Rule '${ruleName}' must define at least one message`
    ).toBeGreaterThan(0);

    for (const [messageId, messageTemplate] of messageEntries) {
        expect(
            isNonEmptyString(messageTemplate),
            `Rule '${ruleName}' message '${messageId}' must be a non-empty string`
        ).toBeTruthy();
    }

    const fixable = metaRecord["fixable"];

    if (fixable !== undefined) {
        expect(fixable).toBe("code");
    }

    if (metaRecord["hasSuggestions"] === true) {
        expect(
            messageEntries.some(([messageId]) =>
                messageId.toLowerCase().includes("suggest")
            ),
            `Rule '${ruleName}' enables suggestions but does not define a suggestion message id`
        ).toBeTruthy();
    }
};

describe("rule metadata integrity", () => {
    it("exports processors for plugin shape parity", () => {
        expect(typefestPlugin).toHaveProperty("processors");
        expect(typefestPlugin.processors).toEqual({});
    });

    it("keeps src/rules file names in sync with registered rule names", () => {
        const registeredRuleNames = Object.keys(typefestPlugin.rules).toSorted(
            (left, right) => left.localeCompare(right)
        );

        expect(getRuleSourceFileNames()).toStrictEqual(registeredRuleNames);
    });

    it("enforces required metadata invariants for every rule", () => {
        const ruleEntries = objectEntries(typefestPlugin.rules);
        const seenRuleCatalogIds = new Set<string>();
        const seenRuleIds = new Set<string>();
        const seenRuleNumbers = new Set<number>();

        expect(ruleEntries.length).toBeGreaterThan(0);

        for (const [ruleName, ruleModule] of ruleEntries) {
            const ruleRecord = getRuleRecord(ruleName, ruleModule);
            const metaRecord = getRuleMetaRecord(ruleName, ruleRecord);
            const docsRecord = getRuleDocsRecord(ruleName, metaRecord);

            assertBaseRuleMetadataContract({
                metaRecord,
                ruleName,
                ruleRecord,
            });
            assertDefaultOptionsContract({
                metaRecord,
                ruleName,
                ruleRecord,
            });
            assertDocsContract({
                docsRecord,
                ruleName,
            });
            assertMessageAndFixContract({
                metaRecord,
                ruleName,
            });

            const docsRuleId = docsRecord["ruleId"];
            const docsRuleCatalogId = docsRecord["ruleCatalogId"];
            const docsRuleNumber = docsRecord["ruleNumber"];

            if (typeof docsRuleCatalogId === "string") {
                seenRuleCatalogIds.add(docsRuleCatalogId);
            }

            if (typeof docsRuleId === "string") {
                seenRuleIds.add(docsRuleId);
            }

            if (typeof docsRuleNumber === "number") {
                seenRuleNumbers.add(docsRuleNumber);
            }
        }

        expect(seenRuleCatalogIds.size).toBe(1);
        expect(seenRuleIds.size).toBe(ruleEntries.length);
        expect(seenRuleNumbers.size).toBe(ruleEntries.length);
        expect(getSortedRuleNumberValues(seenRuleNumbers)).toStrictEqual(
            createExpectedRuleNumberSequence(ruleEntries.length)
        );
    });
});
