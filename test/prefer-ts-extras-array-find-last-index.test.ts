/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-find-last-index.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find-last-index.invalid.ts";
const computedAccessValidCode = [
    "const numbers = [1, 2, 3];",
    'const index = numbers["findLastIndex"]((value) => value > 1);',
    "String(index);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    findLastIndex(predicate: (value: number) => boolean): number {",
    "        return predicate(3) ? 0 : -1;",
    "    },",
    "};",
    "const index = helper.findLastIndex((value) => value > 1);",
    "String(index);",
].join("\n");
const inlineFixableCode = [
    'import { arrayFindLastIndex } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const index = sample.findLastIndex((value) => value > 1);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayFindLastIndex } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const index = arrayFindLastIndex(sample, (value) => value > 1);",
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
            `Expected prefer-ts-extras-array-find-last-index text to contain replaceable segment: ${target}`
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
const arrayExpressionKindArbitrary = fc.constantFrom<
    "arrayLiteral" | "callExpression" | "identifier" | "memberExpression"
>("callExpression", "identifier", "memberExpression", "arrayLiteral");

const buildArrayExpressionTemplate = (
    kind: "arrayLiteral" | "callExpression" | "identifier" | "memberExpression"
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (kind === "identifier") {
        return {
            declarations: ["const values = [1, 2, 3] as const;"],
            expressionText: "values",
        };
    }

    if (kind === "memberExpression") {
        return {
            declarations: [
                "const holder = { values: [1, 2, 3] as const } as const;",
            ],
            expressionText: "holder.values",
        };
    }

    if (kind === "callExpression") {
        return {
            declarations: [
                "const buildValues = (): ReadonlyArray<number> => [1, 2, 3];",
            ],
            expressionText: "buildValues()",
        };
    }

    return {
        declarations: [],
        expressionText: "[1, 2, 3]",
    };
};

const parseArrayFindLastIndexCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an arrayFindLastIndex call"
    );
};

describe("prefer-ts-extras-array-find-last-index parse-safety guards", () => {
    it("fast-check: arrayFindLastIndex replacement remains parseable across array expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                arrayExpressionKindArbitrary,
                includeUnicodeBannerArbitrary,
                (arrayExpressionKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const arrayExpressionTemplate =
                        buildArrayExpressionTemplate(arrayExpressionKind);
                    const originalCallStatement = `const index = ${arrayExpressionTemplate.expressionText}.findLastIndex((value) => value > 1);`;
                    const replacementCallStatement = `const index = arrayFindLastIndex(${arrayExpressionTemplate.expressionText}, (value) => value > 1);`;
                    const generatedCode = [
                        unicodeBanner,
                        'import { arrayFindLastIndex } from "ts-extras";',
                        ...arrayExpressionTemplate.declarations,
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
                        parseArrayFindLastIndexCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe(
                            "arrayFindLastIndex"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-ts-extras-array-find-last-index",
    getPluginRule("prefer-ts-extras-array-find-last-index"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayFindLastIndex",
                    },
                    {
                        messageId: "preferTsExtrasArrayFindLastIndex",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture findLastIndex usage",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayFindLastIndex" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.findLastIndex() when arrayFindLastIndex import is in scope",
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
                name: "ignores computed findLastIndex member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array findLastIndex method",
            },
        ],
    }
);
