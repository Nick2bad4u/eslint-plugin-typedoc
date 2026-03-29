/**
 * @packageDocumentation
 * Stable catalog IDs for all plugin rules.
 */
import { objectFromEntries, setHas } from "ts-extras";

/**
 * Catalog metadata for a single rule.
 */
export type TypefestRuleCatalogEntry = Readonly<{
    ruleId: TypefestRuleCatalogId;
    ruleName: TypefestRuleNamePattern;
    ruleNumber: number;
}>;

/**
 * Stable machine-friendly rule id format (for example: `R001`).
 */
export type TypefestRuleCatalogId = `R${string}`;

/** Pattern for unqualified rule names supported by eslint-plugin-typefest. */
type TypefestRuleNamePattern = `prefer-${string}`;

/**
 * Stable global ordering used for rule catalog IDs.
 *
 * @remarks
 * Append new rules to preserve existing IDs.
 */
const orderedRuleNames = [
    "prefer-ts-extras-array-at",
    "prefer-ts-extras-array-concat",
    "prefer-ts-extras-array-find",
    "prefer-ts-extras-array-find-last",
    "prefer-ts-extras-array-find-last-index",
    "prefer-ts-extras-array-first",
    "prefer-ts-extras-array-includes",
    "prefer-ts-extras-array-join",
    "prefer-ts-extras-array-last",
    "prefer-ts-extras-as-writable",
    "prefer-ts-extras-assert-defined",
    "prefer-ts-extras-assert-error",
    "prefer-ts-extras-assert-present",
    "prefer-ts-extras-is-defined",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-empty",
    "prefer-ts-extras-is-equal-type",
    "prefer-ts-extras-is-finite",
    "prefer-ts-extras-is-infinite",
    "prefer-ts-extras-is-integer",
    "prefer-ts-extras-is-present",
    "prefer-ts-extras-is-present-filter",
    "prefer-ts-extras-is-safe-integer",
    "prefer-ts-extras-key-in",
    "prefer-ts-extras-not",
    "prefer-ts-extras-object-entries",
    "prefer-ts-extras-object-from-entries",
    "prefer-ts-extras-object-has-in",
    "prefer-ts-extras-object-has-own",
    "prefer-ts-extras-object-keys",
    "prefer-ts-extras-object-values",
    "prefer-ts-extras-safe-cast-to",
    "prefer-ts-extras-set-has",
    "prefer-ts-extras-string-split",
    "prefer-type-fest-abstract-constructor",
    "prefer-type-fest-arrayable",
    "prefer-type-fest-async-return-type",
    "prefer-type-fest-conditional-pick",
    "prefer-type-fest-constructor",
    "prefer-type-fest-except",
    "prefer-type-fest-if",
    "prefer-type-fest-iterable-element",
    "prefer-type-fest-json-array",
    "prefer-type-fest-json-object",
    "prefer-type-fest-json-primitive",
    "prefer-type-fest-json-value",
    "prefer-type-fest-keys-of-union",
    "prefer-type-fest-literal-union",
    "prefer-type-fest-merge-exclusive",
    "prefer-type-fest-non-empty-tuple",
    "prefer-type-fest-omit-index-signature",
    "prefer-type-fest-partial-deep",
    "prefer-type-fest-primitive",
    "prefer-type-fest-promisable",
    "prefer-type-fest-readonly-deep",
    "prefer-type-fest-require-all-or-none",
    "prefer-type-fest-require-at-least-one",
    "prefer-type-fest-require-exactly-one",
    "prefer-type-fest-require-one-or-none",
    "prefer-type-fest-required-deep",
    "prefer-type-fest-schema",
    "prefer-type-fest-set-non-nullable",
    "prefer-type-fest-set-optional",
    "prefer-type-fest-set-readonly",
    "prefer-type-fest-set-required",
    "prefer-type-fest-simplify",
    "prefer-type-fest-tagged-brands",
    "prefer-type-fest-tuple-of",
    "prefer-type-fest-unknown-array",
    "prefer-type-fest-unknown-map",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-unknown-set",
    "prefer-type-fest-unwrap-tagged",
    "prefer-type-fest-value-of",
    "prefer-type-fest-writable",
    "prefer-type-fest-writable-deep",
    "prefer-type-fest-and-all",
    "prefer-type-fest-array-length",
    "prefer-type-fest-optional",
    "prefer-type-fest-or-all",
    "prefer-type-fest-union-member",
    "prefer-type-fest-conditional-pick-deep",
    "prefer-type-fest-union-to-tuple",
    "prefer-type-fest-less-than",
    "prefer-type-fest-less-than-or-equal",
    "prefer-ts-extras-object-map-values",
    "prefer-type-fest-conditional-except",
    "prefer-type-fest-merge",
    "prefer-type-fest-stringified",
    "prefer-type-fest-union-to-intersection",
    "prefer-type-fest-distributed-omit",
    "prefer-type-fest-distributed-pick",
    "prefer-type-fest-set-return-type",
    "prefer-type-fest-asyncify",
    "prefer-type-fest-pick-index-signature",
    "prefer-type-fest-conditional-keys",
] as const satisfies readonly TypefestRuleNamePattern[];

