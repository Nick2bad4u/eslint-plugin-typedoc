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

const validFixtureName = "prefer-ts-extras-array-join.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-join.invalid.ts";
const computedAccessValidCode = [
    "const values = ['a', 'b'];",
    'const joined = values["join"]("-");',
    "String(joined);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    join(separator: string): string {",
    "        return separator;",
    "    },",
    "};",
    "const joined = helper.join('-');",
    "String(joined);",
].join("\n");
const wrongPropertyValidCode = [
    "const values = ['a', 'b'];",
    "const joined = values.toString();",
    "String(joined);",
].join("\n");
const unionArrayInvalidCode = [
    "declare const values: string[] | readonly string[];",
    "const joined = values.join('-');",
    "String(joined);",
].join("\n");
const unionArrayInvalidOutputCode = [
    'import { arrayJoin } from "ts-extras";',
    "declare const values: string[] | readonly string[];",
    "const joined = arrayJoin(values, '-');",
    "String(joined);",
].join("\n");
const unionWithCustomValidCode = [
    "type Custom = {",
    "    join(separator?: string): string;",
    "};",
    "declare const values: string[] | Custom;",
    "const joined = values.join('-');",
    "String(joined);",
].join("\n");
const unionWithCustomOutputCode = [
    'import { arrayJoin } from "ts-extras";',
    "type Custom = {",
    "    join(separator?: string): string;",
    "};",
    "declare const values: string[] | Custom;",
    "const joined = arrayJoin(values, '-');",
    "String(joined);",
].join("\n");
const inlineFixableCode = [
    'import { arrayJoin } from "ts-extras";',
    "",
    "const sample = ['a', 'b'] as const;",
    "const joined = sample.join('-');",
].join("\n");
const inlineFixableOutput = [
    'import { arrayJoin } from "ts-extras";',
    "",
    "const sample = ['a', 'b'] as const;",
    "const joined = arrayJoin(sample, '-');",
].join("\n");

type ArrayJoinReportDescriptor = Readonly<{
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
    "'-'",
    "separator",
    "computeSeparator()",
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

const parseJoinCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an Array.join call"
    );
};

describe("prefer-ts-extras-array-join source assertions", () => {
    it("fast-check: .join() autofixes remain parseable across receiver/argument shapes", async () => {
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
                (await import("../src/rules/prefer-ts-extras-array-join")) as {
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
                        maxLength: 1,
                    }),
                    (receiverExpression, argumentExpressions) => {
                        createMethodToFunctionCallFixMock.mockClear();

                        const argumentListText = argumentExpressions.join(", ");
                        const callText =
                            argumentListText.length > 0
                                ? `(${receiverExpression}).join(${argumentListText})`
                                : `(${receiverExpression}).join()`;
                        const code = [
                            "declare const values: readonly string[];",
                            "declare const fallbackValues: readonly string[];",
                            "declare const matrix: readonly (readonly string[])[];",
                            "declare const index: number;",
                            "declare const separator: string;",
                            "declare const candidate: { readonly items?: readonly string[] } | null;",
                            "declare function getValues(): readonly string[];",
                            "declare function computeSeparator(): string;",
                            `const result = ${callText};`,
                            "void result;",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseJoinCallFromCode(code);
                        const reportCalls: ArrayJoinReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: ArrayJoinReportDescriptor) => {
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
                            messageId: "preferTsExtrasArrayJoin",
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
                                ? `arrayJoin(${receiverText}, ${argumentTexts.join(", ")})`
                                : `arrayJoin(${receiverText})`;

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
    "prefer-ts-extras-array-join",
    getPluginRule("prefer-ts-extras-array-join"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayJoin",
                    },
                    {
                        messageId: "preferTsExtrasArrayJoin",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture array.join usage",
            },
            {
                code: unionArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union of mutable and readonly arrays",
                output: unionArrayInvalidOutputCode,
            },
            {
                code: unionWithCustomValidCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union including custom join receiver",
                output: unionWithCustomOutputCode,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayJoin" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.join() when arrayJoin import is in scope",
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
                name: "ignores computed join member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array join method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-join array method call",
            },
        ],
    }
);
