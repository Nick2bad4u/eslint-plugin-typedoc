/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-first.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-first");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-first.valid.ts";
const writeTargetValidFixtureName =
    "prefer-ts-extras-array-first.write-target.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-first.invalid.ts";
const inlineInvalidUnionArrayCode = [
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const firstStatus = monitorStatuses[0];",
    "String(firstStatus);",
].join("\n");
const inlineInvalidUnionArrayOutput = [
    'import { arrayFirst } from "ts-extras";',
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const firstStatus = arrayFirst(monitorStatuses);",
    "String(firstStatus);",
].join("\n");
const inlineInvalidStringZeroCode = [
    "declare const monitorStatuses: readonly string[];",
    'const firstStatus = monitorStatuses["0"];',
    "String(firstStatus);",
].join("\n");
const inlineInvalidStringZeroOutput = [
    'import { arrayFirst } from "ts-extras";',
    "declare const monitorStatuses: readonly string[];",
    "const firstStatus = arrayFirst(monitorStatuses);",
    "String(firstStatus);",
].join("\n");
const inlineInvalidUnaryVoidCode = [
    "declare const monitorStatuses: readonly string[];",
    "void monitorStatuses[0];",
].join("\n");
const inlineInvalidUnaryVoidOutput = [
    'import { arrayFirst } from "ts-extras";',
    "declare const monitorStatuses: readonly string[];",
    "void arrayFirst(monitorStatuses);",
].join("\n");
const inlineValidDeleteWriteTargetCode = [
    "const mutableStatuses = ['down', 'up'];",
    "delete mutableStatuses[0];",
    "String(mutableStatuses);",
].join("\n");
const inlineFixableCode = [
    'import { arrayFirst } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const first = sample[0];",
].join("\n");
const inlineFixableOutput = [
    'import { arrayFirst } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const first = arrayFirst(sample);",
].join("\n");
const inlineInvalidOptionalChainReceiverCode = [
    "type PromiseLikeWrapper = {",
    "    readonly params?: readonly string[];",
    "};",
    "",
    "declare const wrapper: PromiseLikeWrapper;",
    "",
    "const first = wrapper.params?.[0] ?? null;",
].join("\n");
const inlineInvalidReturnLikeCode = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    "",
    "const getFirstStatement = (",
    "    node: Readonly<TSESTree.BlockStatement>",
    "): null | TSESTree.Statement => {",
    "    if (node.body.length === 0) {",
    "        return null;",
    "    }",
    "",
    "    return node.body[0];",
    "};",
].join("\n");
const inlineInvalidReturnLikeSuggestionOutput = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    'import { arrayFirst } from "ts-extras";',
    "",
    "const getFirstStatement = (",
    "    node: Readonly<TSESTree.BlockStatement>",
    "): null | TSESTree.Statement => {",
    "    if (node.body.length === 0) {",
    "        return null;",
    "    }",
    "",
    "    return arrayFirst(node.body);",
    "};",
].join("\n");

type ArrayFirstReportDescriptor = Readonly<{
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

const indexExpressionArbitrary = fc.constantFrom("0", '"0"');

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

const parseIndexZeroMemberFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    memberExpression: TSESTree.MemberExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.MemberExpression
                ) {
                    return {
                        ast: parsed.ast,
                        memberExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from index access"
    );
};

describe("prefer-ts-extras-array-first source assertions", () => {
    it("fast-check: [0] autofixes remain parseable across receiver/index literal shapes", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createMemberToFunctionCallFixMock = vi.fn(() => "FIX");

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
                    isWriteTargetMemberExpression: () => false,
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () => new Map(),
                    createMemberToFunctionCallFix:
                        createMemberToFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-array-first")) as {
                    default: {
                        create: (context: unknown) => {
                            MemberExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    receiverExpressionArbitrary,
                    indexExpressionArbitrary,
                    (receiverExpression, indexExpression) => {
                        createMemberToFunctionCallFixMock.mockClear();

                        const indexAccessText = `(${receiverExpression})[${indexExpression}]`;
                        const code = [
                            "declare const values: readonly number[];",
                            "declare const fallbackValues: readonly number[];",
                            "declare const matrix: readonly (readonly number[])[];",
                            "declare const index: number;",
                            "declare const candidate: { readonly items?: readonly number[] } | null;",
                            "declare function getValues(): readonly number[];",
                            `const firstValue = ${indexAccessText};`,
                            "void firstValue;",
                        ].join("\n");

                        const { ast, memberExpression } =
                            parseIndexZeroMemberFromCode(code);
                        const reportCalls: ArrayFirstReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: ArrayFirstReportDescriptor
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

                        listeners.MemberExpression?.(memberExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasArrayFirst",
                        });
                        expect(
                            createMemberToFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);

                        const receiverText = getSourceTextForNode({
                            code,
                            node: memberExpression.object,
                        });
                        const replacementText = `arrayFirst(${receiverText})`;
                        const memberRange = memberExpression.range;
                        const fixedCode = `${code.slice(0, memberRange[0])}${replacementText}${code.slice(memberRange[1])}`;

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

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-array-first", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras arrayFirst over direct [0] array access for stronger tuple and readonly-array inference.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasArrayFirst:
            "Prefer `arrayFirst` from `ts-extras` over direct `array[0]` access for stronger inference.",
        suggestTsExtrasArrayFirst:
            "Replace this direct index access with `arrayFirst(...)` from `ts-extras`.",
    },
    name: "prefer-ts-extras-array-first",
});

ruleTester.run("prefer-ts-extras-array-first", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture index-zero array reads",
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports index-zero read on readonly array union",
            output: inlineInvalidUnionArrayOutput,
        },
        {
            code: inlineInvalidStringZeroCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports string-literal zero index access",
            output: inlineInvalidStringZeroOutput,
        },
        {
            code: inlineInvalidUnaryVoidCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports unary-void index-zero read",
            output: inlineInvalidUnaryVoidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes array[0] when arrayFirst import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineInvalidOptionalChainReceiverCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports optional-chain receiver index access without autofix",
            output: null,
        },
        {
            code: inlineInvalidReturnLikeCode,
            errors: [
                {
                    messageId: "preferTsExtrasArrayFirst",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasArrayFirst",
                            output: inlineInvalidReturnLikeSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports return-position index access without autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(writeTargetValidFixtureName),
            filename: typedFixturePath(writeTargetValidFixtureName),
            name: "accepts fixture write-target index operations",
        },
        {
            code: inlineValidDeleteWriteTargetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores delete write-target index usage",
        },
    ],
});
