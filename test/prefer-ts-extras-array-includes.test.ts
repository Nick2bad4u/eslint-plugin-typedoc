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
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-includes.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-includes.invalid.ts";
const computedAccessValidCode = [
    "const values = [1, 2, 3];",
    'const hasValue = values["includes"](2);',
    "String(hasValue);",
].join("\n");
const nonArrayReceiverValidCode = [
    "const helper = {",
    "    includes(value: number): boolean {",
    "        return value === 1;",
    "    },",
    "};",
    "const hasValue = helper.includes(1);",
    "String(hasValue);",
].join("\n");
const wrongPropertyValidCode = [
    "const values = [1, 2, 3];",
    "const hasValue = values.some((value) => value === 2);",
    "String(hasValue);",
].join("\n");
const readonlyArrayInvalidCode = [
    "declare const values: readonly number[];",
    "const hasValue = values.includes(2);",
    "String(hasValue);",
].join("\n");
const readonlyArrayInvalidOutput = [
    'import { arrayIncludes } from "ts-extras";',
    "declare const values: readonly number[];",
    "const hasValue = arrayIncludes(values, 2);",
    "String(hasValue);",
].join("\n");
const unionWithNonArrayValidCode = [
    "declare const values: number[] | number;",
    "const hasValue = values.includes(2);",
    "String(hasValue);",
].join("\n");
const unionWithNonArrayOutput = [
    'import { arrayIncludes } from "ts-extras";',
    "declare const values: number[] | number;",
    "const hasValue = arrayIncludes(values, 2);",
    "String(hasValue);",
].join("\n");
const inlineFixableCode = [
    'import { arrayIncludes } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const hasValue = sample.includes(2);",
].join("\n");
const inlineFixableOutput = [
    'import { arrayIncludes } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const hasValue = arrayIncludes(sample, 2);",
].join("\n");
const inlineInvalidLogicalGuardNoAutofixCode = [
    "const statuses = ['down', 'up'] as const;",
    "declare const candidate: string;",
    "",
    "const shouldContinue =",
    "    Math.random() > 0.5 &&",
    "    statuses.includes(candidate);",
    "",
    "String(shouldContinue);",
].join("\n");
const inlineInvalidLogicalGuardSuggestionOutput = [
    'import { arrayIncludes } from "ts-extras";',
    "const statuses = ['down', 'up'] as const;",
    "declare const candidate: string;",
    "",
    "const shouldContinue =",
    "    Math.random() > 0.5 &&",
    "    arrayIncludes(statuses, candidate);",
    "",
    "String(shouldContinue);",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ArrayIncludesFixFactoryArguments = Readonly<{
    callNode: unknown;
}>;

type ArrayIncludesReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

type ArrayIncludesTemplate = Readonly<{
    declarations: readonly string[];
    objectText: string;
}>;

type ArrayIncludesTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

const arrayIncludesTemplateIdArbitrary =
    fc.constantFrom<ArrayIncludesTemplateId>(
        "identifier",
        "memberExpression",
        "callExpression",
        "parenthesizedIdentifier"
    );

const buildArrayIncludesTemplate = (
    templateId: ArrayIncludesTemplateId
): ArrayIncludesTemplate => {
    if (templateId === "identifier") {
        return {
            declarations: [],
            objectText: "values",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "const holder = { values } as const satisfies Readonly<{ readonly values: readonly string[] }>;",
            ],
            objectText: "holder.values",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: [
                "const getValues = (): readonly string[] => values;",
            ],
            objectText: "getValues()",
        };
    }

    return {
        declarations: [],
        objectText: "(values)",
    };
};

const buildArrayIncludesPatternCode = (options: {
    readonly includeUnicodeBanner: boolean;
    readonly includeValueImport: boolean;
    readonly templateId: ArrayIncludesTemplateId;
}): string => {
    const template = buildArrayIncludesTemplate(options.templateId);

    const codeLines = [
        options.includeValueImport
            ? 'import { arrayIncludes } from "ts-extras";'
            : "",
        "const values = ['down', 'up', 'stable'] as const;",
        ...template.declarations,
        options.includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        "const candidate = 'up' as string;",
        `const hasValue = ${template.objectText}.includes(candidate);`,
        "String(hasValue);",
    ];

    return codeLines.filter((line) => line.length > 0).join("\n");
};

