/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-safe-cast-to.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import ts from "typescript";
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

const validFixtureName = "prefer-ts-extras-safe-cast-to.valid.ts";
const invalidFixtureName = "prefer-ts-extras-safe-cast-to.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const nonAssignableAsExpressionValidCode = [
    "declare const rawValue: unknown;",
    "const parsed = rawValue as string;",
    "String(parsed);",
].join("\n");
const nonAssignableTypeAssertionValidCode = [
    "declare const rawValue: unknown;",
    "const parsed = <string>rawValue;",
    "String(parsed);",
].join("\n");
const ignoredAnyAnnotationValidCode = [
    'const rawValue = "alpha";',
    "const castValue = rawValue as any;",
    "String(castValue);",
].join("\n");
const ignoredNeverAnnotationValidCode = [
    "declare const neverValue: never;",
    "const castValue = neverValue as never;",
    "String(castValue);",
].join("\n");
const ignoredUnknownAnnotationValidCode = [
    'const rawValue = "alpha";',
    "const castValue = rawValue as unknown;",
    "String(castValue);",
].join("\n");
const ignoredAnyAliasAnnotationValidCode = [
    "type UnsafeAny = any;",
    'const rawValue = "alpha";',
    "const castValue = rawValue as UnsafeAny;",
    "String(castValue);",
].join("\n");
const ignoredNeverAliasAnnotationValidCode = [
    "type Impossible = never;",
    "declare const neverValue: never;",
    "const castValue = neverValue as Impossible;",
    "String(castValue);",
].join("\n");
const ignoredUnknownAliasAnnotationValidCode = [
    "type UnknownAlias = unknown;",
    'const rawValue = "alpha";',
    "const castValue = rawValue as UnknownAlias;",
    "String(castValue);",
].join("\n");
const inlineFixableCode = [
    'import { safeCastTo } from "ts-extras";',
    "",
    "const fallback = {} as Partial<{ value: number }>;",
    "",
    "String(fallback.value);",
].join("\n");
const inlineFixableOutput = [
    'import { safeCastTo } from "ts-extras";',
    "",
    "const fallback = safeCastTo<Partial<{ value: number }>>({});",
    "",
    "String(fallback.value);",
].join("\n");
const fixtureInvalidOutput = [
    "type Payload = {",
    "    id: number;",
    "    name: string;",
    "};",
    "",
    'const nameLiteral = "Alice";',
    "const nameValue = safeCastTo<string>(nameLiteral);",
    "",
    "const numberLiteral = 42;",
    "const numberValue = <number>numberLiteral;",
    "",
    "const payloadLiteral = {",
    "    id: 1,",
    '    name: "alpha",',
    "};",
    "const payloadValue = payloadLiteral as Payload;",
    "",
    "String(nameValue);",
    "String(numberValue);",
    "String(payloadValue);",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings = `import { safeCastTo } from "ts-extras";\n${fixtureInvalidOutput}\r\n`;
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
            `Expected prefer-ts-extras-safe-cast-to fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureInvalidSecondPassOutputWithMixedLineEndings = replaceOrThrow({
    replacement:
        "const payloadValue = safeCastTo<Payload>(payloadLiteral);\r\n",
    sourceText: replaceOrThrow({
        replacement:
            "const numberValue = safeCastTo<number>(numberLiteral);\r\n",
        sourceText: fixtureInvalidOutputWithMixedLineEndings,
        target: "const numberValue = <number>numberLiteral;\r\n",
    }),
    target: "const payloadValue = payloadLiteral as Payload;\r\n",
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type AssertionSyntax = "asExpression" | "typeAssertion";

type ExpressionTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

type SafeCastFixFactoryArguments = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
}>;

type TargetTypeTemplateId =
    | "partialObject"
    | "readonlyArray"
    | "stringKeyword"
    | "unionLiteral";

const assertionSyntaxArbitrary = fc.constantFrom(
    "asExpression",
    "typeAssertion"
);

const expressionTemplateIdArbitrary = fc.constantFrom(
    "identifier",
    "memberExpression",
    "callExpression",
    "parenthesizedIdentifier"
);

const targetTypeTemplateIdArbitrary = fc.constantFrom(
    "stringKeyword",
    "partialObject",
    "readonlyArray",
    "unionLiteral"
);

const ignoredKeywordTypeArbitrary = fc.constantFrom("any", "never", "unknown");

const buildExpressionTemplate = (
    templateId: ExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ['declare const rawValue: "alpha";'],
            expressionText: "rawValue",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                'declare const holder: { readonly current: "alpha" };',
            ],
            expressionText: "holder.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: ['declare function readValue(): "alpha";'],
            expressionText: "readValue()",
        };
    }

    return {
        declarations: ['declare const rawValue: "alpha";'],
        expressionText: "(rawValue)",
    };
};

const buildTargetTypeText = (templateId: TargetTypeTemplateId): string => {
    if (templateId === "stringKeyword") {
        return "string";
    }

    if (templateId === "partialObject") {
        return "Partial<{ readonly value: string }>";
    }

    if (templateId === "readonlyArray") {
        return "ReadonlyArray<string>";
    }

    return '"alpha" | "beta"';
};

const buildAssertionInitializerText = ({
    assertionSyntax,
    expressionText,
    targetTypeText,
}: Readonly<{
    assertionSyntax: AssertionSyntax;
    expressionText: string;
    targetTypeText: string;
}>): string =>
    assertionSyntax === "asExpression"
        ? `${expressionText} as ${targetTypeText}`
        : `<${targetTypeText}>${expressionText}`;

const parseAssertionFromCode = (
    sourceText: string
): Readonly<{
    annotationText: string;
    assertionNode: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion;
    assertionRange: readonly [number, number];
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    expressionText: string;
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsedResult.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.TSAsExpression ||
                    declaration.init?.type === AST_NODE_TYPES.TSTypeAssertion
                ) {
                    const assertionNode = declaration.init;

                    return {
                        annotationText: sourceText.slice(
                            assertionNode.typeAnnotation.range[0],
                            assertionNode.typeAnnotation.range[1]
                        ),
                        assertionNode,
                        assertionRange: assertionNode.range,
                        ast: parsedResult.ast,
                        expressionText: sourceText.slice(
                            assertionNode.expression.range[0],
                            assertionNode.expression.range[1]
                        ),
                    };
                }
            }
        }
    }

    throw new Error("Expected generated code to include a type assertion");
};

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

    const nodeRange = (node as Readonly<{ range?: readonly [number, number] }>)
        .range;

    if (!nodeRange) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-safe-cast-to", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras safeCastTo for assignable type assertions instead of direct `as` casts.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasSafeCastTo:
            "Prefer `safeCastTo<T>(value)` from `ts-extras` over direct `as` assertions when the cast is already type-safe.",
    },
    name: "prefer-ts-extras-safe-cast-to",
});

describe("prefer-ts-extras-safe-cast-to internal listener guards", () => {
    it("skips reporting when parser services return a non-TypeNode annotation mapping", async () => {
        const reportCalls: { messageId?: string }[] = [];
        const expressionNode = {
            name: "value",
            type: "Identifier",
        };
        const annotationNode = {
            type: "TSStringKeyword",
        };

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({ flags: 0 }),
                        getTypeFromTypeNode: () => ({ flags: 0 }),
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get(node: unknown) {
                                if (node === expressionNode) {
                                    return {
                                        kind: 0,
                                    };
                                }

                                return {
                                    kind: -1,
                                    notATypeNode: true,
                                };
                            },
                        },
                    },
                }),
                isTypeAssignableTo: () => true,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix: () => null,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-safe-cast-to")) as {
                    default: {
                        create: (context: unknown) => {
                            TSAsExpression?: (node: unknown) => void;
                        };
                    };
                };

            const fallbackChecker = {
                getTypeAtLocation: () => ({ flags: 0 }),
                getTypeFromTypeNode: () => ({ flags: 0 }),
                isTypeAssignableTo: () => true,
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "value",
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get(node: unknown) {
                                if (node === expressionNode) {
                                    return ts.factory.createIdentifier("value");
                                }

                                return {
                                    kind: -1,
                                    notATypeNode: true,
                                };
                            },
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            listeners.TSAsExpression?.({
                expression: expressionNode,
                type: "TSAsExpression",
                typeAnnotation: annotationNode,
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("skips reporting when parser services cannot map the assertion expression node", async () => {
        const reportCalls: { messageId?: string }[] = [];
        const getTypeAtLocation = vi.fn(() => ({ flags: 0 }));
        const expressionNode = {
            name: "value",
            type: "Identifier",
        };
        const annotationNode = {
            type: "TSStringKeyword",
        };

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation,
                        getTypeFromTypeNode: () => ({ flags: 0 }),
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get(node: unknown) {
                                if (node === expressionNode) {
                                    return undefined;
                                }

                                return ts.factory.createKeywordTypeNode(
                                    ts.SyntaxKind.StringKeyword
                                );
                            },
                        },
                    },
                }),
                isTypeAssignableTo: () => true,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix: () => null,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-safe-cast-to")) as {
                    default: {
                        create: (context: unknown) => {
                            TSAsExpression?: (node: unknown) => void;
                        };
                    };
                };

            const fallbackChecker = {
                getTypeAtLocation,
                getTypeFromTypeNode: () => ({ flags: 0 }),
                isTypeAssignableTo: () => true,
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                languageOptions: {
                    parser: {
                        meta: {
                            name: "@typescript-eslint/parser",
                        },
                    },
                },
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "value",
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get(node: unknown) {
                                if (node === expressionNode) {
                                    return undefined;
                                }

                                return ts.factory.createKeywordTypeNode(
                                    ts.SyntaxKind.StringKeyword
                                );
                            },
                        },
                        program: {
                            getTypeChecker: () => fallbackChecker,
                        },
                        tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
                    },
                },
            });

            listeners.TSAsExpression?.({
                expression: expressionNode,
                type: "TSAsExpression",
                typeAnnotation: annotationNode,
            });

            expect(reportCalls).toHaveLength(0);
            expect(getTypeAtLocation).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-safe-cast-to fast-check fix safety", () => {
    it("fast-check: assignable assertions report and generate parseable safeCastTo replacements", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: SafeCastFixFactoryArguments): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({ flags: 0 }),
                        getTypeFromTypeNode: () => ({ flags: 0 }),
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get(node: unknown) {
                                const nodeType =
                                    typeof node === "object" && node !== null
                                        ? (node as Readonly<{ type?: unknown }>)
                                              .type
                                        : undefined;

                                if (
                                    typeof nodeType === "string" &&
                                    nodeType.startsWith("TS")
                                ) {
                                    return ts.factory.createKeywordTypeNode(
                                        ts.SyntaxKind.StringKeyword
                                    );
                                }

                                return ts.factory.createIdentifier("rawValue");
                            },
                        },
                    },
                }),
                isTypeAssignableTo: () => true,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map<string, ReadonlySet<string>>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-safe-cast-to")) as {
                    default: {
                        create: (context: unknown) => {
                            TSAsExpression?: (node: unknown) => void;
                            TSTypeAssertion?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    assertionSyntaxArbitrary,
                    expressionTemplateIdArbitrary,
                    targetTypeTemplateIdArbitrary,
                    fc.boolean(),
                    (
                        assertionSyntax,
                        expressionTemplateId,
                        targetTypeTemplateId,
                        includeUnicodeNoiseLine
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const expressionTemplate =
                            buildExpressionTemplate(expressionTemplateId);
                        const targetTypeText =
                            buildTargetTypeText(targetTypeTemplateId);
                        const assertionInitializerText =
                            buildAssertionInitializerText({
                                assertionSyntax,
                                expressionText:
                                    expressionTemplate.expressionText,
                                targetTypeText,
                            });
                        const code = [
                            'import { safeCastTo } from "ts-extras";',
                            ...expressionTemplate.declarations,
                            includeUnicodeNoiseLine
                                ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                                : "",
                            `const castValue = ${assertionInitializerText};`,
                            "String(castValue);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            annotationText,
                            assertionNode,
                            assertionRange,
                            ast,
                            expressionText,
                        } = parseAssertionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const fallbackChecker = {
                            getTypeAtLocation: () => ({ flags: 0 }),
                            getTypeFromTypeNode: () => ({ flags: 0 }),
                            isTypeAssignableTo: () => true,
                        };

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            languageOptions: {
                                parser: {
                                    meta: {
                                        name: "@typescript-eslint/parser",
                                    },
                                },
                            },
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                                parserServices: {
                                    esTreeNodeToTSNodeMap: {
                                        get(node: unknown) {
                                            const nodeType =
                                                typeof node === "object" &&
                                                node !== null
                                                    ? (
                                                          node as Readonly<{
                                                              type?: unknown;
                                                          }>
                                                      ).type
                                                    : undefined;

                                            if (
                                                typeof nodeType === "string" &&
                                                nodeType.startsWith("TS")
                                            ) {
                                                return ts.factory.createKeywordTypeNode(
                                                    ts.SyntaxKind.StringKeyword
                                                );
                                            }

                                            return ts.factory.createIdentifier(
                                                "rawValue"
                                            );
                                        },
                                    },
                                    program: {
                                        getTypeChecker: () => fallbackChecker,
                                    },
                                    tsNodeToESTreeNodeMap: new WeakMap<
                                        object,
                                        object
                                    >(),
                                },
                            },
                        });

                        if (
                            assertionNode.type === AST_NODE_TYPES.TSAsExpression
                        ) {
                            listeners.TSAsExpression?.(assertionNode);
                        } else {
                            listeners.TSTypeAssertion?.(assertionNode);
                        }

                        expect(reportCalls).toHaveLength(1);

                        const [firstReport] = reportCalls;

                        expect(firstReport).toBeDefined();

                        if (!firstReport) {
                            throw new TypeError(
                                "Expected first prefer-ts-extras-safe-cast-to report"
                            );
                        }

                        expect(firstReport).toMatchObject({
                            messageId: "preferTsExtrasSafeCastTo",
                        });

                        let replacementText = "";

                        const fixArguments:
                            | SafeCastFixFactoryArguments
                            | undefined =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        if (fixArguments) {
                            expect(
                                createSafeValueNodeTextReplacementFixMock
                            ).toHaveBeenCalledTimes(1);

                            replacementText =
                                fixArguments.replacementTextFactory(
                                    "safeCastTo"
                                );
                        } else {
                            const reportFixCandidate: unknown = firstReport.fix;

                            if (typeof reportFixCandidate !== "function") {
                                throw new TypeError(
                                    "Expected report fix to be a function when mock-based fix factory is bypassed"
                                );
                            }

                            const reportFix = reportFixCandidate as (
                                fixer: Readonly<{
                                    replaceText: (
                                        node: unknown,
                                        text: string
                                    ) => unknown;
                                }>
                            ) => unknown;

                            reportFix({
                                replaceText: (_node: unknown, text: string) => {
                                    replacementText = text;

                                    return null;
                                },
                            });
                        }

                        expect(replacementText).toBe(
                            `safeCastTo<${annotationText}>(${expressionText})`
                        );

                        const fixedCode =
                            code.slice(0, assertionRange[0]) +
                            replacementText +
                            code.slice(assertionRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: ignored assertion targets do not report or request fixes", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: SafeCastFixFactoryArguments): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({ flags: 0 }),
                        getTypeFromTypeNode: () => ({ flags: 0 }),
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () =>
                                ts.factory.createKeywordTypeNode(
                                    ts.SyntaxKind.StringKeyword
                                ),
                        },
                    },
                }),
                isTypeAssignableTo: () => true,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map<string, ReadonlySet<string>>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-safe-cast-to")) as {
                    default: {
                        create: (context: unknown) => {
                            TSAsExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    ignoredKeywordTypeArbitrary,
                    fc.boolean(),
                    (ignoredAnnotationKeyword, includeUnicodeNoiseLine) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const code = [
                            'declare const rawValue: "alpha";',
                            includeUnicodeNoiseLine
                                ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                                : "",
                            `const castValue = rawValue as ${ignoredAnnotationKeyword};`,
                            "String(castValue);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { assertionNode, ast } =
                            parseAssertionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const fallbackChecker = {
                            getTypeAtLocation: () => ({ flags: 0 }),
                            getTypeFromTypeNode: () => ({ flags: 0 }),
                            isTypeAssignableTo: () => true,
                        };

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            languageOptions: {
                                parser: {
                                    meta: {
                                        name: "@typescript-eslint/parser",
                                    },
                                },
                            },
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                                parserServices: {
                                    esTreeNodeToTSNodeMap: {
                                        get: () =>
                                            ts.factory.createKeywordTypeNode(
                                                ts.SyntaxKind.StringKeyword
                                            ),
                                    },
                                    program: {
                                        getTypeChecker: () => fallbackChecker,
                                    },
                                    tsNodeToESTreeNodeMap: new WeakMap<
                                        object,
                                        object
                                    >(),
                                },
                            },
                        });

                        if (
                            assertionNode.type === AST_NODE_TYPES.TSAsExpression
                        ) {
                            listeners.TSAsExpression?.(assertionNode);
                        }

                        expect(reportCalls).toHaveLength(0);
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).not.toHaveBeenCalled();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-safe-cast-to",
    getPluginRule("prefer-ts-extras-safe-cast-to"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasSafeCastTo" },
                    { messageId: "preferTsExtrasSafeCastTo" },
                    { messageId: "preferTsExtrasSafeCastTo" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture unsafe cast assertions",
                output: [
                    fixtureInvalidOutputWithMixedLineEndings,
                    fixtureInvalidSecondPassOutputWithMixedLineEndings,
                ],
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasSafeCastTo" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes safe cast assertion when safeCastTo import is in scope",
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
                code: nonAssignableAsExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-assignable as-expression assertion",
            },
            {
                code: nonAssignableTypeAssertionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-assignable angle-bracket assertion",
            },
            {
                code: ignoredAnyAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting any",
            },
            {
                code: ignoredNeverAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting never",
            },
            {
                code: ignoredUnknownAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting unknown",
            },
            {
                code: ignoredAnyAliasAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting aliases to any",
            },
            {
                code: ignoredNeverAliasAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting aliases to never",
            },
            {
                code: ignoredUnknownAliasAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting aliases to unknown",
            },
        ],
    }
);
