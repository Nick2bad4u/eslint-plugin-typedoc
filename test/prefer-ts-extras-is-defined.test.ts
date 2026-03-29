/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-defined.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import type {
    IsDefinedRuleReportDescriptor,
    TextEdit,
} from "./_internal/prefer-ts-extras-is-defined-rule-harness";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    filterArrowCallbackValidCode,
    filterFunctionCallbackValidCode,
    inlineAstNodeNegatedInvalidCode,
    inlineFixableDefinedCode,
    inlineFixableDefinedOutput,
    inlineFixableNegatedCode,
    inlineFixableNegatedOutput,
    inlineMapCallbackInvalidCode,
    inlineMapCallbackInvalidOutput,
    inlineTypeofNonIdentifierInvalidCode,
    inlineTypeofNonIdentifierInvalidOutput,
    inlineTypeofReverseInvalidCode,
    inlineTypeofReverseInvalidOutput,
    invalidFixtureCode,
    invalidFixtureName,
    looseUndefinedEqualityValidCode,
    looseUndefinedInequalityValidCode,
    reversedTypeofWithNonTypeofOperatorValidCode,
    shadowedUndefinedBindingValidCode,
    typeofWithNonTypeofOperatorValidCode,
    undeclaredTypeofEqualityValidCode,
    undeclaredTypeofInequalityValidCode,
    validFixtureName,
} from "./_internal/prefer-ts-extras-is-defined-cases";
import {
    applyTextEdits,
    buildUndefinedComparisonExpression,
    createRuleContextForSource,
    identifierNameArbitrary,
    invokeReportFixToTextEdits,
    parserOptions,
    parseUndefinedComparisonFromCode,
    parseVariableInitializerExpressionByName,
    undefinedComparisonOperatorArbitrary,
    undefinedComparisonPatternArbitrary,
} from "./_internal/prefer-ts-extras-is-defined-rule-harness";
import {
    buildRuntimeIsDefinedSourceText,
    executeRuntimeIsDefinedSourceText,
    isRuntimeIsDefinedCase,
    runtimeIsDefinedCaseArbitrary,
} from "./_internal/prefer-ts-extras-is-defined-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-defined";
const docsDescription =
    "require ts-extras isDefined over inline undefined comparisons outside filter callbacks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined";
const preferTsExtrasIsDefinedMessage =
    "Prefer `isDefined(value)` from `ts-extras` over inline undefined comparisons.";
const preferTsExtrasIsDefinedNegatedMessage =
    "Prefer `!isDefined(value)` from `ts-extras` over inline undefined comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();
type IsDefinedReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

type RuleCreateContext = Readonly<Parameters<typeof rule.create>[0]>;

