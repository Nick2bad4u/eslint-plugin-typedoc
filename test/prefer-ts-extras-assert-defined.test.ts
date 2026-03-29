/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-defined.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    alternateValidCode,
    emptyConsequentValidCode,
    inlineAutofixableCanonicalCode,
    inlineAutofixableCanonicalOutput,
    inlineAutofixableCanonicalUnicodeRichCode,
    inlineAutofixableCanonicalUnicodeRichOutput,
    inlineAutofixableDirectThrowCanonicalCode,
    inlineInvalidDirectThrowConsequentCode,
    inlineInvalidSuggestionOutputCode,
    inlineSuggestableCode,
    inlineSuggestableOutput,
    inlineSuggestableSpreadArgumentCode,
    inlineSuggestableSpreadArgumentOutput,
    inlineSuggestableTooManyArgsCode,
    inlineSuggestableWrongConstructorCode,
    invalidFixtureCode,
    invalidFixtureName,
    looseEqualityInvalidCode,
    nonBinaryGuardValidCode,
    nonThrowOnlyValidCode,
    nonThrowSingleStatementBlockValidCode,
    nonUndefinedValidCode,
    shadowedTypeErrorSuggestableCode,
    shadowedTypeErrorSuggestableOutput,
    shadowedUndefinedBindingValidCode,
    throwThenSideEffectValidCode,
    undefinedOnLeftInvalidCode,
    validFixtureCode,
    validFixtureName,
} from "./_internal/prefer-ts-extras-assert-defined-cases";
import {
    buildGuardExpressionTemplate,
    buildNonCanonicalThrowText,
    buildUndefinedComparisonText,
    getSourceTextForNode,
    guardComparisonOrientationArbitrary,
    guardExpressionTemplateIdArbitrary,
    nonCanonicalThrowTemplateIdArbitrary,
    parseIfStatementFromCode,
    parserOptions,
} from "./_internal/prefer-ts-extras-assert-defined-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    typedFixturePath,
    warmTypedParserServices,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-defined");
const ruleTester = createTypedRuleTester();

type AssertDefinedFixFactoryArgs = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
}>;

const fixtureSafePatternsValidCase = {
    code: validFixtureCode,
    filename: typedFixturePath(validFixtureName),
    name: "accepts fixture-safe patterns",
} as const;

warmTypedParserServices(typedFixturePath(validFixtureName), validFixtureCode);

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-assert-defined", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras assertDefined over manual undefined-guard throw blocks.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasAssertDefined:
            "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks.",
        suggestTsExtrasAssertDefined:
            "Replace this manual guard with `assertDefined(...)` from `ts-extras`.",
    },
    name: "prefer-ts-extras-assert-defined",
});

describe("prefer-ts-extras-assert-defined metadata assertions", () => {
    it("retains hasSuggestions metadata for assert-defined", () => {
        expect(rule.meta?.hasSuggestions).toBeTruthy();
    });
});