const getSourceTextForNode = (options: {
    readonly code: string;
    readonly node: unknown;
}): string => {
    if (typeof options.node !== "object" || options.node === null) {
        return "";
    }

    const maybeRange = (
        options.node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (!maybeRange) {
        return "";
    }

    return options.code.slice(maybeRange[0], maybeRange[1]);
};

const parseIncludesCallExpressionFromCode = (
    code: string
): Readonly<{
    ast: TSESTree.Program;
    callExpression: TSESTree.CallExpression;
}> => {
    const ast = parser.parseForESLint(code, parserOptions)
        .ast as TSESTree.Program;

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.name === "hasValue" &&
                    declaration.init?.type === AST_NODE_TYPES.CallExpression
                ) {
                    return {
                        ast,
                        callExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error("Expected a hasValue call expression in generated code");
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-array-includes", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras arrayIncludes over Array#includes for stronger element inference.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasArrayIncludes:
            "Prefer `arrayIncludes` from `ts-extras` over `array.includes(...)` for stronger element inference.",
        suggestTsExtrasArrayIncludes:
            "Replace this `array.includes(...)` call with `arrayIncludes(...)` from `ts-extras`.",
    },
    name: "prefer-ts-extras-array-includes",
});

describe("prefer-ts-extras-array-includes fast-check fix safety", () => {
    it("fast-check: includes call patterns report and produce parseable arrayIncludes replacements", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createMethodToFunctionCallFixMock = vi.fn(
                (options: ArrayIncludesFixFactoryArguments): string => {
                    if (typeof options.callNode !== "object") {
                        throw new TypeError(
                            "Expected callNode to be an object-like node"
                        );
                    }

                    return "FIX";
                }
            );

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
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createMethodToFunctionCallFix:
                        createMethodToFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-array-includes")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    arrayIncludesTemplateIdArbitrary,
                    fc.boolean(),
                    fc.boolean(),
                    (templateId, includeUnicodeBanner, includeValueImport) => {
                        createMethodToFunctionCallFixMock.mockClear();

                        const code = buildArrayIncludesPatternCode({
                            includeUnicodeBanner,
                            includeValueImport,
                            templateId,
                        });
                        const { ast, callExpression } =
                            parseIncludesCallExpressionFromCode(code);
                        const reportCalls: ArrayIncludesReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: ArrayIncludesReportDescriptor
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
                            messageId: "preferTsExtrasArrayIncludes",
                        });
                        expect(
                            createMethodToFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);

                        const fixArguments =
                            createMethodToFunctionCallFixMock.mock
                                .calls[0]?.[0] ?? null;

                        expect(fixArguments).not.toBeNull();

                        const fixedCallExpression = (
                            fixArguments as ArrayIncludesFixFactoryArguments
                        ).callNode as Readonly<{
                            arguments?: readonly unknown[];
                            callee?: Readonly<{
                                object?: unknown;
                            }>;
                        }>;

                        const objectText = getSourceTextForNode({
                            code,
                            node: fixedCallExpression.callee?.object,
                        });
                        const argumentText = getSourceTextForNode({
                            code,
                            node: fixedCallExpression.arguments?.[0],
                        });
                        const replacementText = `arrayIncludes(${objectText}, ${argumentText})`;

                        expect(replacementText).toBeTruthy();

                        const callRange = callExpression.range;

                        expect(callRange).toBeDefined();

                        if (callRange === undefined) {
                            throw new Error(
                                "Expected call expression to expose source range"
                            );
                        }

                        const fixedCode =
                            code.slice(0, callRange[0]) +
                            replacementText +
                            code.slice(callRange[1]);

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
    "prefer-ts-extras-array-includes",
    getPluginRule("prefer-ts-extras-array-includes"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasArrayIncludes",
                    },
                    {
                        messageId: "preferTsExtrasArrayIncludes",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture-based includes usages",
            },
            {
                code: readonlyArrayInvalidCode,
                errors: [{ messageId: "preferTsExtrasArrayIncludes" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports readonly array includes call",
                output: readonlyArrayInvalidOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasArrayIncludes" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes array.includes() when arrayIncludes import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: unionWithNonArrayValidCode,
                errors: [{ messageId: "preferTsExtrasArrayIncludes" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union containing array when calling includes",
                output: unionWithNonArrayOutput,
            },
            {
                code: inlineInvalidLogicalGuardNoAutofixCode,
                errors: [
                    {
                        messageId: "preferTsExtrasArrayIncludes",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasArrayIncludes",
                                output: inlineInvalidLogicalGuardSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports logical-guard includes call without autofix",
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
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed includes member access",
            },
            {
                code: nonArrayReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-array includes method",
            },
            {
                code: wrongPropertyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-includes array method calls",
            },
        ],
    }
);