const toRuleCatalogId = (ruleNumber: number): TypefestRuleCatalogId =>
    `R${String(ruleNumber).padStart(3, "0")}`;

const isTypefestRuleNamePattern = (
    ruleName: string
): ruleName is TypefestRuleNamePattern => ruleName.startsWith("prefer-");

/**
 * Canonical catalog metadata entries in stable display/order form.
 */
export const typefestRuleCatalogEntries: readonly TypefestRuleCatalogEntry[] =
    orderedRuleNames.map((ruleName, index) => {
        const ruleNumber = index + 1;

        return {
            ruleId: toRuleCatalogId(ruleNumber),
            ruleName,
            ruleNumber,
        };
    });

/**
 * Fast lookup map for rule catalog metadata by rule name.
 */
export const typefestRuleCatalogByRuleName: Readonly<
    Partial<Record<TypefestRuleNamePattern, TypefestRuleCatalogEntry>>
> = objectFromEntries(
    typefestRuleCatalogEntries.map((entry) => [entry.ruleName, entry])
);

/**
 * Resolve stable catalog metadata for a rule name.
 *
 * @throws When the rule is missing from the catalog.
 */
/**
 * Resolve stable catalog metadata for a rule name when available.
 */
export const getRuleCatalogEntryForRuleNameOrNull = (
    ruleName: string
): null | TypefestRuleCatalogEntry => {
    if (!isTypefestRuleNamePattern(ruleName)) {
        return null;
    }

    return typefestRuleCatalogByRuleName[ruleName] ?? null;
};

/**
 * Resolve stable catalog metadata for a rule name.
 *
 * @throws When the rule is missing from the catalog.
 */
export const getRuleCatalogEntryForRuleName = (
    ruleName: string
): TypefestRuleCatalogEntry => {
    const catalogEntry = getRuleCatalogEntryForRuleNameOrNull(ruleName);

    if (catalogEntry === null) {
        throw new TypeError(
            `Rule '${ruleName}' is missing from the stable rule catalog.`
        );
    }

    return catalogEntry;
};

/**
 * Resolve stable catalog metadata by rule id.
 */
export const typefestRuleCatalogByRuleId: ReadonlyMap<
    TypefestRuleCatalogId,
    TypefestRuleCatalogEntry
> = new Map(typefestRuleCatalogEntries.map((entry) => [entry.ruleId, entry]));

/**
 * Resolve stable catalog metadata for a catalog id.
 */
export const getRuleCatalogEntryForRuleId = (
    ruleId: TypefestRuleCatalogId
): TypefestRuleCatalogEntry | undefined =>
    typefestRuleCatalogByRuleId.get(ruleId);

/**
 * Validate that catalog IDs are unique and sequential.
 */
export const validateRuleCatalogIntegrity = (): boolean => {
    const entries = typefestRuleCatalogEntries;
    const seenRuleIds = new Set<TypefestRuleCatalogId>();

    for (const [index, entry] of entries.entries()) {
        if (setHas(seenRuleIds, entry.ruleId)) {
            return false;
        }

        seenRuleIds.add(entry.ruleId);

        const expectedRuleNumber = index + 1;
        if (entry.ruleNumber !== expectedRuleNumber) {
            return false;
        }

        if (entry.ruleId !== toRuleCatalogId(expectedRuleNumber)) {
            return false;
        }
    }

    return true;
};