describe("prefer-ts-extras-assert-defined runtime safety assertions", () => {
    it("handles defensive consequent re-evaluation branch when synthetic AST nodes drift across reads", async () => {
        try {
            vi.resetModules();

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set(["assertDefined"]),
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

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            const sourceText = [
                "function ensureValue(value: string | undefined): string {",
                "    if (value === undefined) {",
                "        throw new TypeError('Expected a defined value, got `undefined`');",
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

            const ifStatementNode = declaration.body.body[0];
            const originalConsequent = ifStatementNode.consequent;
            let consequentReadCount = 0;

            Object.defineProperty(ifStatementNode, "consequent", {
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
                    "fixtures/typed/prefer-ts-extras-assert-defined.invalid.ts",
                report,
                sourceCode: {
                    ast: parsed.ast,
                    getText: () => "value",
                },
            });

            listenerMap.IfStatement?.(ifStatementNode);

            expect(report).toHaveBeenCalledTimes(1);
            expect(
                (report.mock.calls[0]?.[0] as { suggest?: unknown }).suggest
            ).toBeDefined();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-assert-defined fast-check fix safety", () => {
    it("fast-check: canonical undefined guards report autofixes with parseable assertDefined replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: AssertDefinedFixFactoryArgs): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

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

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    guardExpressionTemplateIdArbitrary,
                    guardComparisonOrientationArbitrary,
                    fc.constantFrom("==", "==="),
                    fc.boolean(),
                    (
                        guardTemplateId,
                        comparisonOrientation,
                        comparisonOperator,
                        includeUnicodeNoiseLine
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const guardTemplate =
                            buildGuardExpressionTemplate(guardTemplateId);
                        const comparisonText = buildUndefinedComparisonText({
                            expressionText: guardTemplate.expressionText,
                            operator: comparisonOperator,
                            orientation: comparisonOrientation,
                        });
                        const code = [
                            'import { assertDefined } from "ts-extras";',
                            ...guardTemplate.declarations,
                            includeUnicodeNoiseLine
                                ? 'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                                : "",
                            "",
                            "function ensureValue(): void {",
                            `    if (${comparisonText}) {`,
                            "        throw new TypeError('Expected a defined value, got `undefined`');",
                            "    }",
                            "}",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            guardExpressionText,
                            ifStatement,
                            ifStatementRange,
                        } = parseIfStatementFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                            suggest?: readonly unknown[];
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                    suggest?: readonly unknown[];
                                }>
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

                        listeners.IfStatement?.(ifStatement);

                        expect(reportCalls).toHaveLength(1);

                        const [firstReport] = reportCalls;

                        expect(firstReport).toBeDefined();

                        if (!firstReport) {
                            throw new TypeError(
                                "Expected first prefer-ts-extras-assert-defined report"
                            );
                        }

                        expect(firstReport).toMatchObject({
                            messageId: "preferTsExtrasAssertDefined",
                        });
                        expect(firstReport.suggest).toBeUndefined();

                        let replacementText = "";

                        const fixArguments:
                            | AssertDefinedFixFactoryArgs
                            | undefined =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        if (fixArguments) {
                            expect(
                                createSafeValueNodeTextReplacementFixMock
                            ).toHaveBeenCalledTimes(1);

                            replacementText =
                                fixArguments.replacementTextFactory(
                                    "assertDefined"
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
                            `assertDefined(${guardExpressionText});`
                        );

                        const fixedCode =
                            code.slice(0, ifStatementRange[0]) +
                            replacementText +
                            code.slice(ifStatementRange[1]);

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

    it("fast-check: non-canonical throw shapes report suggestions with parseable assertDefined replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: AssertDefinedFixFactoryArgs): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

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

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    guardExpressionTemplateIdArbitrary,
                    guardComparisonOrientationArbitrary,
                    fc.constantFrom("==", "==="),
                    nonCanonicalThrowTemplateIdArbitrary,
                    (
                        guardTemplateId,
                        comparisonOrientation,
                        comparisonOperator,
                        throwTemplateId
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const guardTemplate =
                            buildGuardExpressionTemplate(guardTemplateId);
                        const comparisonText = buildUndefinedComparisonText({
                            expressionText: guardTemplate.expressionText,
                            operator: comparisonOperator,
                            orientation: comparisonOrientation,
                        });
                        const code = [
                            'import { assertDefined } from "ts-extras";',
                            ...guardTemplate.declarations,
                            "",
                            "function ensureValue(): void {",
                            `    if (${comparisonText}) {`,
                            `        ${buildNonCanonicalThrowText(throwTemplateId)}`,
                            "    }",
                            "}",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            guardExpressionText,
                            ifStatement,
                            ifStatementRange,
                        } = parseIfStatementFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                            suggest?: readonly Readonly<{
                                fix?: unknown;
                                messageId?: string;
                            }>[];
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                    suggest?: readonly Readonly<{
                                        fix?: unknown;
                                        messageId?: string;
                                    }>[];
                                }>
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

                        listeners.IfStatement?.(ifStatement);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertDefined",
                        });
                        expect(reportCalls[0]?.fix).toBeUndefined();
                        expect(reportCalls[0]?.suggest).toHaveLength(1);

                        const firstSuggestion = reportCalls[0]?.suggest?.[0];

                        expect(firstSuggestion).toMatchObject({
                            messageId: "suggestTsExtrasAssertDefined",
                        });

                        if (
                            createSafeValueNodeTextReplacementFixMock.mock.calls
                                .length > 0
                        ) {
                            expect(
                                createSafeValueNodeTextReplacementFixMock
                            ).toHaveBeenCalledTimes(1);
                        }

                        const fixArguments:
                            | AssertDefinedFixFactoryArgs
                            | undefined =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        let replacementText = "";

                        if (fixArguments) {
                            replacementText =
                                fixArguments.replacementTextFactory(
                                    "assertDefined"
                                );
                        } else {
                            const suggestionFixCandidate: unknown =
                                firstSuggestion?.fix;

                            if (typeof suggestionFixCandidate !== "function") {
                                throw new TypeError(
                                    "Expected suggestion fix to be a function when mock-based fix factory is bypassed"
                                );
                            }

                            const suggestionFix = suggestionFixCandidate as (
                                fixer: Readonly<{
                                    replaceText: (
                                        node: unknown,
                                        text: string
                                    ) => unknown;
                                }>
                            ) => unknown;

                            suggestionFix({
                                replaceText: (_node: unknown, text: string) => {
                                    replacementText = text;

                                    return null;
                                },
                            });
                        }

                        expect(replacementText).toBe(
                            `assertDefined(${guardExpressionText});`
                        );

                        const suggestedCode =
                            code.slice(0, ifStatementRange[0]) +
                            replacementText +
                            code.slice(ifStatementRange[1]);

                        expect(() => {
                            parser.parseForESLint(suggestedCode, parserOptions);
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
});

describe(
    "prefer-ts-extras-assert-defined RuleTester fixture validity",
    {
        timeout: 120_000,
    },
    () => {
        ruleTester.run(
            "prefer-ts-extras-assert-defined fixture validity",
            rule,
            {
                invalid: [],
                valid: [fixtureSafePatternsValidCase],
            }
        );
    }
);

ruleTester.run("prefer-ts-extras-assert-defined", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture guards against undefined",
        },
        {
            code: undefinedOnLeftInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict undefined guard with literal on left",
        },
        {
            code: looseEqualityInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality undefined guard",
        },
        {
            code: inlineInvalidDirectThrowConsequentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct-throw consequent guard",
        },
        {
            code: inlineSuggestableWrongConstructorCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when canonical message uses non-TypeError constructor",
        },
        {
            code: inlineSuggestableTooManyArgsCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError call has multiple arguments",
        },
        {
            code: inlineSuggestableSpreadArgumentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableSpreadArgumentOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError call spreads message arguments",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests assertDefined() replacement when import is in scope",
        },
        {
            code: shadowedTypeErrorSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: shadowedTypeErrorSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError constructor is shadowed",
        },
        {
            code: inlineAutofixableCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical undefined guard throw when assertDefined import is in scope",
            output: inlineAutofixableCanonicalOutput,
        },
        {
            code: inlineAutofixableDirectThrowCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes direct-throw canonical undefined guard",
            output: inlineAutofixableCanonicalOutput,
        },
        {
            code: inlineAutofixableCanonicalUnicodeRichCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical undefined guard in unicode-rich source text",
            output: inlineAutofixableCanonicalUnicodeRichOutput,
        },
    ],
    valid: [
        {
            code: nonUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores null-only comparison",
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard with extra side-effect statement",
        },
        {
            code: nonThrowSingleStatementBlockValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores single-statement block consequents that are not throws",
        },
        {
            code: throwThenSideEffectValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores multi-statement blocks even when the first statement throws",
        },
        {
            code: alternateValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard that includes else branch",
        },
        {
            code: nonBinaryGuardValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-binary guard expression",
        },
        {
            code: emptyConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined guard with an empty consequent",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guards that compare against shadowed undefined bindings",
        },
    ],
});
