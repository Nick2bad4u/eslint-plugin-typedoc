/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-typefest.
 */

import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import preferTsExtrasArrayAtRule from "../rules/prefer-ts-extras-array-at.js";
import preferTsExtrasArrayConcatRule from "../rules/prefer-ts-extras-array-concat.js";
import preferTsExtrasArrayFindLastIndexRule from "../rules/prefer-ts-extras-array-find-last-index.js";
import preferTsExtrasArrayFindLastRule from "../rules/prefer-ts-extras-array-find-last.js";
import preferTsExtrasArrayFindRule from "../rules/prefer-ts-extras-array-find.js";
import preferTsExtrasArrayFirstRule from "../rules/prefer-ts-extras-array-first.js";
import preferTsExtrasArrayIncludesRule from "../rules/prefer-ts-extras-array-includes.js";
import preferTsExtrasArrayJoinRule from "../rules/prefer-ts-extras-array-join.js";
import preferTsExtrasArrayLastRule from "../rules/prefer-ts-extras-array-last.js";
import preferTsExtrasAsWritableRule from "../rules/prefer-ts-extras-as-writable.js";
import preferTsExtrasAssertDefinedRule from "../rules/prefer-ts-extras-assert-defined.js";
import preferTsExtrasAssertErrorRule from "../rules/prefer-ts-extras-assert-error.js";
import preferTsExtrasAssertPresentRule from "../rules/prefer-ts-extras-assert-present.js";
import preferTsExtrasIsDefinedFilterRule from "../rules/prefer-ts-extras-is-defined-filter.js";
import preferTsExtrasIsDefinedRule from "../rules/prefer-ts-extras-is-defined.js";
import preferTsExtrasIsEmptyRule from "../rules/prefer-ts-extras-is-empty.js";
import preferTsExtrasIsEqualTypeRule from "../rules/prefer-ts-extras-is-equal-type.js";
import preferTsExtrasIsFiniteRule from "../rules/prefer-ts-extras-is-finite.js";
import preferTsExtrasIsInfiniteRule from "../rules/prefer-ts-extras-is-infinite.js";
import preferTsExtrasIsIntegerRule from "../rules/prefer-ts-extras-is-integer.js";
import preferTsExtrasIsPresentFilterRule from "../rules/prefer-ts-extras-is-present-filter.js";
import preferTsExtrasIsPresentRule from "../rules/prefer-ts-extras-is-present.js";
import preferTsExtrasIsSafeIntegerRule from "../rules/prefer-ts-extras-is-safe-integer.js";
import preferTsExtrasKeyInRule from "../rules/prefer-ts-extras-key-in.js";
import preferTsExtrasNotRule from "../rules/prefer-ts-extras-not.js";
import preferTsExtrasObjectEntriesRule from "../rules/prefer-ts-extras-object-entries.js";
import preferTsExtrasObjectFromEntriesRule from "../rules/prefer-ts-extras-object-from-entries.js";
import preferTsExtrasObjectHasInRule from "../rules/prefer-ts-extras-object-has-in.js";
import preferTsExtrasObjectHasOwnRule from "../rules/prefer-ts-extras-object-has-own.js";
import preferTsExtrasObjectKeysRule from "../rules/prefer-ts-extras-object-keys.js";
import preferTsExtrasObjectMapValuesRule from "../rules/prefer-ts-extras-object-map-values.js";
import preferTsExtrasObjectValuesRule from "../rules/prefer-ts-extras-object-values.js";
import preferTsExtrasSafeCastToRule from "../rules/prefer-ts-extras-safe-cast-to.js";
import preferTsExtrasSetHasRule from "../rules/prefer-ts-extras-set-has.js";
import preferTsExtrasStringSplitRule from "../rules/prefer-ts-extras-string-split.js";
import preferTypeFestAbstractConstructorRule from "../rules/prefer-type-fest-abstract-constructor.js";
import preferTypeFestAndAllRule from "../rules/prefer-type-fest-and-all.js";
import preferTypeFestArrayLengthRule from "../rules/prefer-type-fest-array-length.js";
import preferTypeFestArrayableRule from "../rules/prefer-type-fest-arrayable.js";
import preferTypeFestAsyncReturnTypeRule from "../rules/prefer-type-fest-async-return-type.js";
import preferTypeFestAsyncifyRule from "../rules/prefer-type-fest-asyncify.js";
import preferTypeFestConditionalExceptRule from "../rules/prefer-type-fest-conditional-except.js";
import preferTypeFestConditionalKeysRule from "../rules/prefer-type-fest-conditional-keys.js";
import preferTypeFestConditionalPickDeepRule from "../rules/prefer-type-fest-conditional-pick-deep.js";
import preferTypeFestConditionalPickRule from "../rules/prefer-type-fest-conditional-pick.js";
import preferTypeFestConstructorRule from "../rules/prefer-type-fest-constructor.js";
import preferTypeFestDistributedOmitRule from "../rules/prefer-type-fest-distributed-omit.js";
import preferTypeFestDistributedPickRule from "../rules/prefer-type-fest-distributed-pick.js";
import preferTypeFestExceptRule from "../rules/prefer-type-fest-except.js";
import preferTypeFestIfRule from "../rules/prefer-type-fest-if.js";
import preferTypeFestIterableElementRule from "../rules/prefer-type-fest-iterable-element.js";
import preferTypeFestJsonArrayRule from "../rules/prefer-type-fest-json-array.js";
import preferTypeFestJsonObjectRule from "../rules/prefer-type-fest-json-object.js";
import preferTypeFestJsonPrimitiveRule from "../rules/prefer-type-fest-json-primitive.js";
import preferTypeFestJsonValueRule from "../rules/prefer-type-fest-json-value.js";
import preferTypeFestKeysOfUnionRule from "../rules/prefer-type-fest-keys-of-union.js";
import preferTypeFestLessThanOrEqualRule from "../rules/prefer-type-fest-less-than-or-equal.js";
import preferTypeFestLessThanRule from "../rules/prefer-type-fest-less-than.js";
import preferTypeFestLiteralUnionRule from "../rules/prefer-type-fest-literal-union.js";
import preferTypeFestMergeExclusiveRule from "../rules/prefer-type-fest-merge-exclusive.js";
import preferTypeFestMergeRule from "../rules/prefer-type-fest-merge.js";
import preferTypeFestNonEmptyTupleRule from "../rules/prefer-type-fest-non-empty-tuple.js";
import preferTypeFestOmitIndexSignatureRule from "../rules/prefer-type-fest-omit-index-signature.js";
import preferTypeFestOptionalRule from "../rules/prefer-type-fest-optional.js";
import preferTypeFestOrAllRule from "../rules/prefer-type-fest-or-all.js";
import preferTypeFestPartialDeepRule from "../rules/prefer-type-fest-partial-deep.js";
import preferTypeFestPickIndexSignatureRule from "../rules/prefer-type-fest-pick-index-signature.js";
import preferTypeFestPrimitiveRule from "../rules/prefer-type-fest-primitive.js";
import preferTypeFestPromisableRule from "../rules/prefer-type-fest-promisable.js";
import preferTypeFestReadonlyDeepRule from "../rules/prefer-type-fest-readonly-deep.js";
import preferTypeFestRequireAllOrNoneRule from "../rules/prefer-type-fest-require-all-or-none.js";
import preferTypeFestRequireAtLeastOneRule from "../rules/prefer-type-fest-require-at-least-one.js";
import preferTypeFestRequireExactlyOneRule from "../rules/prefer-type-fest-require-exactly-one.js";
import preferTypeFestRequireOneOrNoneRule from "../rules/prefer-type-fest-require-one-or-none.js";
import preferTypeFestRequiredDeepRule from "../rules/prefer-type-fest-required-deep.js";
import preferTypeFestSchemaRule from "../rules/prefer-type-fest-schema.js";
import preferTypeFestSetNonNullableRule from "../rules/prefer-type-fest-set-non-nullable.js";
import preferTypeFestSetOptionalRule from "../rules/prefer-type-fest-set-optional.js";
import preferTypeFestSetReadonlyRule from "../rules/prefer-type-fest-set-readonly.js";
import preferTypeFestSetRequiredRule from "../rules/prefer-type-fest-set-required.js";
import preferTypeFestSetReturnTypeRule from "../rules/prefer-type-fest-set-return-type.js";
import preferTypeFestSimplifyRule from "../rules/prefer-type-fest-simplify.js";
import preferTypeFestStringifiedRule from "../rules/prefer-type-fest-stringified.js";
import preferTypeFestTaggedBrandsRule from "../rules/prefer-type-fest-tagged-brands.js";
import preferTypeFestTupleOfRule from "../rules/prefer-type-fest-tuple-of.js";
import preferTypeFestUnionMemberRule from "../rules/prefer-type-fest-union-member.js";
import preferTypeFestUnionToIntersectionRule from "../rules/prefer-type-fest-union-to-intersection.js";
import preferTypeFestUnionToTupleRule from "../rules/prefer-type-fest-union-to-tuple.js";
import preferTypeFestUnknownArrayRule from "../rules/prefer-type-fest-unknown-array.js";
import preferTypeFestUnknownMapRule from "../rules/prefer-type-fest-unknown-map.js";
import preferTypeFestUnknownRecordRule from "../rules/prefer-type-fest-unknown-record.js";
import preferTypeFestUnknownSetRule from "../rules/prefer-type-fest-unknown-set.js";
import preferTypeFestUnwrapTaggedRule from "../rules/prefer-type-fest-unwrap-tagged.js";
import preferTypeFestValueOfRule from "../rules/prefer-type-fest-value-of.js";
import preferTypeFestWritableDeepRule from "../rules/prefer-type-fest-writable-deep.js";
import preferTypeFestWritableRule from "../rules/prefer-type-fest-writable.js";

