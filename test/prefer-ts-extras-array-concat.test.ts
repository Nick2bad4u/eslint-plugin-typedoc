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
    warmTypedParserServices,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-concat.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-concat.invalid.ts";
const computedAccessValidCode = [
    "const numbers = [1, 2, 3];",
    'const merged = numbers["concat"]([4]);',
    "String(merged);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    concat(values: readonly number[]): readonly number[] {",
    "        return values;",
    "    },",
    "};",
    "const merged = helper.concat([1, 2]);",
    "String(merged);",
].join("\n");
const wrongPropertyValidCode = [
    "const numbers = [1, 2, 3];",
    "const merged = numbers.map((value) => value);",
    "String(merged);",
].join("\n");
const unionArrayInvalidCode = [
    "declare const numbers: number[] | readonly number[];",
    "const merged = numbers.concat([4]);",
    "String(merged);",
].join("\n");
const unionArrayInvalidOutput = [
    'import { arrayConcat } from "ts-extras";',
    "declare const numbers: number[] | readonly number[];",
    "const merged = arrayConcat(numbers, [4]);",
    "String(merged);",
].join("\n");
const unionWithCustomValidCode = [
    "type Custom = {",
    "    concat(values: readonly number[]): readonly number[];",
    "};",
    "declare const numbers: number[] | Custom;",
    "const merged = numbers.concat([4]);",
    "String(merged);",
].join("\n");
const unionWithCustomOutput = [
    'import { arrayConcat } from "ts-extras";',
    "type Custom = {",
    "    concat(values: readonly number[]): readonly number[];",
    "};",
    "declare const numbers: number[] | Custom;",
    "const merged = arrayConcat(numbers, [4]);",
    "String(merged);",
].join("\n");
const inlineFixableCode = [
    'import { arrayConcat } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const merged = sample.concat([4]);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayConcat } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const merged = arrayConcat(sample, [4]);",
].join("\n");

warmTypedParserServices(typedFixturePath(validFixtureName));

type ArrayConcatReportDescriptor = Readonly<{
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
    "[]",
    "tail",
    "[startIndex]",
    "computeTail()",
    "fallbackValues"
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

const parseConcatCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an Array.concat call"
    );
};

describe("prefer-ts-extras-array-concat source assertions", () => {
    it("fast-check: .concat() autofixes remain parseable across receiver/argument shapes", async () => {
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
                (await import("../src/rules/prefer-ts-extras-array-concat")) as {
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
                                ? `(${receiverExpression}).concat(${argumentListText})`
                                : `(${receiverExpression}).concat()`;
                        const code = [
                            "declare const values: readonly number[];",
                            "declare const fallbackValues: readonly number[];",
                            "declare const matrix: readonly (readonly number[])[];",
                            "declare const index: number;",
                            "declare const startIndex: number;",
                            "declare const tail: readonly number[];",
                            "declare const candidate: { readonly items?: readonly number[] } | null;",
                            "declare function getValues(): readonly number[];",
                            "declare function computeTail(): readonly number[];",
                            `const result = ${callText};`,
                            "void result;",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseConcatCallFromCode(code);
                        const reportCalls: ArrayConcatReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: ArrayConcatReportDescriptor
                            ) => {
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
                            messageId: "preferTsExtrasArrayConcat",
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
                                ? `arrayConcat(${receiverText}, ${argumentTexts.join(", ")})`
                                : `arrayConcat(${receiverText})`;

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

describe("prefer-ts-extras-array-concat rule tester", () => {
    ruleTester.run(
        "prefer-ts-extras-array-concat",
        getPluginRule("prefer-ts-extras-array-concat"),
        {
            invalid: [
                {
                    code: readTypedFixture(invalidFixtureName),
                    errors: [
                        {
                            messageId: "preferTsExtrasArrayConcat",
                        },
                        {
                            messageId: "preferTsExtrasArrayConcat",
                        },
                    ],
                    filename: typedFixturePath(invalidFixtureName),
                    name: "reports fixture array.concat usage",
                },
                {
                    code: unionArrayInvalidCode,
                    errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                    filename: typedFixturePath(invalidFixtureName),
                    name: "reports union of mutable and readonly arrays",
                    output: unionArrayInvalidOutput,
                },
                {
                    code: unionWithCustomValidCode,
                    errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                    filename: typedFixturePath(invalidFixtureName),
                    name: "reports union including custom concat receiver",
                    output: unionWithCustomOutput,
                },
                {
                    code: inlineFixableCode,
                    errors: [{ messageId: "preferTsExtrasArrayConcat" }],
                    filename: typedFixturePath(invalidFixtureName),
                    name: "autofixes array.concat() when arrayConcat import is in scope",
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
                    name: "ignores computed concat member access",
                },
                {
                    code: nonArrayReceiverValidCode,
                    filename: typedFixturePath(validFixtureName),
                    name: "ignores custom non-array concat method",
                },
                {
                    code: wrongPropertyValidCode,
                    filename: typedFixturePath(validFixtureName),
                    name: "ignores non-concat array method call",
                },
            ],
        }
    );
});
