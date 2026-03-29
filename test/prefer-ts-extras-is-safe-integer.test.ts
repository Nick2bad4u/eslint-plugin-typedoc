/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-safe-integer.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-safe-integer");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-safe-integer.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-safe-integer.invalid.ts";
const inlineInvalidCode = "const result = Number.isSafeInteger(42);";
const computedAccessValidCode = "const result = Number['isSafeInteger'](42);";
const nonNumberReceiverValidCode = [
    "const helper = {",
    "    isSafeInteger(value: number): boolean {",
    "        return Number.isFinite(value);",
    "    },",
    "};",
    "const result = helper.isSafeInteger(42);",
].join("\n");
const wrongPropertyValidCode = "const result = Number.isInteger(42);";
const shadowedNumberBindingValidCode = [
    "const Number = {",
    "    isSafeInteger(value: number): boolean {",
    "        return Number.isFinite(value);",
    "    },",
    "    isFinite(value: number): boolean {",
    "        return value > 0;",
    "    },",
    "};",
    "const result = Number.isSafeInteger(42);",
].join("\n");
const inlineFixableCode = [
    'import { isSafeInteger } from "ts-extras";',
    "",
    "const result = Number.isSafeInteger(42);",
].join("\n");
const inlineFixableOutput = [
    'import { isSafeInteger } from "ts-extras";',
    "",
    "const result = isSafeInteger(42);",
].join("\n");
const inlineInvalidOutputCode = [
    'import { isSafeInteger } from "ts-extras";',
    "const result = isSafeInteger(42);",
].join("\n");

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
            `Expected prefer-ts-extras-is-safe-integer text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const numberExpressionKindArbitrary = fc.constantFrom<
    "callExpression" | "identifier" | "memberExpression" | "numericLiteral"
>("callExpression", "identifier", "memberExpression", "numericLiteral");

const buildNumberExpressionTemplate = (
    kind:
        | "callExpression"
        | "identifier"
        | "memberExpression"
        | "numericLiteral"
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (kind === "identifier") {
        return {
            declarations: ["const value = 42;"],
            expressionText: "value",
        };
    }

    if (kind === "memberExpression") {
        return {
            declarations: ["const holder = { value: 42 } as const;"],
            expressionText: "holder.value",
        };
    }

    if (kind === "callExpression") {
        return {
            declarations: ["const getValue = (): number => 42;"],
            expressionText: "getValue()",
        };
    }

    return {
        declarations: [],
        expressionText: "42",
    };
};

const parseIsSafeIntegerCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.VariableDeclaration &&
            statement.declarations.length === 1
        ) {
            const declaration = statement.declarations[0];
            if (
                declaration?.type === AST_NODE_TYPES.VariableDeclarator &&
                declaration.init !== null &&
                declaration.init.type === AST_NODE_TYPES.CallExpression
            ) {
                return {
                    ast: parsed.ast,
                    callExpression: declaration.init,
                };
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from an isSafeInteger call"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-is-safe-integer", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras isSafeInteger over Number.isSafeInteger for consistent predicate helper usage.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsSafeInteger:
            "Prefer `isSafeInteger` from `ts-extras` over `Number.isSafeInteger(...)`.",
    },
    name: "prefer-ts-extras-is-safe-integer",
});

describe("prefer-ts-extras-is-safe-integer parse-safety guards", () => {
    it("fast-check: isSafeInteger replacement remains parseable across number expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                numberExpressionKindArbitrary,
                includeUnicodeBannerArbitrary,
                (numberExpressionKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const numberExpressionTemplate =
                        buildNumberExpressionTemplate(numberExpressionKind);
                    const originalCallStatement = `const result = Number.isSafeInteger(${numberExpressionTemplate.expressionText});`;
                    const replacementCallStatement = `const result = isSafeInteger(${numberExpressionTemplate.expressionText});`;
                    const generatedCode = [
                        unicodeBanner,
                        'import { isSafeInteger } from "ts-extras";',
                        ...numberExpressionTemplate.declarations,
                        originalCallStatement,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: replacementCallStatement,
                        sourceText: generatedCode,
                        target: originalCallStatement,
                    });

                    const { callExpression } =
                        parseIsSafeIntegerCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe(
                            "isSafeInteger"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run("prefer-ts-extras-is-safe-integer", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsSafeInteger",
                },
                {
                    messageId: "preferTsExtrasIsSafeInteger",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Number.isSafeInteger calls",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsSafeInteger" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Number.isSafeInteger call",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsSafeInteger" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Number.isSafeInteger() when isSafeInteger import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: computedAccessValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Number.isSafeInteger access",
        },
        {
            code: nonNumberReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Number isSafeInteger method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number.isInteger call",
        },
        {
            code: shadowedNumberBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number.isSafeInteger call when Number binding is shadowed",
        },
    ],
});