/** Runtime rule module shape used by registry/preset builders. */
export type RuleWithDocs = TSESLint.RuleModule<string, UnknownArray>;

/** Pattern for unqualified rule names supported by `eslint-plugin-typefest`. */
export type TypefestRuleNamePattern = `prefer-${string}`;

/**
 * Runtime map of all rule modules keyed by unqualified rule name.
 */
const typefestRuleRegistry: Readonly<
    Record<TypefestRuleNamePattern, RuleWithDocs>
> = {
    "prefer-ts-extras-array-at": preferTsExtrasArrayAtRule,
    "prefer-ts-extras-array-concat": preferTsExtrasArrayConcatRule,
    "prefer-ts-extras-array-find": preferTsExtrasArrayFindRule,
    "prefer-ts-extras-array-find-last": preferTsExtrasArrayFindLastRule,
    "prefer-ts-extras-array-find-last-index":
        preferTsExtrasArrayFindLastIndexRule,
    "prefer-ts-extras-array-first": preferTsExtrasArrayFirstRule,
    "prefer-ts-extras-array-includes": preferTsExtrasArrayIncludesRule,
    "prefer-ts-extras-array-join": preferTsExtrasArrayJoinRule,
    "prefer-ts-extras-array-last": preferTsExtrasArrayLastRule,
    "prefer-ts-extras-as-writable": preferTsExtrasAsWritableRule,
    "prefer-ts-extras-assert-defined": preferTsExtrasAssertDefinedRule,
    "prefer-ts-extras-assert-error": preferTsExtrasAssertErrorRule,
    "prefer-ts-extras-assert-present": preferTsExtrasAssertPresentRule,
    "prefer-ts-extras-is-defined": preferTsExtrasIsDefinedRule,
    "prefer-ts-extras-is-defined-filter": preferTsExtrasIsDefinedFilterRule,
    "prefer-ts-extras-is-empty": preferTsExtrasIsEmptyRule,
    "prefer-ts-extras-is-equal-type": preferTsExtrasIsEqualTypeRule,
    "prefer-ts-extras-is-finite": preferTsExtrasIsFiniteRule,
    "prefer-ts-extras-is-infinite": preferTsExtrasIsInfiniteRule,
    "prefer-ts-extras-is-integer": preferTsExtrasIsIntegerRule,
    "prefer-ts-extras-is-present": preferTsExtrasIsPresentRule,
    "prefer-ts-extras-is-present-filter": preferTsExtrasIsPresentFilterRule,
    "prefer-ts-extras-is-safe-integer": preferTsExtrasIsSafeIntegerRule,
    "prefer-ts-extras-key-in": preferTsExtrasKeyInRule,
    "prefer-ts-extras-not": preferTsExtrasNotRule,
    "prefer-ts-extras-object-entries": preferTsExtrasObjectEntriesRule,
    "prefer-ts-extras-object-from-entries": preferTsExtrasObjectFromEntriesRule,
    "prefer-ts-extras-object-has-in": preferTsExtrasObjectHasInRule,
    "prefer-ts-extras-object-has-own": preferTsExtrasObjectHasOwnRule,
    "prefer-ts-extras-object-keys": preferTsExtrasObjectKeysRule,
    "prefer-ts-extras-object-map-values": preferTsExtrasObjectMapValuesRule,
    "prefer-ts-extras-object-values": preferTsExtrasObjectValuesRule,
    "prefer-ts-extras-safe-cast-to": preferTsExtrasSafeCastToRule,
    "prefer-ts-extras-set-has": preferTsExtrasSetHasRule,
    "prefer-ts-extras-string-split": preferTsExtrasStringSplitRule,
    "prefer-type-fest-abstract-constructor":
        preferTypeFestAbstractConstructorRule,
    "prefer-type-fest-and-all": preferTypeFestAndAllRule,
    "prefer-type-fest-array-length": preferTypeFestArrayLengthRule,
    "prefer-type-fest-arrayable": preferTypeFestArrayableRule,
    "prefer-type-fest-async-return-type": preferTypeFestAsyncReturnTypeRule,
    "prefer-type-fest-asyncify": preferTypeFestAsyncifyRule,
    "prefer-type-fest-conditional-except": preferTypeFestConditionalExceptRule,
    "prefer-type-fest-conditional-keys": preferTypeFestConditionalKeysRule,
    "prefer-type-fest-conditional-pick": preferTypeFestConditionalPickRule,
    "prefer-type-fest-conditional-pick-deep":
        preferTypeFestConditionalPickDeepRule,
    "prefer-type-fest-constructor": preferTypeFestConstructorRule,
    "prefer-type-fest-distributed-omit": preferTypeFestDistributedOmitRule,
    "prefer-type-fest-distributed-pick": preferTypeFestDistributedPickRule,
    "prefer-type-fest-except": preferTypeFestExceptRule,
    "prefer-type-fest-if": preferTypeFestIfRule,
    "prefer-type-fest-iterable-element": preferTypeFestIterableElementRule,
    "prefer-type-fest-json-array": preferTypeFestJsonArrayRule,
    "prefer-type-fest-json-object": preferTypeFestJsonObjectRule,
    "prefer-type-fest-json-primitive": preferTypeFestJsonPrimitiveRule,
    "prefer-type-fest-json-value": preferTypeFestJsonValueRule,
    "prefer-type-fest-keys-of-union": preferTypeFestKeysOfUnionRule,
    "prefer-type-fest-less-than": preferTypeFestLessThanRule,
    "prefer-type-fest-less-than-or-equal": preferTypeFestLessThanOrEqualRule,
    "prefer-type-fest-literal-union": preferTypeFestLiteralUnionRule,
    "prefer-type-fest-merge": preferTypeFestMergeRule,
    "prefer-type-fest-merge-exclusive": preferTypeFestMergeExclusiveRule,
    "prefer-type-fest-non-empty-tuple": preferTypeFestNonEmptyTupleRule,
    "prefer-type-fest-omit-index-signature":
        preferTypeFestOmitIndexSignatureRule,
    "prefer-type-fest-optional": preferTypeFestOptionalRule,
    "prefer-type-fest-or-all": preferTypeFestOrAllRule,
    "prefer-type-fest-partial-deep": preferTypeFestPartialDeepRule,
    "prefer-type-fest-pick-index-signature":
        preferTypeFestPickIndexSignatureRule,
    "prefer-type-fest-primitive": preferTypeFestPrimitiveRule,
    "prefer-type-fest-promisable": preferTypeFestPromisableRule,
    "prefer-type-fest-readonly-deep": preferTypeFestReadonlyDeepRule,
    "prefer-type-fest-require-all-or-none": preferTypeFestRequireAllOrNoneRule,
    "prefer-type-fest-require-at-least-one":
        preferTypeFestRequireAtLeastOneRule,
    "prefer-type-fest-require-exactly-one": preferTypeFestRequireExactlyOneRule,
    "prefer-type-fest-require-one-or-none": preferTypeFestRequireOneOrNoneRule,
    "prefer-type-fest-required-deep": preferTypeFestRequiredDeepRule,
    "prefer-type-fest-schema": preferTypeFestSchemaRule,
    "prefer-type-fest-set-non-nullable": preferTypeFestSetNonNullableRule,
    "prefer-type-fest-set-optional": preferTypeFestSetOptionalRule,
    "prefer-type-fest-set-readonly": preferTypeFestSetReadonlyRule,
    "prefer-type-fest-set-required": preferTypeFestSetRequiredRule,
    "prefer-type-fest-set-return-type": preferTypeFestSetReturnTypeRule,
    "prefer-type-fest-simplify": preferTypeFestSimplifyRule,
    "prefer-type-fest-stringified": preferTypeFestStringifiedRule,
    "prefer-type-fest-tagged-brands": preferTypeFestTaggedBrandsRule,
    "prefer-type-fest-tuple-of": preferTypeFestTupleOfRule,
    "prefer-type-fest-union-member": preferTypeFestUnionMemberRule,
    "prefer-type-fest-union-to-intersection":
        preferTypeFestUnionToIntersectionRule,
    "prefer-type-fest-union-to-tuple": preferTypeFestUnionToTupleRule,
    "prefer-type-fest-unknown-array": preferTypeFestUnknownArrayRule,
    "prefer-type-fest-unknown-map": preferTypeFestUnknownMapRule,
    "prefer-type-fest-unknown-record": preferTypeFestUnknownRecordRule,
    "prefer-type-fest-unknown-set": preferTypeFestUnknownSetRule,
    "prefer-type-fest-unwrap-tagged": preferTypeFestUnwrapTaggedRule,
    "prefer-type-fest-value-of": preferTypeFestValueOfRule,
    "prefer-type-fest-writable": preferTypeFestWritableRule,
    "prefer-type-fest-writable-deep": preferTypeFestWritableDeepRule,
};

/** Exported typed view consumed by the plugin entrypoint. */
export const typefestRules: Readonly<
    Record<TypefestRuleNamePattern, RuleWithDocs>
> = typefestRuleRegistry;

export default typefestRules;
