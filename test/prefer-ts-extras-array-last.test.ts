/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-last.test` behavior.
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

const rule = getPluginRule("prefer-ts-extras-array-last");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-last.valid.ts";
const patternValidFixtureName = "prefer-ts-extras-array-last.patterns.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-last.invalid.ts";
const inlineInvalidUnionArrayCode = [
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const lastStatus = monitorStatuses[monitorStatuses.length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineInvalidUnionArrayOutput = [
    'import { arrayLast } from "ts-extras";',
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const lastStatus = arrayLast(monitorStatuses);",
    "String(lastStatus);",
].join("\n");
const inlineInvalidTupleCode = [
    "const monitorStatuses: [string, string] = ['down', 'up'];",
    "const lastStatus = monitorStatuses[monitorStatuses.length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineInvalidTupleOutput = [
    'import { arrayLast } from "ts-extras";',
    "const monitorStatuses: [string, string] = ['down', 'up'];",
    "const lastStatus = arrayLast(monitorStatuses);",
    "String(lastStatus);",
].join("\n");
const inlineValidDeleteWriteTargetCode = [
    "const mutableStatuses = ['down', 'up'];",
    "delete mutableStatuses[mutableStatuses.length - 1];",
    "String(mutableStatuses);",
].join("\n");
const inlineValidNonLiteralOffsetCode = [
    "const monitorStatuses = ['down', 'up'];",
    "const offset = 1;",
    "const maybeLast = monitorStatuses[monitorStatuses.length - offset];",
    "String(maybeLast);",
].join("\n");
const inlineValidSuperLastIndexCode = [
    "class StatusHistory extends Array<string> {",
    "    getLatest(): string | undefined {",
    "        return super[super.length - 1];",
    "    }",
    "}",
    "const statuses = new StatusHistory('down', 'up');",
    "String(statuses.getLatest());",
].join("\n");
const inlineFixableCode = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const last = sample[sample.length - 1];",
].join("\n");
const inlineFixableOutput = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const last = arrayLast(sample);",
].join("\n");
const inlineParenthesizedObjectCode = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const monitorStatuses = ['healthy', 'degraded'];",
    "const lastStatus = (monitorStatuses)[(monitorStatuses).length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineParenthesizedObjectOutput = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const monitorStatuses = ['healthy', 'degraded'];",
    "const lastStatus = arrayLast(monitorStatuses);",
    "String(lastStatus);",
].join("\n");
const inlineInvalidSideEffectfulObjectCode = [
    "declare function getStatuses(): readonly string[];",
    "",
    "const lastStatus = getStatuses()[getStatuses().length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineInvalidOptionalChainReceiverCode = [
    "type MonitorBucket = {",
    "    readonly statuses?: readonly string[];",
    "};",
    "",
    "declare const bucket: MonitorBucket;",
    "",
    "const maybeLast = bucket.statuses?.[bucket.statuses.length - 1] ?? null;",
].join("\n");
const inlineInvalidReturnLikeCode = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    "",
    "const getLastStatement = (",
    "    node: Readonly<TSESTree.BlockStatement>",
    "): null | TSESTree.Statement => {",
    "    if (node.body.length === 0) {",
    "        return null;",
    "    }",
    "",
    "    return node.body[node.body.length - 1];",
    "};",
].join("\n");
const inlineInvalidReturnLikeSuggestionOutput = [
    "import type { TSESTree } from '@typescript-eslint/utils';",
    'import { arrayLast } from "ts-extras";',
    "",
    "const getLastStatement = (",
    "    node: Readonly<TSESTree.BlockStatement>",
    "): null | TSESTree.Statement => {",
    "    if (node.body.length === 0) {",
    "        return null;",
    "    }",
    "",
    "    return arrayLast(node.body);",
    "};",
].join("\n");
const inlineInvalidSideEffectfulObjectSuggestionOutput = [
    'import { arrayLast } from "ts-extras";',
    "declare function getStatuses(): readonly string[];",
    "",
    "const lastStatus = arrayLast(getStatuses());",
    "String(lastStatus);",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ArrayLastFixFactoryArguments = Readonly<{
    memberNode: unknown;
}>;

type ArrayLastReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
    suggest?: readonly Readonly<{
        fix?: unknown;
        messageId?: string;
    }>[];
}>;

type ArrayLastTemplate = Readonly<{
    declarations: readonly string[];
    objectText: string;
}>;

type ArrayLastTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

const arrayLastTemplateIdArbitrary = fc.constantFrom<ArrayLastTemplateId>(
    "identifier",
    "memberExpression",
    "callExpression",
    "parenthesizedIdentifier"
);

const buildArrayLastTemplate = (
    templateId: ArrayLastTemplateId
): ArrayLastTemplate => {
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

const isAutofixExpectedForTemplate = (
    templateId: ArrayLastTemplateId
): boolean =>
    templateId === "identifier" || templateId === "parenthesizedIdentifier";

const buildArrayLastPatternCode = (options: {
    readonly includeUnicodeBanner: boolean;
    readonly includeValueImport: boolean;
    readonly templateId: ArrayLastTemplateId;
}): string => {
    const template = buildArrayLastTemplate(options.templateId);

    const codeLines = [
        options.includeValueImport
            ? 'import { arrayLast } from "ts-extras";'
            : "",
        "const values = ['down', 'up', 'stable'] as const;",
        ...template.declarations,
        options.includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        `const lastValue = ${template.objectText}[${template.objectText}.length - 1];`,
        "String(lastValue);",
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

const parseLastIndexMemberExpressionFromCode = (
    code: string
): Readonly<{
    ast: TSESTree.Program;
    memberExpression: TSESTree.MemberExpression;
}> => {
    const ast = parser.parseForESLint(code, parserOptions)
        .ast as TSESTree.Program;

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.name === "lastValue" &&
                    declaration.init?.type === AST_NODE_TYPES.MemberExpression
                ) {
                    return {
                        ast,
                        memberExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error("Expected a lastValue member expression in generated code");
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-array-last", {
    defaultOptions: [],
    docsDescription:
        "require `arrayLast` from `ts-extras` instead of manual last-index member access.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasArrayLast:
            "Prefer `arrayLast` from `ts-extras` over direct last-index access.",
        suggestTsExtrasArrayLast:
            "Replace this last-index access with `arrayLast(...)` from `ts-extras`.",
    },
    name: "prefer-ts-extras-array-last",
});

describe("prefer-ts-extras-array-last fast-check fix safety", () => {
    it("fast-check: last-index patterns report and produce parseable arrayLast replacements", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createMemberToFunctionCallFixMock = vi.fn(
                (options: ArrayLastFixFactoryArguments): string => {
                    if (typeof options.memberNode !== "object") {
                        throw new TypeError(
                            "Expected memberNode to be an object-like node"
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
                    isWriteTargetMemberExpression: () => false,
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createMemberToFunctionCallFix:
                        createMemberToFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-array-last")) as {
                    default: {
                        create: (context: unknown) => {
                            MemberExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    arrayLastTemplateIdArbitrary,
                    fc.boolean(),
                    fc.boolean(),
                    (templateId, includeUnicodeBanner, includeValueImport) => {
                        createMemberToFunctionCallFixMock.mockClear();

                        const code = buildArrayLastPatternCode({
                            includeUnicodeBanner,
                            includeValueImport,
                            templateId,
                        });
                        const { ast, memberExpression } =
                            parseLastIndexMemberExpressionFromCode(code);
                        const reportCalls: ArrayLastReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: ArrayLastReportDescriptor) => {
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
                        expect(reportCalls[0]?.messageId).toBe(
                            "preferTsExtrasArrayLast"
                        );

                        if (isAutofixExpectedForTemplate(templateId)) {
                            expect(reportCalls[0]?.fix).toBe("FIX");
                            expect(
                                createMemberToFunctionCallFixMock
                            ).toHaveBeenCalledTimes(1);

                            const fixArguments =
                                createMemberToFunctionCallFixMock.mock
                                    .calls[0]?.[0] ?? null;

                            expect(fixArguments).not.toBeNull();

                            const fixedMemberExpression = (
                                fixArguments as ArrayLastFixFactoryArguments
                            ).memberNode;
                            const objectText = getSourceTextForNode({
                                code,
                                node: (
                                    fixedMemberExpression as Readonly<{
                                        object?: unknown;
                                    }>
                                ).object,
                            });
                            const replacementText = `arrayLast(${objectText})`;

                            expect(replacementText).toBeTruthy();

                            const memberRange = memberExpression.range;

                            expect(memberRange).toBeDefined();

                            if (memberRange === undefined) {
                                throw new Error(
                                    "Expected member expression to expose source range"
                                );
                            }

                            const fixedCode =
                                code.slice(0, memberRange[0]) +
                                replacementText +
                                code.slice(memberRange[1]);

                            expect(() => {
                                parser.parseForESLint(fixedCode, parserOptions);
                            }).not.toThrow();

                            return;
                        }

                        expect(reportCalls[0]?.fix).toBeUndefined();
                        expect(reportCalls[0]?.suggest).toHaveLength(1);
                        expect(reportCalls[0]?.suggest?.[0]?.messageId).toBe(
                            "suggestTsExtrasArrayLast"
                        );
                        expect(reportCalls[0]?.suggest?.[0]?.fix).toBe("FIX");
                        expect(
                            createMemberToFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);
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

ruleTester.run("prefer-ts-extras-array-last", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayLast",
                },
                {
                    messageId: "preferTsExtrasArrayLast",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture last-index array reads",
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports last-index read on readonly array union",
            output: inlineInvalidUnionArrayOutput,
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports tuple last-index read via length arithmetic",
            output: inlineInvalidTupleOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes array[array.length - 1] when arrayLast import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineParenthesizedObjectCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes parenthesized object array[array.length - 1] patterns",
            output: inlineParenthesizedObjectOutput,
        },
        {
            code: inlineInvalidOptionalChainReceiverCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports optional-chain last-index access without autofix",
            output: null,
        },
        {
            code: inlineInvalidReturnLikeCode,
            errors: [
                {
                    messageId: "preferTsExtrasArrayLast",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasArrayLast",
                            output: inlineInvalidReturnLikeSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports return-position last-index access without autofix",
            output: null,
        },
        {
            code: inlineInvalidSideEffectfulObjectCode,
            errors: [
                {
                    messageId: "preferTsExtrasArrayLast",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasArrayLast",
                            output: inlineInvalidSideEffectfulObjectSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports side-effectful duplicate-evaluation pattern without autofix",
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
            code: readTypedFixture(patternValidFixtureName),
            filename: typedFixturePath(patternValidFixtureName),
            name: "accepts fixture pattern-safe variants",
        },
        {
            code: inlineValidDeleteWriteTargetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores delete write-target last index usage",
        },
        {
            code: inlineValidNonLiteralOffsetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores last-index arithmetic when right operand is not the literal 1",
        },
        {
            code: inlineValidSuperLastIndexCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores super-based last-index reads",
        },
    ],
});
