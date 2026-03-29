/**
 * @packageDocumentation
 * Shared fixture and inline case source for `prefer-ts-extras-is-present-filter` tests.
 */

import { readTypedFixture } from "./typed-rule-tester";

export const invalidFixtureName =
    "prefer-ts-extras-is-present-filter.invalid.ts";
export const validFixtureName = "prefer-ts-extras-is-present-filter.valid.ts";
export const invalidFixtureCode: string = readTypedFixture(invalidFixtureName);

export const inlineInvalidPredicateUndefinedStrictCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidTypeofUndefinedGuardCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    '    (value): value is string => value !== null && typeof value !== "undefined"',
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidTypeofUndefinedGuardOutput: string = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    isPresent",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidReverseNullLooseCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => null != value);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidReverseNullLooseOutput: string = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(isPresent);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidReverseUndefinedLooseCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => undefined != value);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidReverseUndefinedLooseOutput: string = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(isPresent);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidStrictNullWithoutPredicateCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => value !== null);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidStrictUndefinedWithoutPredicateCode: string = [
    "declare const values: readonly (string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => value !== undefined);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidAndWithoutUndefinedCheckCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => value !== null && value !== '');",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidLogicalOrNullishGuardCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null || value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidAndThreeTermNullishGuardCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const includeValue: boolean;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string =>",
    "        value !== null && value !== undefined && includeValue",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidAndNonParameterNullComparisonCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const otherValue: null | string;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => otherValue !== null && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidAndNonParameterUndefinedComparisonCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const maybeValue: string | undefined;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null && maybeValue !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidAndNonNullLiteralComparisonCode: string = [
    "declare const values: readonly (number | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is number => value !== 0 && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidAndUndefinedAliasComparisonCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const undefinedAlias: undefined;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null && value !== undefinedAlias",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidReverseNonUndefinedIdentifierComparisonCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const marker: string;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => marker != value",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidFilterBlockBodyCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => {",
    "    return value != null;",
    "});",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidFunctionExpressionCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter(function (value) {",
    "    return value != null;",
    "});",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidComputedFilterCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    'const presentValues = values["filter"]((value) => value != null);',
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidOptionalChainFilterCode: string = [
    "declare const values: readonly (null | string)[] | undefined;",
    "",
    "const presentValues = values?.filter((value) => value != null);",
    "",
    "String(presentValues);",
].join("\n");

export const inlineValidNoCallbackCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter();",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidDestructuredParameterCode: string = [
    "declare const values: readonly ({ readonly value: null | string })[];",
    "",
    "const presentValues = values.filter(({ value }) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidSecondCallbackParameterCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value, _index) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidMapCallbackCode: string = [
    "declare const values: readonly (null | string)[];",
    "",
    "const mapped = values.map((value) => value != null);",
    "",
    "String(mapped.length);",
].join("\n");

export const inlineFixableCode: string = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineFixableOutput: string = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(isPresent);",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidMixedNullishOperatorCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value != null && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidReversedTypeofUndefinedCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    '    (value): value is string => value !== null && "undefined" !== typeof value',
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineInvalidReversedTypeofUndefinedOutput: string = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    isPresent",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidUnsupportedNullishOperatorCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value === null",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const inlineValidShadowedUndefinedBindingCode: string = [
    "declare const values: readonly (null | string | undefined)[];",
    "const undefined = Symbol('undefined');",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

export const fixtureInvalidOutput: string = [
    "interface MonitorRecord {",
    "    readonly id: string;",
    "}",
    "",
    "declare const nullableEntries: readonly (MonitorRecord | null)[];",
    "declare const nullableMonitors: readonly (MonitorRecord | null | undefined)[];",
    "declare const maybeNumbers: readonly (null | number | undefined)[];",
    "",
    "const entries = nullableEntries.filter(",
    "    (entry): entry is MonitorRecord => entry !== null",
    ");",
    "const monitors = nullableMonitors.filter(",
    "    isPresent",
    ");",
    "const numbers = maybeNumbers.filter((value) => value != undefined);",
    "",
    "if (entries.length + monitors.length + numbers.length < 0) {",
    '    throw new TypeError("Unreachable total count");',
    "}",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");

const buildFixtureInvalidOutputWithMixedLineEndings = (): string =>
    `import { isPresent } from "ts-extras";\n${fixtureInvalidOutput}\r\n`;

export const fixtureInvalidOutputWithMixedLineEndings: string =
    buildFixtureInvalidOutputWithMixedLineEndings();

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
            `Expected prefer-ts-extras-is-present-filter fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

export const fixtureInvalidSecondPassOutputWithMixedLineEndings: string =
    replaceOrThrow({
        replacement: "const numbers = maybeNumbers.filter(isPresent);\r\n",
        sourceText: fixtureInvalidOutputWithMixedLineEndings,
        target: "const numbers = maybeNumbers.filter((value) => value != undefined);\r\n",
    });
