/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-at.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-at.invalid.ts";
const computedAccessValidCode = [
    "const values = [1, 2, 3];",
    'const value = values["at"](0);',
    "String(value);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    at(index: number): number {",
    "        return index;",
    "    },",
    "};",
    "const value = helper.at(0);",
    "String(value);",
].join("\n");
const wrongPropertyValidCode = [
    "const values = [1, 2, 3];",
    "const value = values.find((item) => item === 2);",
    "String(value);",
].join("\n");
const readonlyArrayInvalidCode = [
    "declare const values: readonly number[];",
    "const value = values.at(0);",
    "String(value);",
].join("\n");
const readonlyArrayInvalidOutput = [
    'import { arrayAt } from "ts-extras";',
    "declare const values: readonly number[];",
    "const value = arrayAt(values, 0);",
    "String(value);",
].join("\n");
const unionWithNonArrayValidCode = [
    "declare const values: number[] | number;",
    "const value = values.at(0);",
    "String(value);",
].join("\n");
const unionWithNonArrayOutput = [
    'import { arrayAt } from "ts-extras";',
    "declare const values: number[] | number;",
    "const value = arrayAt(values, 0);",
    "String(value);",
].join("\n");
const inlineFixableCode = [
    'import { arrayAt } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const value = sample.at(0);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayAt } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const value = arrayAt(sample, 0);",
].join("\n");
const disableImportInsertionSettings = {
    typefest: {
        disableImportInsertionFixes: true,
    },
};
const disableAllAutofixesSettings = {
    typefest: {
        disableAllAutofixes: true,
    },
};

type ArrayAtReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const receiverExpressionArbitrary = fc.constantFrom(
    "values",
    "getValues()",
    "matrix[index]",
    "values ?? fallbackValues",
    "candidate?.items ?? values"
);

const argumentExpressionArbitrary = fc.constantFrom(
    "0",
    "1",
    "startIndex",
    "computeIndex()",
    "undefined"
);

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return "";
    }

    const nodeRange = (
        node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (nodeRange === undefined) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

const parseAtCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    return {
                        ast: parsed.ast,
                        callExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from an Array.at call"
    );
};

describe("prefer-ts-extras-array-at source assertions", () => {
    it("fast-check: .at() call autofixes remain parseable across receiver/argument shapes", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createMethodToFunctionCallFixMock = vi.fn(() => "FIX");

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
            }));

            vi.doMock(
                import("../src/_internal/array-like-expression.js"),
                () => ({
                    createIsArrayLikeExpressionChecker: () => () => true,
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () => new Map(),
                    createMethodToFunctionCallFix:
                        createMethodToFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-array-at")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    receiverExpressionArbitrary,
                    fc.array(argumentExpressionArbitrary, {
                        maxLength: 2,
                    }),
                    (receiverExpression, argumentExpressions) => {
                        createMethodToFunctionCallFixMock.mockClear();

                        const argumentListText = argumentExpressions.join(", ");
                        const callText =
                            argumentListText.length > 0
                                ? `(${receiverExpression}).at(${argumentListText})`
                                : `(${receiverExpression}).at()`;
                        const code = [
                            "declare const values: readonly number[];",
                            "declare const fallbackValues: readonly number[];",
                            "declare const matrix: readonly (readonly number[])[];",
                            "declare const index: number;",
                            "declare const startIndex: number;",
                            "declare const candidate: { readonly items?: readonly number[] } | null;",
                            "declare function getValues(): readonly number[];",
                            "declare function computeIndex(): number;",
                            `const result = ${callText};`,
                            "void result;",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseAtCallFromCode(code);
                        const reportCalls: ArrayAtReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: ArrayAtReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.CallExpression?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasArrayAt",
                        });
                        expect(
                            createMethodToFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);

                        if (
                            callExpression.callee.type !==
                            AST_NODE_TYPES.MemberExpression
                        ) {
                            throw new TypeError(
                                "Expected generated call expression callee to be a member expression"
                            );
                        }

                        const receiverText = getSourceTextForNode({
                            code,
                            node: callExpression.callee.object,
                        });
                        const argumentTexts = callExpression.arguments.map(
                            (argument) =>
                                getSourceTextForNode({
                                    code,
                                    node: argument,
                                })
                        );
                        const replacementText =
                            argumentTexts.length > 0
                                ? `arrayAt(${receiverText}, ${argumentTexts.join(", ")})`
                                : `arrayAt(${receiverText})`;

                        const callRange = callExpression.range;
                        const fixedCode = `${code.slice(0, callRange[0])}${replacementText}${code.slice(callRange[1])}`;

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/array-like-expression.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-array-at",
    getPluginRule("prefer-ts-extras-array-at"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayAt",
                    },
                    {
                        messageId: "preferTsExtrasArrayAt",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture-based .at usages",
            },
            {
                code: readonlyArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports readonly array .at call",
                output: readonlyArrayInvalidOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.at() when arrayAt import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "still autofixes when disableImportInsertionFixes is enabled and import already exists",
                output: inlineFixableOutput,
                settings: disableImportInsertionSettings,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "skips all autofixes when disableAllAutofixes is enabled",
                output: null,
                settings: disableAllAutofixesSettings,
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union containing array when calling .at",
                output: unionWithNonArrayOutput,
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayAt" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "skips autofix when import insertion fixes are globally disabled",
                output: null,
                settings: disableImportInsertionSettings,
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
                name: "ignores computed .at member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array at method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-at array method calls",
            },
        ],
    }
);
