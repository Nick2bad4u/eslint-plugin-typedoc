/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-type-fest-promisable` tests.
 */

export const validFixtureName = "prefer-type-fest-promisable.valid.ts";
export const invalidFixtureName = "prefer-type-fest-promisable.invalid.ts";

const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-type-fest-promisable fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

export const inlineFixableInvalidCode: string = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");

export const inlineFixableOutputCode: string = replaceOrThrow({
    replacement: "type JobResult = Promisable<string>;",
    sourceText: inlineFixableInvalidCode,
    target: "type JobResult = MaybePromise<string>;",
});

export const inlineInvalidWithoutFixCode: string = [
    'import type { MaybePromise } from "type-aliases";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");

export const inlineInvalidWithoutFixOutputCode: string = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = Promisable<string>;",
].join("\n");

export const promiseFirstInvalidCode =
    "type Result = Promise<string> | string;";
export const promiseSecondInvalidCode =
    "type Result = string | Promise<string>;";
export const promiseLikeValidCode =
    "type Result = PromiseLike<string> | string;";
export const promiseNoTypeArgumentsValidCode =
    "type Result = Promise | string;";
export const promiseNullValidCode = "type Result = Promise<string> | null;";
export const promiseUndefinedUnionValidCode =
    "type Result = Promise<string> | undefined;";
export const promiseUndefinedValidCode =
    "type Result = PromiseLike<string> | undefined;";
export const promiseNeverValidCode = "type Result = Promise<string> | never;";
export const promiseNullInnerMatchValidCode =
    "type Result = Promise<null> | null;";
export const promiseUndefinedInnerMatchValidCode =
    "type Result = Promise<undefined> | undefined;";
export const promiseNeverInnerMatchValidCode =
    "type Result = Promise<never> | never;";
export const doublePromiseUnionValidCode =
    "type Result = Promise<string> | Promise<string>;";
export const promiseMismatchValidCode =
    "type Result = Promise<string> | number;";
export const promiseThreeMemberUnionValidCode =
    "type Result = Promise<string> | number | string;";
export const promiseThreeMemberLeadingPairValidCode =
    "type Result = Promise<string> | string | boolean;";
export const promiseThreeMemberLeadingReversePairValidCode =
    "type Result = string | Promise<string> | boolean;";
export const promiseFourMemberLeadingPairValidCode =
    "type Result = Promise<string> | string | boolean | number;";
export const promiseFourMemberLeadingReversePairValidCode =
    "type Result = string | Promise<string> | boolean | number;";
export const nullFirstPromiseSecondValidCode =
    "type Result = null | Promise<string>;";
export const undefinedFirstPromiseSecondValidCode =
    "type Result = undefined | Promise<string>;";
export const neverFirstPromiseSecondValidCode =
    "type Result = never | Promise<string>;";

export const alreadyPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<string> | Promisable<string>;",
].join("\n");

export const nestedPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string>;",
].join("\n");

export const reverseNestedPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promisable<string> | Promise<Promisable<string>>;",
].join("\n");

export const threeMemberPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string> | boolean;",
].join("\n");

export const qualifiedPromiseValidCode =
    "type Result = globalThis.Promise<string> | string;";

export const customWrapperValidCode: string = [
    "type MaybePromise<T> = Promise<T>;",
    "type Result = MaybePromise<string> | string;",
].join("\n");

export type PromisableValidRuleTesterCase = Readonly<{
    code: string;
    name: string;
}>;

export const additionalValidRuleTesterCases: readonly PromisableValidRuleTesterCase[] =
    [
        {
            code: promiseNoTypeArgumentsValidCode,
            name: "ignores Promise without explicit type arguments",
        },
        {
            code: qualifiedPromiseValidCode,
            name: "ignores globalThis.Promise union",
        },
        {
            code: customWrapperValidCode,
            name: "ignores custom Promise wrapper alias",
        },
        {
            code: promiseLikeValidCode,
            name: "ignores PromiseLike union",
        },
        {
            code: promiseNullValidCode,
            name: "ignores Promise union with null",
        },
        {
            code: promiseUndefinedValidCode,
            name: "ignores PromiseLike union with undefined",
        },
        {
            code: promiseUndefinedUnionValidCode,
            name: "ignores Promise union with undefined",
        },
        {
            code: promiseNeverValidCode,
            name: "ignores Promise union with never",
        },
        {
            code: promiseNullInnerMatchValidCode,
            name: "ignores Promise<null> union with matching null member",
        },
        {
            code: promiseUndefinedInnerMatchValidCode,
            name: "ignores Promise<undefined> union with matching undefined member",
        },
        {
            code: promiseNeverInnerMatchValidCode,
            name: "ignores Promise<never> union with matching never member",
        },
        {
            code: doublePromiseUnionValidCode,
            name: "ignores union containing only Promise members",
        },
        {
            code: promiseMismatchValidCode,
            name: "ignores Promise union with mismatched non-base type",
        },
        {
            code: promiseThreeMemberUnionValidCode,
            name: "ignores union containing more than Promise and base pair",
        },
        {
            code: promiseThreeMemberLeadingPairValidCode,
            name: "ignores three-member union even when first two members form a Promise pair",
        },
        {
            code: promiseThreeMemberLeadingReversePairValidCode,
            name: "ignores three-member union even when first two members form a reverse Promise pair",
        },
        {
            code: promiseFourMemberLeadingPairValidCode,
            name: "ignores four-member union even when first two members form a Promise pair",
        },
        {
            code: promiseFourMemberLeadingReversePairValidCode,
            name: "ignores four-member union even when first two members form a reverse Promise pair",
        },
        {
            code: nullFirstPromiseSecondValidCode,
            name: "ignores null-first union with Promise second",
        },
        {
            code: undefinedFirstPromiseSecondValidCode,
            name: "ignores undefined-first union with Promise second",
        },
        {
            code: neverFirstPromiseSecondValidCode,
            name: "ignores never-first union with Promise second",
        },
        {
            code: alreadyPromisableUnionValidCode,
            name: "ignores union already using Promisable",
        },
        {
            code: nestedPromisableUnionValidCode,
            name: "ignores union where Promise inner type is already Promisable",
        },
        {
            code: reverseNestedPromisableUnionValidCode,
            name: "ignores reverse-order union where Promise inner type is already Promisable",
        },
        {
            code: threeMemberPromisableUnionValidCode,
            name: "ignores multi-member union that already contains Promisable",
        },
    ];
