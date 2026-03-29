/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import type {
    ReplaceTextOnlyFixer,
    ReportDescriptor,
} from "./_internal/prefer-ts-extras-assert-present-runtime-harness";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { createAssertPresentRuleTesterCases } from "./_internal/prefer-ts-extras-assert-present-rule-cases";
import {
    assertIsFixFunction,
    buildAssertPresentGuardCode,
    buildCanonicalThrowText,
    buildNonCanonicalThrowText,
    canonicalGuardTemplateIdArbitrary,
    getSourceTextForNode,
    nonCanonicalThrowTemplateIdArbitrary,
    parseEnsureValueIfStatementFromCode,
    parserOptions,
    variableNameArbitrary,
} from "./_internal/prefer-ts-extras-assert-present-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-present");
const ruleTester = createTypedRuleTester();
const { invalid: invalidRuleTesterCases, valid: validRuleTesterCases } =
    createAssertPresentRuleTesterCases({ typedFixturePath });

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-assert-present", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras assertPresent over manual nullish-guard throw blocks.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasAssertPresent:
            "Prefer `assertPresent` from `ts-extras` over manual nullish guard throw blocks.",
        suggestTsExtrasAssertPresent:
            "Replace this manual guard with `assertPresent(...)` from `ts-extras`.",
    },
    name: "prefer-ts-extras-assert-present",
});

