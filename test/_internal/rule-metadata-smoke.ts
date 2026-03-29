import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import { isTypefestConfigReference } from "../../src/_internal/typefest-config-references";

/**
 * Minimal shape read from dynamically imported rule modules for metadata
 * assertions.
 */
interface RuleMetadataSnapshot {
    create: (context: unknown) => unknown;
    defaultOptions?: UnknownArray;
    meta?: {
        docs?: {
            description?: string;
            recommended?: boolean;
            requiresTypeChecking?: boolean;
            ruleCatalogId?: string;
            ruleId?: string;
            ruleNumber?: number;
            typefestConfigs?: readonly string[] | string;
            url?: string;
        };
        fixable?: string;
        messages?: Record<string, string>;
        schema?: UnknownArray;
        type?: string;
    };
    name?: string;
}

/**
 * Narrow unknown values to object records used by runtime module guards.
 */
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

/**
 * Narrow unknown values to booleans for runtime metadata checks.
 */
const isBoolean = (value: unknown): value is boolean =>
    typeof value === "boolean";

/** Stable `R###` identifier format used by docs.ruleId and docs.ruleCatalogId. */
const ruleIdentifierPattern = /^R\d{3}$/v;

/** Validate an `R###` identifier and return a normalized string value. */
const getValidatedRuleIdentifier = (value: unknown): string => {
    expect(
        typeof value === "string" && ruleIdentifierPattern.test(value)
    ).toBeTruthy();

    return typeof value === "string" ? value : "";
};

/** Validate docs.ruleCatalogId and return a normalized string value. */
const getValidatedRuleCatalogId = (value: unknown): string =>
    getValidatedRuleIdentifier(value);

/** Validate docs.ruleId and return a normalized string value. */
const getValidatedRuleId = (value: unknown): string =>
    getValidatedRuleIdentifier(value);

/** Validate docs.ruleNumber and return a normalized numeric value. */
const getValidatedRuleNumber = (value: unknown): number => {
    expect(
        typeof value === "number" && Number.isInteger(value) && value > 0
    ).toBeTruthy();

    return typeof value === "number" ? value : Number.NaN;
};

/**
 * Guard dynamic import payloads to the expected `{ default: RuleMetadata }`
 * shape.
 */
const isRuleModuleSnapshot = (
    value: unknown
): value is Readonly<{ default: RuleMetadataSnapshot }> => {
    if (!isRecord(value)) {
        return false;
    }

    if (!Object.hasOwn(value, "default")) {
        return false;
    }

    const defaultExport = value["default"];

    return (
        isRecord(defaultExport) && typeof defaultExport["create"] === "function"
    );
};

/**
 * Optional expectation overrides used by shared rule-metadata smoke tests.
 */
interface TypeFestRuleMetadataExpectations {
    readonly defaultOptions?: UnknownArray;
    readonly docsDescription?: string;
    readonly enforceRuleShape?: boolean;
    readonly messages?: Readonly<Record<string, string>>;
    readonly name?: string;
}

/** Canonical documentation URL base used by rule metadata assertions. */
const docsBaseUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules";

/**
 * Normalize `meta.docs.typefestConfigs` into a reference list suitable for
 * assertion.
 */
const getTypefestConfigReferenceCandidates = (
    typefestConfigs: readonly string[] | string | undefined
): readonly string[] => {
    if (typeof typefestConfigs === "string") {
        return [typefestConfigs];
    }

    if (!Array.isArray(typefestConfigs)) {
        return [];
    }

    const references: string[] = [];

    for (const candidate of typefestConfigs) {
        if (typeof candidate === "string") {
            references.push(candidate);
        }
    }

    return references;
};

/**
 * Import a rule module by id from `src/rules`.
 *
 * @param ruleId - Unqualified rule module id.
 *
 * @returns Imported rule module default export.
 */
const importRuleModule = async (
    ruleId: string
): Promise<{ default: RuleMetadataSnapshot }> => {
    // eslint-disable-next-line no-unsanitized/method -- Rule ids are repository-controlled constants in test files.
    const moduleUnderTest: unknown = await import(
        `../../src/rules/${ruleId}.ts`
    );

    if (!isRuleModuleSnapshot(moduleUnderTest)) {
        throw new TypeError(
            `Rule module '${ruleId}' does not export a valid default rule object.`
        );
    }

    return moduleUnderTest;
};

