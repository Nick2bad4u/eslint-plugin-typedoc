/**
 * @packageDocumentation
 * Shared code fixtures and inline cases for `prefer-ts-extras-assert-defined` tests.
 */

import { readTypedFixture } from "./typed-rule-tester";

export const invalidFixtureName = "prefer-ts-extras-assert-defined.invalid.ts";
export const validFixtureName = "prefer-ts-extras-assert-defined.valid.ts";

const readInvalidFixtureCode = (): string =>
    readTypedFixture(invalidFixtureName);
const readValidFixtureCode = (): string => readTypedFixture(validFixtureName);

export const invalidFixtureCode: string = readInvalidFixtureCode();
export const validFixtureCode: string = readValidFixtureCode();

export const undefinedOnLeftInvalidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (undefined === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const looseEqualityInvalidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value == undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineInvalidDirectThrowConsequentCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined)",
    "        throw new TypeError('Missing value');",
    "",
    "    return value;",
    "}",
].join("\n");

export const nonUndefinedValidCode: string = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const nonThrowOnlyValidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const nonThrowSingleStatementBlockValidCode: string = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === undefined) {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const throwThenSideEffectValidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const alternateValidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const nonBinaryGuardValidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    if (!value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const emptyConsequentValidCode: string = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === undefined);",
    "",
    "    return value;",
    "}",
].join("\n");

export const shadowedUndefinedBindingValidCode: string = [
    "function ensureValue(value: string | undefined): string {",
    "    const undefined = 'sentinel';",
    "",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableWrongConstructorCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new Error('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableTooManyArgsCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`', value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableSpreadArgumentCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "const messageParts = ['Expected a defined value, got `undefined`'];",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError(...messageParts);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableDirectThrowCanonicalCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) throw new TypeError('Expected a defined value, got `undefined`');",
    "",
    "    return value;",
    "}",
].join("\n");

export const shadowedTypeErrorSuggestableCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const shadowedTypeErrorSuggestableOutput: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableOutput: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineSuggestableSpreadArgumentOutput: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "const messageParts = ['Expected a defined value, got `undefined`'];",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalOutput: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");

export const inlineAutofixableCanonicalUnicodeRichCode: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | undefined): string {",
    "    if (候補値 === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");

export const inlineAutofixableCanonicalUnicodeRichOutput: string = [
    'import { assertDefined } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | undefined): string {",
    "    assertDefined(候補値);",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");

export const inlineInvalidSuggestionOutputCode: string = [
    'import { assertDefined } from "ts-extras";',
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