describe("prefer-ts-extras-assert-present runtime safety assertions", () => {
    it("handles defensive nullish-guard branches for synthetic AST drift", async () => {
        try {
            vi.resetModules();

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set(["assertPresent"]),
                    createSafeValueNodeTextReplacementFix: () => () => [],
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

            vi.doMock(
                import("../src/_internal/normalize-expression-text.js"),
                () => ({
                    areEquivalentExpressions: () => true,
                })
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-present")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            const sourceText = [
                "function ensureValue(value: string | null): string {",
                "    if (value == null) {",
                "        throw new TypeError(`Expected a present value, got ${" +
                    "value}`);",
                "    }",
                "",
                "    return value;",
                "}",
            ].join("\n");

            const parsed = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const [declaration] = parsed.ast.body;
            if (
                declaration?.type !== AST_NODE_TYPES.FunctionDeclaration ||
                declaration.body.body[0]?.type !== AST_NODE_TYPES.IfStatement
            ) {
                throw new Error(
                    "Expected function declaration containing IfStatement"
                );
            }

            const driftIfStatementNode = declaration.body.body[0];
            const originalConsequent = driftIfStatementNode.consequent;
            let consequentReadCount = 0;

            Object.defineProperty(driftIfStatementNode, "consequent", {
                configurable: true,
                get() {
                    consequentReadCount += 1;

                    if (consequentReadCount === 1) {
                        return originalConsequent;
                    }

                    if (
                        originalConsequent.type !==
                        AST_NODE_TYPES.BlockStatement
                    ) {
                        return originalConsequent;
                    }

                    return {
                        ...originalConsequent,
                        body: [undefined],
                    };
                },
            });

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-assert-present.invalid.ts",
                report,
                sourceCode: {
                    ast: parsed.ast,
                    getText: () => "value",
                },
            });

            listenerMap.IfStatement?.(driftIfStatementNode);

            const parsedCanonical = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });
            const [canonicalDeclaration] = parsedCanonical.ast.body;
            if (
                canonicalDeclaration?.type !==
                    AST_NODE_TYPES.FunctionDeclaration ||
                canonicalDeclaration.body.body[0]?.type !==
                    AST_NODE_TYPES.IfStatement
            ) {
                throw new Error(
                    "Expected function declaration containing canonical IfStatement"
                );
            }

            const canonicalIfStatementNode = canonicalDeclaration.body.body[0];
            if (
                canonicalIfStatementNode.type !== AST_NODE_TYPES.IfStatement ||
                canonicalIfStatementNode.consequent.type !==
                    AST_NODE_TYPES.BlockStatement
            ) {
                throw new Error(
                    "Expected block consequent for canonical mutation test"
                );
            }

            const throwStatement = canonicalIfStatementNode.consequent.body[0];
            if (
                throwStatement?.type !== AST_NODE_TYPES.ThrowStatement ||
                throwStatement.argument.type !== AST_NODE_TYPES.NewExpression
            ) {
                throw new Error(
                    "Expected throw new TypeError(...) in canonical branch"
                );
            }

            const [firstArgument] = throwStatement.argument.arguments;
            if (firstArgument?.type !== AST_NODE_TYPES.TemplateLiteral) {
                throw new Error(
                    "Expected template literal TypeError message argument"
                );
            }

            firstArgument.expressions = [
                undefined,
            ] as unknown as typeof firstArgument.expressions;

            listenerMap.IfStatement?.(canonicalIfStatementNode);

            expect(report).toHaveBeenCalledTimes(2);
            expect(
                (report.mock.calls[0]?.[0] as { suggest?: unknown }).suggest
            ).toBeDefined();
            expect(
                (report.mock.calls[1]?.[0] as { suggest?: unknown }).suggest
            ).toBeDefined();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-assert-present fast-check fix safety", () => {
    it("fast-check: canonical throw guards report direct autofixes that stay parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
            }));

            vi.doMock(
                import("../src/_internal/normalize-expression-text.js"),
                () => ({
                    areEquivalentExpressions: () => true,
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set(["assertPresent"]),
                    createSafeValueNodeTextReplacementFix:
                        (
                            options: Readonly<{
                                replacementTextFactory: (
                                    replacementName: string
                                ) => string;
                                targetNode: unknown;
                            }>
                        ) =>
                        (fixer: ReplaceTextOnlyFixer) =>
                            fixer.replaceText(
                                options.targetNode,
                                options.replacementTextFactory("assertPresent")
                            ),
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
                (await import("../src/rules/prefer-ts-extras-assert-present")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    canonicalGuardTemplateIdArbitrary,
                    variableNameArbitrary,
                    fc.boolean(),
                    (guardTemplateId, variableName, includeUnicodeBanner) => {
                        const guardCode = buildAssertPresentGuardCode({
                            guardTemplateId,
                            includeUnicodeBanner,
                            throwText: buildCanonicalThrowText(variableName),
                            variableName,
                            withSpreadMessageParts: false,
                        });
                        const code = [
                            'import { assertPresent } from "ts-extras";',
                            guardCode,
                        ].join("\n");
                        const { ast, ifNode } =
                            parseEnsureValueIfStatementFromCode(code);
                        const reportCalls: ReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report(descriptor: ReportDescriptor) {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,

                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifNode);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertPresent",
                        });

                        const directFix = reportCalls[0]?.fix;
                        const suggestionFix = reportCalls[0]?.suggest?.[0]?.fix;
                        const fixFunction: unknown = directFix ?? suggestionFix;

                        expect(fixFunction).toBeDefined();

                        if (directFix === undefined) {
                            expect(
                                reportCalls[0]?.suggest?.[0]?.messageId
                            ).toBe("suggestTsExtrasAssertPresent");
                        }

                        assertIsFixFunction(fixFunction);

                        let replacementText = "";

                        fixFunction({
                            replaceText(node, text): unknown {
                                expect(node).toEqual(ifNode);

                                replacementText = text;

                                return text;
                            },
                        });

                        expect(replacementText).toBe(
                            `assertPresent(${variableName});`
                        );

                        const fixedCode =
                            code.slice(0, ifNode.range[0]) +
                            replacementText +
                            code.slice(ifNode.range[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: non-canonical throw guards expose parseable assertPresent suggestions", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
            }));

            vi.doMock(
                import("../src/_internal/normalize-expression-text.js"),
                () => ({
                    areEquivalentExpressions: () => true,
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set(["assertPresent"]),
                    createSafeValueNodeTextReplacementFix:
                        (
                            options: Readonly<{
                                replacementTextFactory: (
                                    replacementName: string
                                ) => string;
                                targetNode: unknown;
                            }>
                        ) =>
                        (fixer: ReplaceTextOnlyFixer) =>
                            fixer.replaceText(
                                options.targetNode,
                                options.replacementTextFactory("assertPresent")
                            ),
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
                (await import("../src/rules/prefer-ts-extras-assert-present")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    canonicalGuardTemplateIdArbitrary,
                    nonCanonicalThrowTemplateIdArbitrary,
                    variableNameArbitrary,
                    fc.boolean(),
                    (
                        guardTemplateId,
                        throwTemplateId,
                        variableName,
                        includeUnicodeBanner
                    ) => {
                        const guardCode = buildAssertPresentGuardCode({
                            guardTemplateId,
                            includeUnicodeBanner,
                            throwText: buildNonCanonicalThrowText({
                                throwTemplateId,
                                variableName,
                            }),
                            variableName,
                            withSpreadMessageParts:
                                throwTemplateId === "spreadArgument",
                        });
                        const code = [
                            'import { assertPresent } from "ts-extras";',
                            guardCode,
                        ].join("\n");
                        const { ast, ifNode } =
                            parseEnsureValueIfStatementFromCode(code);
                        const reportCalls: ReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report(descriptor: ReportDescriptor) {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifNode);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertPresent",
                        });
                        expect(reportCalls[0]?.fix).toBeUndefined();

                        const firstSuggestion = reportCalls[0]?.suggest?.[0];

                        expect(firstSuggestion?.messageId).toBe(
                            "suggestTsExtrasAssertPresent"
                        );
                        expect(firstSuggestion?.fix).toBeDefined();

                        const suggestionFix: unknown = firstSuggestion?.fix;
                        assertIsFixFunction(suggestionFix);

                        let replacementText = "";

                        suggestionFix({
                            replaceText(node, text): unknown {
                                expect(node).toEqual(ifNode);

                                replacementText = text;

                                return text;
                            },
                        });

                        expect(replacementText).toBe(
                            `assertPresent(${variableName});`
                        );

                        const suggestedCode =
                            code.slice(0, ifNode.range[0]) +
                            replacementText +
                            code.slice(ifNode.range[1]);

                        expect(() => {
                            parser.parseForESLint(suggestedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run("prefer-ts-extras-assert-present", rule, {
    invalid: invalidRuleTesterCases as Parameters<
        typeof ruleTester.run
    >[2]["invalid"],
    valid: validRuleTesterCases as Parameters<
        typeof ruleTester.run
    >[2]["valid"],
});