/**
 * Registers shared metadata smoke tests that kill recurring Stryker survivors
 * in rule modules that use `createTypedRule`.
 *
 * @param ruleId - Rule module id under `src/rules`.
 * @param expectations - Optional expected metadata overrides.
 */
export const addTypeFestRuleMetadataSmokeTests = (
    ruleId: string,
    expectations: TypeFestRuleMetadataExpectations = {}
): void => {
    const expectedDefaultOptions = expectations.defaultOptions ?? [];
    const expectedDocsUrl = `${docsBaseUrl}/${ruleId}`;
    const expectedRuleName = expectations.name ?? ruleId;

    describe(`${ruleId} metadata`, () => {
        it("exports expected metadata baseline", async () => {
            const metadataRule = (await importRuleModule(ruleId)).default;
            const metadataDefaultOptions = metadataRule.defaultOptions;
            const expectedDocsDescription =
                expectations.docsDescription ??
                metadataRule.meta?.docs?.description;
            const expectedRuleShape = {
                fixable:
                    expectations.enforceRuleShape === true
                        ? "code"
                        : metadataRule.meta?.fixable,
                schema:
                    expectations.enforceRuleShape === true
                        ? []
                        : metadataRule.meta?.schema,
                type:
                    expectations.enforceRuleShape === true
                        ? "suggestion"
                        : metadataRule.meta?.type,
            } as const;

            expect(metadataRule.name).toBe(expectedRuleName);
            expect(metadataDefaultOptions).toStrictEqual(
                expectedDefaultOptions
            );
            expect(metadataRule.meta?.docs?.url).toBe(expectedDocsUrl);

            expect(metadataRule.meta?.docs?.description).toBe(
                expectedDocsDescription
            );

            expect(
                isBoolean(metadataRule.meta?.docs?.recommended)
            ).toBeTruthy();

            const presetReferences = getTypefestConfigReferenceCandidates(
                metadataRule.meta?.docs?.typefestConfigs
            );

            expect(presetReferences.length).toBeGreaterThan(0);

            for (const presetReference of presetReferences) {
                expect(isTypefestConfigReference(presetReference)).toBeTruthy();
            }

            expect(metadataRule.meta?.docs?.recommended).toBe(
                presetReferences.includes("typefest.configs.recommended")
            );

            const isRecommendedTypeCheckedRule = presetReferences.includes(
                "typefest.configs.recommended-type-checked"
            );

            const docsRuleCatalogId = metadataRule.meta?.docs?.ruleCatalogId;
            const requiresTypeChecking =
                metadataRule.meta?.docs?.requiresTypeChecking;
            const docsRuleId = metadataRule.meta?.docs?.ruleId;
            const docsRuleNumber = metadataRule.meta?.docs?.ruleNumber;

            expect(isBoolean(requiresTypeChecking)).toBeTruthy();

            const normalizedRuleCatalogId =
                getValidatedRuleCatalogId(docsRuleCatalogId);
            const normalizedRuleId = getValidatedRuleId(docsRuleId);
            const normalizedRuleNumber = getValidatedRuleNumber(docsRuleNumber);

            expect(
                ruleIdentifierPattern.test(normalizedRuleCatalogId)
            ).toBeTruthy();
            expect(normalizedRuleId).toBe(
                `R${String(normalizedRuleNumber).padStart(3, "0")}`
            );

            expect(
                !isRecommendedTypeCheckedRule || requiresTypeChecking === true
            ).toBeTruthy();
            expect(
                !isRecommendedTypeCheckedRule ||
                    !presetReferences.includes("typefest.configs.recommended")
            ).toBeTruthy();
            expect(
                !isRecommendedTypeCheckedRule ||
                    metadataRule.meta?.docs?.recommended === false
            ).toBeTruthy();

            for (const [messageId, expectedMessage] of Object.entries(
                expectations.messages ?? {}
            )) {
                expect(metadataRule.meta?.messages?.[messageId]).toBe(
                    expectedMessage
                );
            }

            expect(metadataRule.meta?.fixable).toBe(expectedRuleShape.fixable);
            expect(metadataRule.meta?.schema).toStrictEqual(
                expectedRuleShape.schema
            );
            expect(metadataRule.meta?.type).toBe(expectedRuleShape.type);
        });
    });
};
