/**
 * @packageDocumentation
 * Shared code fixtures and inline cases for `prefer-ts-extras-assert-present` tests.
 */

import { readTypedFixture } from "./typed-rule-tester";

export const validFixtureName = "prefer-ts-extras-assert-present.valid.ts";
export const invalidFixtureName = "prefer-ts-extras-assert-present.invalid.ts";

const readInvalidFixtureCode = (): string =>
    readTypedFixture(invalidFixtureName);
const readValidFixtureCode = (): string => readTypedFixture(validFixtureName);

export const invalidFixtureCode: string = readInvalidFixtureCode();
export const validFixtureCode: string = readValidFixtureCode();

export const inlineInvalidEqNullCode: string = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineInvalidLogicalCode: string = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineInvalidLogicalReversedCode: string = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (undefined === value || null === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const nonThrowConsequentValidCode: string = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value == null) {",
    "        return null;",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const multiStatementThrowBlockValidCode: string = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const sameKindLogicalValidCode: string = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value === null || value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const alternateBranchValidCode: string = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        return value;",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const mismatchedLogicalExpressionValidCode: string = [
    "function ensureValue(value: string | null | undefined, fallback: string | null | undefined): string {",
    "    if (value === null || fallback === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value ?? fallback ?? 'fallback';",
    "}",
].join("\n");

export const nonNullishLogicalValidCode: string = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === '' || value === 'missing') {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value ?? 'fallback';",
    "}",
].join("\n");

export const nonEqualityTestValidCode: string = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (!value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const emptyConsequentValidCode: string = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value == null);",
    "",
    "    return value;",
    "}",
].join("\n");

export const invalidNullOnLeftEqGuardCode: string = [
    "function ensureValue(value: string | null): string {",
    "    if (null == value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const invalidDirectThrowConsequentCode: string = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) throw new TypeError('Missing value');",
    "",
    "    return value;",
    "}",
].join("\n");

export const binaryEqWithoutNullValidCode: string = [
    "function ensureValue(value: string | null, fallback: string): string {",
    "    if (value == fallback) {",
    "        throw new TypeError('Unexpected equality');",
    "    }",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");

export const binaryEqAgainstZeroValidCode: string = [
    "function ensureValue(value: number | null): number | null {",
    "    if (value == 0) {",
    "        throw new TypeError('Unexpected zero');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const logicalWithNonBinaryTermValidCode: string = [
    "function ensureValue(value: string | null): string {",
    "    if (value === null || !value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const logicalAndNullishValidCode: string = [
    "function ensureValue(value: string | null | undefined): string | null | undefined {",
    "    if (value === null && value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const shadowedUndefinedBindingValidCode: string = [
    "function ensureValue(value: string | null | undefined): string {",
    "    const undefined = 'sentinel';",
    "",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableMixedEqStrictCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value == null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableOutput: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableTemplateWrongPrefixCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Unexpected value: \\u0024{value}`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableTemplateWrongSuffixCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Expected a present value, got \\u0024{value}!`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableTemplateWrongExpressionCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null, fallback: string): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Expected a present value, got \\u0024{fallback}`);",
    "    }",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");

export const inlineSuggestableSpreadArgumentCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "const messageParts = ['Expected a present value, got `value`'];",
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(...messageParts);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError(`Expected a present value, got " +
        "$" +
        "{value}`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalBacktickEnvelopeCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Expected a present value, got \\`\\u0024{value}\\``);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableDirectThrowCanonicalCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) throw new TypeError(`Expected a present value, got \\u0024{value}`);",
    "",
    "    return value;",
    "}",
].join("\n");

export const shadowedTypeErrorSuggestableCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError(`Expected a present value, got \\u0024{value}`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const shadowedTypeErrorSuggestableOutput: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalOutput: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalUnicodeRichCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | null | undefined): string {",
    "    if (候補値 === null || 候補値 === undefined) {",
    "        throw new TypeError(`Expected a present value, got " +
        "$" +
        "{候補値}`);",
    "    }",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");

export const inlineAutofixableCanonicalUnicodeRichOutput: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | null | undefined): string {",
    "    assertPresent(候補値);",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");

export const inlineSuggestableTemplateWrongExpressionOutput: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null, fallback: string): string {",
    "    assertPresent(value);",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");

export const inlineSuggestableSpreadArgumentOutput: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "const messageParts = ['Expected a present value, got `value`'];",
    "",
    "function ensureValue(value: string | null): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineInvalidNullableSuggestionOutputCode: string = [
    'import { assertPresent } from "ts-extras";',
    "function ensureValue(value: string | null): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineInvalidNullableSuggestionOutputWithImportGapCode: string = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineInvalidNullishSuggestionOutputCode: string = [
    'import { assertPresent } from "ts-extras";',
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");