const assertTextEditsDoNotOverlap = (textEdits: readonly TextEdit[]): void => {
    for (const [firstIndex, firstEdit] of textEdits.entries()) {
        for (const [secondIndex, secondEdit] of textEdits.entries()) {
            if (firstIndex < secondIndex) {
                const doNotOverlap =
                    firstEdit.range[1] <= secondEdit.range[0] ||
                    secondEdit.range[1] <= firstEdit.range[0];

                expect(doNotOverlap).toBeTruthy();
            }
        }
    }
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsDefined: preferTsExtrasIsDefinedMessage,
        preferTsExtrasIsDefinedNegated: preferTsExtrasIsDefinedNegatedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-defined metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-defined internal create guards", () => {
    it("uses empty filename fallback when context filename is undefined", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: undefined,
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText: () => "maybeValue",
                },
            });

            const binaryExpressionListener = listeners.BinaryExpression;

            expect(binaryExpressionListener).toBeTypeOf("function");

            binaryExpressionListener?.({
                left: {
                    name: "maybeValue",
                    type: "Identifier",
                },
                operator: "!==",
                right: {
                    name: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]?.messageId).toBe("preferTsExtrasIsDefined");
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("gracefully skips typeof comparisons when scope lookup throws", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-is-defined.invalid.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getScope: (): never => {
                        throw new Error("scope unavailable");
                    },
                    getText: () => "maybeValue",
                },
            });

            listeners.BinaryExpression?.({
                left: {
                    argument: {
                        name: "maybeValue",
                        type: "Identifier",
                    },
                    operator: "typeof",
                    type: "UnaryExpression",
                },
                operator: "!==",
                right: {
                    type: "Literal",
                    value: "undefined",
                },
                type: "BinaryExpression",
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: undefined comparisons report and produce parseable isDefined rewrites", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ): boolean =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix:
                        createSafeValueArgumentFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    identifierNameArbitrary,
                    undefinedComparisonPatternArbitrary,
                    undefinedComparisonOperatorArbitrary,
                    fc.boolean(),
                    (
                        identifierName,
                        comparisonPattern,
                        comparisonOperator,
                        includeUnicodeLine
                    ) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const comparisonExpression =
                            buildUndefinedComparisonExpression({
                                identifierName,
                                operator: comparisonOperator,
                                pattern: comparisonPattern,
                            });
                        const unicodeLine = includeUnicodeLine
                            ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                            : "";
                        const generatedCode = [
                            'import { isDefined } from "ts-extras";',
                            `declare let ${identifierName}: string | undefined;`,
                            unicodeLine,
                            `const comparisonResult = ${comparisonExpression};`,
                            "String(comparisonResult);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, binaryExpression } =
                            parseUndefinedComparisonFromCode(generatedCode);
                        const reports: IsDefinedReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-ts-extras-is-defined.invalid.ts",
                            report: (descriptor: IsDefinedReportDescriptor) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getScope(node: unknown): unknown {
                                    const identifierNameFromNode =
                                        typeof node === "object" &&
                                        node !== null &&
                                        "name" in node
                                            ? (
                                                  node as Readonly<{
                                                      name?: unknown;
                                                  }>
                                              ).name
                                            : undefined;

                                    const normalizedIdentifierName =
                                        typeof identifierNameFromNode ===
                                        "string"
                                            ? identifierNameFromNode
                                            : "";

                                    const defs =
                                        normalizedIdentifierName === "undefined"
                                            ? []
                                            : [{}];

                                    return {
                                        set: new Map([
                                            [
                                                normalizedIdentifierName,
                                                {
                                                    defs,
                                                },
                                            ],
                                        ]),
                                        upper: null,
                                    };
                                },
                                getText(node: unknown): string {
                                    if (
                                        typeof node !== "object" ||
                                        node === null ||
                                        !("range" in node)
                                    ) {
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

                                    return generatedCode.slice(
                                        nodeRange[0],
                                        nodeRange[1]
                                    );
                                },
                            },
                        });

                        const binaryExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "BinaryExpression"
                            );

                        binaryExpressionListener?.(binaryExpression);

                        const isStrictComparisonOperator =
                            comparisonOperator === "!==" ||
                            comparisonOperator === "===";

                        if (!isStrictComparisonOperator) {
                            expect(reports).toHaveLength(0);
                            expect(
                                createSafeValueArgumentFunctionCallFixMock
                            ).not.toHaveBeenCalled();

                            return;
                        }

                        const isNegatedExpected = comparisonOperator === "===";
                        const expectedMessageId = isNegatedExpected
                            ? "preferTsExtrasIsDefinedNegated"
                            : "preferTsExtrasIsDefined";

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            messageId: expectedMessageId,
                        });

                        if (
                            createSafeValueArgumentFunctionCallFixMock.mock
                                .calls.length > 0
                        ) {
                            expect(
                                createSafeValueArgumentFunctionCallFixMock
                            ).toHaveBeenCalledTimes(1);

                            const fixDescriptor =
                                createSafeValueArgumentFunctionCallFixMock.mock
                                    .calls[0]?.[0] as
                                    | undefined
                                    | {
                                          negated?: boolean;
                                      };

                            expect(fixDescriptor?.negated).toBe(
                                isNegatedExpected
                            );
                        } else {
                            const reportFix = reports[0]?.fix;

                            if (reportFix !== undefined) {
                                expect(typeof reportFix).toBe("function");
                            }
                        }

                        const replacementText = isNegatedExpected
                            ? `!isDefined(${identifierName})`
                            : `isDefined(${identifierName})`;
                        const fixedCode = `${generatedCode.slice(0, binaryExpression.range[0])}${replacementText}${generatedCode.slice(binaryExpression.range[1])}`;

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

    it("fast-check: executable undefined comparison autofix preserves runtime behavior and remains second-pass stable", async () => {
        expect.hasAssertions();

        await fc.assert(
            fc.asyncProperty(
                runtimeIsDefinedCaseArbitrary,
                async (generatedCase) => {
                    if (!isRuntimeIsDefinedCase(generatedCase)) {
                        throw new TypeError(
                            "Expected runtime isDefined fast-check case to match RuntimeIsDefinedCase"
                        );
                    }

                    const sourceText =
                        buildRuntimeIsDefinedSourceText(generatedCase);
                    const { ast: firstPassAst, binaryExpression } =
                        parseUndefinedComparisonFromCode(sourceText);
                    const firstPassReports: IsDefinedRuleReportDescriptor[] =
                        [];

                    const firstPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: firstPassAst,
                            reportCalls: firstPassReports,
                            sourceText,
                        }) as RuleCreateContext
                    );

                    firstPassListeners.BinaryExpression?.(binaryExpression);

                    const isStrictComparisonOperator =
                        generatedCase.operator === "!==" ||
                        generatedCase.operator === "===";

                    if (!isStrictComparisonOperator) {
                        expect(firstPassReports).toHaveLength(0);

                        return;
                    }

                    const expectsNegatedHelper =
                        generatedCase.operator === "===";

                    expect(firstPassReports).toHaveLength(1);
                    expect(firstPassReports[0]?.messageId).toBe(
                        expectsNegatedHelper
                            ? "preferTsExtrasIsDefinedNegated"
                            : "preferTsExtrasIsDefined"
                    );

                    const firstPassFix = firstPassReports[0]?.fix;

                    expect(firstPassFix).toBeTypeOf("function");

                    if (firstPassFix === undefined) {
                        throw new Error(
                            "Expected runtime equivalence report to include a fixer"
                        );
                    }

                    const firstPassTextEdits =
                        invokeReportFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(1);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();

                    const originalExecutionSnapshot =
                        await executeRuntimeIsDefinedSourceText(sourceText);
                    const fixedExecutionSnapshot =
                        await executeRuntimeIsDefinedSourceText(
                            firstPassFixedCode
                        );

                    expect(fixedExecutionSnapshot).toStrictEqual(
                        originalExecutionSnapshot
                    );

                    const {
                        ast: secondPassAst,
                        initializer: secondPassInitializer,
                    } = parseVariableInitializerExpressionByName({
                        sourceText: firstPassFixedCode,
                        variableName: "evaluation",
                    });

                    const secondPassReports: IsDefinedRuleReportDescriptor[] =
                        [];
                    const secondPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: secondPassAst,
                            reportCalls: secondPassReports,
                            sourceText: firstPassFixedCode,
                        }) as RuleCreateContext
                    );

                    if (
                        secondPassInitializer.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        secondPassListeners.BinaryExpression?.(
                            secondPassInitializer
                        );
                    }

                    expect(secondPassReports).toHaveLength(0);
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefinedNegated" },
                { messageId: "preferTsExtrasIsDefinedNegated" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture strict defined and undefined comparisons",
            output: null,
        },
        {
            code: inlineFixableDefinedCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes undefined inequality when isDefined import is in scope",
            output: inlineFixableDefinedOutput,
        },
        {
            code: inlineFixableNegatedCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes undefined equality when isDefined import is in scope",
            output: inlineFixableNegatedOutput,
        },
        {
            code: inlineMapCallbackInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports undefined comparison in non-filter callback",
            output: inlineMapCallbackInvalidOutput,
        },
        {
            code: inlineTypeofReverseInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed typeof undefined inequality",
            output: inlineTypeofReverseInvalidOutput,
        },
        {
            code: inlineTypeofNonIdentifierInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes typeof checks over non-identifier expressions",
            output: inlineTypeofNonIdentifierInvalidOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: filterArrowCallbackValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison inside filter arrow callback",
        },
        {
            code: filterFunctionCallbackValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison inside filter function callback",
        },
        {
            code: typeofWithNonTypeofOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores void unary comparison against undefined string literal",
        },
        {
            code: reversedTypeofWithNonTypeofOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed void unary comparison against undefined string literal",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparisons against shadowed undefined bindings",
        },
        {
            code: looseUndefinedInequalityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores loose undefined inequality comparisons",
        },
        {
            code: looseUndefinedEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores loose undefined equality comparisons",
        },
        {
            code: undeclaredTypeofInequalityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores typeof inequality checks against undeclared identifiers",
        },
        {
            code: undeclaredTypeofEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed typeof equality checks against undeclared identifiers",
        },
        {
            code: inlineAstNodeNegatedInvalidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores AST-node undefined equality comparisons",
        },
    ],
});
