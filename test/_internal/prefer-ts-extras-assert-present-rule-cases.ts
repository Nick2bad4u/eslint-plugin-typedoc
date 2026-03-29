/**
 * @packageDocumentation
 * Shared RuleTester case collections for `prefer-ts-extras-assert-present`.
 */

import type { UnknownArray } from "type-fest";

import {
    alternateBranchValidCode,
    binaryEqAgainstZeroValidCode,
    binaryEqWithoutNullValidCode,
    emptyConsequentValidCode,
    inlineAutofixableCanonicalBacktickEnvelopeCode,
    inlineAutofixableCanonicalCode,
    inlineAutofixableCanonicalOutput,
    inlineAutofixableCanonicalUnicodeRichCode,
    inlineAutofixableCanonicalUnicodeRichOutput,
    inlineAutofixableDirectThrowCanonicalCode,
    inlineInvalidEqNullCode,
    inlineInvalidLogicalCode,
    inlineInvalidLogicalReversedCode,
    inlineInvalidNullableSuggestionOutputCode,
    inlineInvalidNullableSuggestionOutputWithImportGapCode,
    inlineInvalidNullishSuggestionOutputCode,
    inlineSuggestableCode,
    inlineSuggestableMixedEqStrictCode,
    inlineSuggestableOutput,
    inlineSuggestableSpreadArgumentCode,
    inlineSuggestableSpreadArgumentOutput,
    inlineSuggestableTemplateWrongExpressionCode,
    inlineSuggestableTemplateWrongExpressionOutput,
    inlineSuggestableTemplateWrongPrefixCode,
    inlineSuggestableTemplateWrongSuffixCode,
    invalidDirectThrowConsequentCode,
    invalidFixtureCode,
    invalidFixtureName,
    invalidNullOnLeftEqGuardCode,
    logicalAndNullishValidCode,
    logicalWithNonBinaryTermValidCode,
    mismatchedLogicalExpressionValidCode,
    multiStatementThrowBlockValidCode,
    nonEqualityTestValidCode,
    nonNullishLogicalValidCode,
    nonThrowConsequentValidCode,
    sameKindLogicalValidCode,
    shadowedTypeErrorSuggestableCode,
    shadowedTypeErrorSuggestableOutput,
    shadowedUndefinedBindingValidCode,
    validFixtureCode,
    validFixtureName,
} from "./prefer-ts-extras-assert-present-cases";

export const createAssertPresentRuleTesterCases = ({
    typedFixturePath,
}: Readonly<{
    typedFixturePath: (fixtureName: string) => string;
}>): {
    invalid: Readonly<UnknownArray>;
    valid: Readonly<UnknownArray>;
} => ({
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                },
                {
                    messageId: "preferTsExtrasAssertPresent",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture nullish guard patterns",
        },
        {
            code: inlineInvalidEqNullCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose null comparison guard",
        },
        {
            code: inlineInvalidLogicalCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullishSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict null-or-undefined logical guard",
        },
        {
            code: inlineInvalidLogicalReversedCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullishSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict logical guard with reversed operands",
        },
        {
            code: invalidNullOnLeftEqGuardCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose null guard with literal on left",
        },
        {
            code: invalidDirectThrowConsequentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct-throw loose null guard",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests assertPresent() replacement when import is in scope",
        },
        {
            code: inlineSuggestableMixedEqStrictCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed loose/strict nullish logical guards",
        },
        {
            code: shadowedTypeErrorSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: shadowedTypeErrorSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError constructor is shadowed",
        },
        {
            code: inlineSuggestableTemplateWrongPrefixCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement for throw with non-canonical template prefix",
        },
        {
            code: inlineSuggestableTemplateWrongSuffixCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement for throw with non-canonical template suffix",
        },
        {
            code: inlineSuggestableTemplateWrongExpressionCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineSuggestableTemplateWrongExpressionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when template expression differs from guard subject",
        },
        {
            code: inlineSuggestableSpreadArgumentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineSuggestableSpreadArgumentOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError call spreads message arguments",
        },
        {
            code: inlineAutofixableCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical nullish guard throw when assertPresent import is in scope",
            output: inlineAutofixableCanonicalOutput,
        },
        {
            code: inlineAutofixableCanonicalBacktickEnvelopeCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests canonical throw with backtick-wrapped placeholder text",
        },
        {
            code: inlineAutofixableDirectThrowCanonicalCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertPresent",
                            output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests direct canonical throw guard",
        },
        {
            code: inlineAutofixableCanonicalUnicodeRichCode,
            errors: [{ messageId: "preferTsExtrasAssertPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical nullish guard in unicode-rich source text",
            output: inlineAutofixableCanonicalUnicodeRichOutput,
        },
    ],
    valid: [
        {
            code: validFixtureCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonThrowConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard with non-throw consequent",
        },
        {
            code: multiStatementThrowBlockValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores throw block with additional statement",
        },
        {
            code: sameKindLogicalValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores repeated null comparison kind",
        },
        {
            code: alternateBranchValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard with explicit else branch",
        },
        {
            code: mismatchedLogicalExpressionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mismatched logical nullish subjects",
        },
        {
            code: nonNullishLogicalValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-nullish logical comparisons",
        },
        {
            code: nonEqualityTestValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-equality guard expression",
        },
        {
            code: emptyConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores nullish guard with an empty consequent",
        },
        {
            code: binaryEqWithoutNullValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores equality check that omits nullish literals",
        },
        {
            code: binaryEqAgainstZeroValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores loose equality checks against non-null literals",
        },
        {
            code: logicalWithNonBinaryTermValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores logical guard containing non-binary term",
        },
        {
            code: logicalAndNullishValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores logical-and nullish guards",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores nullish guards that compare against shadowed undefined bindings",
        },
    ],
});
