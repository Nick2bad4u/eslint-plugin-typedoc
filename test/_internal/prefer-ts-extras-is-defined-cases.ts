/**
 * @packageDocumentation
 * Shared code fixtures and inline cases for `prefer-ts-extras-is-defined` tests.
 */

import { readTypedFixture } from "./typed-rule-tester";

export const validFixtureName = "prefer-ts-extras-is-defined.valid.ts";
export const invalidFixtureName = "prefer-ts-extras-is-defined.invalid.ts";

const readInvalidFixtureCode = (): string =>
    readTypedFixture(invalidFixtureName);

export const invalidFixtureCode: string = readInvalidFixtureCode();

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
            `Expected prefer-ts-extras-is-defined fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const buildFixtureInvalidOutput = (): string =>
    `import { isDefined } from "ts-extras";\n${invalidFixtureCode}`;

export const fixtureInvalidOutput: string = buildFixtureInvalidOutput();

export const fixtureInvalidSecondPassOutput: string = replaceOrThrow({
    replacement: "if (!isDefined(maybeValue)) {\r\n",
    sourceText: replaceOrThrow({
        replacement: "if (!isDefined(maybeValue)) {\r\n",
        sourceText: replaceOrThrow({
            replacement: "if (isDefined(maybeValue)) {\r\n",
            sourceText: replaceOrThrow({
                replacement: "if (isDefined(maybeValue)) {\r\n",
                sourceText: replaceOrThrow({
                    replacement: "if (isDefined(maybeValue)) {\r\n",
                    sourceText: fixtureInvalidOutput,
                    target: "if (maybeValue !== undefined) {\r\n",
                }),
                target: "if (undefined !== maybeValue) {\r\n",
            }),
            target: 'if (typeof maybeValue !== "undefined") {\r\n',
        }),
        target: "if (maybeValue === undefined) {\r\n",
    }),
    target: 'if ("undefined" === typeof maybeValue) {\r\n',
});

export const inlineFixableDefinedCode: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = maybeValue !== undefined;",
].join("\n");

export const inlineFixableDefinedOutput: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");

export const inlineFixableNegatedCode: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = maybeValue === undefined;",
].join("\n");

export const inlineFixableNegatedOutput: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = !isDefined(maybeValue);",
].join("\n");

export const inlineAstNodeNegatedInvalidCode: string = [
    'import type { TSESTree } from "@typescript-eslint/utils";',
    'import { isDefined } from "ts-extras";',
    "",
    "const memberExpressionWithParent = {} as Readonly<TSESTree.MemberExpression> & {",
    "    parent?: Readonly<TSESTree.Node>;",
    "};",
    "const parentNode = memberExpressionWithParent.parent;",
    "const parentIsMissing = parentNode === undefined;",
    "String(parentIsMissing);",
].join("\n");

export const inlineMapCallbackInvalidCode: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const values: Array<string | undefined>;",
    "const mapped = values.map((value) => value !== undefined);",
    "String(mapped.length);",
].join("\n");

export const inlineMapCallbackInvalidOutput: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const values: Array<string | undefined>;",
    "const mapped = values.map((value) => isDefined(value));",
    "String(mapped.length);",
].join("\n");

export const inlineTypeofReverseInvalidCode: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = "undefined" !== typeof maybeValue;',
].join("\n");

export const inlineTypeofReverseInvalidOutput: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");

export const inlineTypeofNonIdentifierInvalidCode: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = typeof (maybeValue ?? "fallback") !== "undefined";',
].join("\n");

export const inlineTypeofNonIdentifierInvalidOutput: string = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = isDefined(maybeValue ?? "fallback");',
].join("\n");

export const filterArrowCallbackValidCode: string = [
    "declare const values: Array<string | undefined>;",
    "const onlyDefined = values.filter((value) => value !== undefined);",
    "String(onlyDefined.length);",
].join("\n");

export const filterFunctionCallbackValidCode: string = [
    "declare const values: Array<string | undefined>;",
    "const onlyDefined = values.filter(function (value) {",
    "    return value !== undefined;",
    "});",
    "String(onlyDefined.length);",
].join("\n");

export const typeofWithNonTypeofOperatorValidCode: string = [
    "declare const maybeValue: string | undefined;",
    'const hasValue = void maybeValue !== "undefined";',
    "String(hasValue);",
].join("\n");

export const reversedTypeofWithNonTypeofOperatorValidCode: string = [
    "declare const maybeValue: string | undefined;",
    'const hasValue = "undefined" !== void maybeValue;',
    "String(hasValue);",
].join("\n");

export const shadowedUndefinedBindingValidCode: string = [
    "declare const maybeValue: string | undefined;",
    "const undefined = Symbol('undefined');",
    "const hasValue = maybeValue !== undefined;",
    "String(hasValue);",
].join("\n");

export const looseUndefinedInequalityValidCode: string = [
    "declare const maybeValue: string | null | undefined;",
    "const hasValue = maybeValue != undefined;",
    "String(hasValue);",
].join("\n");

export const looseUndefinedEqualityValidCode: string = [
    "declare const maybeValue: string | null | undefined;",
    "const isMissing = maybeValue == undefined;",
    "String(isMissing);",
].join("\n");

export const undeclaredTypeofInequalityValidCode: string = [
    'const hasValue = typeof maybeUndeclared !== "undefined";',
    "String(hasValue);",
].join("\n");

export const undeclaredTypeofEqualityValidCode: string = [
    'const isMissing = "undefined" === typeof maybeUndeclared;',
    "String(isMissing);",
].join("\n");
