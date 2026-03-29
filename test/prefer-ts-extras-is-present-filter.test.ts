/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present-filter.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    fixtureInvalidOutputWithMixedLineEndings,
    fixtureInvalidSecondPassOutputWithMixedLineEndings,
    inlineFixableCode,
    inlineFixableOutput,
    inlineInvalidMixedNullishOperatorCode,
    inlineInvalidPredicateUndefinedStrictCode,
    inlineInvalidReversedTypeofUndefinedCode,
    inlineInvalidReversedTypeofUndefinedOutput,
    inlineInvalidReverseNullLooseCode,
    inlineInvalidReverseNullLooseOutput,
    inlineInvalidReverseUndefinedLooseCode,
    inlineInvalidReverseUndefinedLooseOutput,
    inlineInvalidTypeofUndefinedGuardCode,
    inlineInvalidTypeofUndefinedGuardOutput,
    inlineValidAndNonNullLiteralComparisonCode,
    inlineValidAndNonParameterNullComparisonCode,
    inlineValidAndNonParameterUndefinedComparisonCode,
    inlineValidAndThreeTermNullishGuardCode,
    inlineValidAndUndefinedAliasComparisonCode,
    inlineValidAndWithoutUndefinedCheckCode,
    inlineValidComputedFilterCode,
    inlineValidDestructuredParameterCode,
    inlineValidFilterBlockBodyCode,
    inlineValidFunctionExpressionCode,
    inlineValidLogicalOrNullishGuardCode,
    inlineValidMapCallbackCode,
    inlineValidNoCallbackCode,
    inlineValidOptionalChainFilterCode,
    inlineValidReverseNonUndefinedIdentifierComparisonCode,
    inlineValidSecondCallbackParameterCode,
    inlineValidShadowedUndefinedBindingCode,
    inlineValidStrictNullWithoutPredicateCode,
    inlineValidStrictUndefinedWithoutPredicateCode,
    inlineValidUnsupportedNullishOperatorCode,
    invalidFixtureCode,
    invalidFixtureName,
    validFixtureName,
} from "./_internal/prefer-ts-extras-is-present-filter-cases";
import {
    autoFixableTemplateIdArbitrary,
    callbackParameterNameArbitrary,
    formatAutoFixableGuardExpression,
    formatStrictPredicateExpression,
    parseFilterCallFromCode,
    parserOptions,
    strictPredicateTemplateIdArbitrary,
} from "./_internal/prefer-ts-extras-is-present-filter-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-present-filter";
const docsDescription =
    "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present-filter";
const preferTsExtrasIsPresentFilterMessage =
    "Prefer `isPresent` from `ts-extras` in `filter(...)` callbacks over inline nullish comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsPresentFilter: preferTsExtrasIsPresentFilterMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-present-filter metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-present-filter internal listener guards", () => {
    it("ignores non-Identifier filter property and non-callback first argument", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
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
                    createSafeValueReferenceReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "value",
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const privateFilterMemberCallNode = {
                arguments: [
                    {
                        body: {
                            left: {
                                name: "value",
                                type: "Identifier",
                            },
                            operator: "!=",
                            right: {
                                type: "Literal",
                                value: null,
                            },
                            type: "BinaryExpression",
                        },
                        params: [
                            {
                                name: "value",
                                type: "Identifier",
                            },
                        ],
                        type: "ArrowFunctionExpression",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };
            const logicalExpressionFilterArgumentCallNode = {
                arguments: [
                    {
                        left: {
                            name: "value",
                            type: "Identifier",
                        },
                        operator: "!=",
                        right: {
                            type: "Literal",
                            value: null,
                        },
                        type: "BinaryExpression",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privateFilterMemberCallNode);
            callExpressionListener?.(logicalExpressionFilterArgumentCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("ignores logical-or callback bodies that do not match strict present filter guards", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
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
                    createSafeValueReferenceReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "value",
                },
            });

            const callExpressionListener = getSelectorAwareNodeListener(
                listeners as Readonly<Record<string, unknown>>,
                "CallExpression"
            );

            callExpressionListener?.({
                arguments: [
                    {
                        body: {
                            left: {
                                left: {
                                    name: "value",
                                    type: "Identifier",
                                },
                                operator: "!==",
                                right: {
                                    type: "Literal",
                                    value: null,
                                },
                                type: "BinaryExpression",
                            },
                            operator: "||",
                            right: {
                                left: {
                                    name: "value",
                                    type: "Identifier",
                                },
                                operator: "!==",
                                right: {
                                    name: "undefined",
                                    type: "Identifier",
                                },
                                type: "BinaryExpression",
                            },
                            type: "LogicalExpression",
                        },
                        params: [
                            {
                                name: "value",
                                type: "Identifier",
                            },
                        ],
                        type: "ArrowFunctionExpression",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: autofixable filter guards report and allow parseable callback replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueReferenceReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
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
                    createSafeValueReferenceReplacementFix:
                        createSafeValueReferenceReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    autoFixableTemplateIdArbitrary,
                    (parameterName, templateId) => {
                        createSafeValueReferenceReplacementFixMock.mockClear();

                        const guardExpression =
                            formatAutoFixableGuardExpression(
                                templateId,
                                parameterName
                            );
                        const code = [
                            'import { isPresent } from "ts-extras";',
                            "",
                            "declare const values: readonly (null | string | undefined)[];",
                            "",
                            `const presentValues = values.filter((${parameterName}) => ${guardExpression});`,
                            "",
                            "String(presentValues.length);",
                        ].join("\n");

                        const { ast, callbackRange, callExpression } =
                            parseFilterCallFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
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

                                    if (!nodeRange) {
                                        return "";
                                    }

                                    const [start, end] = nodeRange;
                                    return code.slice(start, end);
                                },
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reportCalls).toHaveLength(1);

                        const [firstReport] = reportCalls;

                        expect(firstReport).toBeDefined();

                        if (!firstReport) {
                            throw new TypeError(
                                "Expected first prefer-ts-extras-is-present-filter report"
                            );
                        }

                        expect(firstReport).toMatchObject({
                            messageId: "preferTsExtrasIsPresentFilter",
                        });

                        if (
                            createSafeValueReferenceReplacementFixMock.mock
                                .calls.length > 0
                        ) {
                            expect(
                                createSafeValueReferenceReplacementFixMock
                            ).toHaveBeenCalledTimes(1);
                        } else if (firstReport.fix !== undefined) {
                            expect(typeof firstReport.fix).toBe("function");
                        }

                        const [callbackStart, callbackEnd] = callbackRange;
                        const fixedCode = `${code.slice(
                            0,
                            callbackStart
                        )}isPresent${code.slice(callbackEnd)}`;

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

    it("fast-check: strict single-part predicate guards report without autofix", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueReferenceReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
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
                    createSafeValueReferenceReplacementFix:
                        createSafeValueReferenceReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    strictPredicateTemplateIdArbitrary,
                    (parameterName, templateId) => {
                        createSafeValueReferenceReplacementFixMock.mockClear();

                        const guardExpression = formatStrictPredicateExpression(
                            templateId,
                            parameterName
                        );
                        const code = [
                            "declare const values: readonly (null | string | undefined)[];",
                            "",
                            "const presentValues = values.filter(",
                            `    (${parameterName}): ${parameterName} is string => ${guardExpression}`,
                            ");",
                            "",
                            "String(presentValues.length);",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseFilterCallFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
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
                                getText: () => parameterName,
                            },
                        });

                        const callExpressionListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "CallExpression"
                            );

                        callExpressionListener?.(callExpression);

                        expect(reportCalls).toHaveLength(1);

                        const [firstReport] = reportCalls;

                        expect(firstReport).toBeDefined();

                        if (!firstReport) {
                            throw new TypeError(
                                "Expected first prefer-ts-extras-is-present-filter report"
                            );
                        }

                        expect(firstReport).toMatchObject({
                            messageId: "preferTsExtrasIsPresentFilter",
                        });
                        expect("fix" in firstReport).toBeFalsy();
                        expect(
                            createSafeValueReferenceReplacementFixMock
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

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsPresentFilter" },
                { messageId: "preferTsExtrasIsPresentFilter" },
                { messageId: "preferTsExtrasIsPresentFilter" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture present-filter guards",
            output: [
                fixtureInvalidOutputWithMixedLineEndings,
                fixtureInvalidSecondPassOutputWithMixedLineEndings,
            ],
        },
        {
            code: inlineInvalidPredicateUndefinedStrictCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports predicate using strict undefined inequality",
            output: null,
        },
        {
            code: inlineInvalidTypeofUndefinedGuardCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports predicate using typeof undefined check",
            output: inlineInvalidTypeofUndefinedGuardOutput,
        },
        {
            code: inlineInvalidReverseNullLooseCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reverse null loose inequality predicate",
            output: inlineInvalidReverseNullLooseOutput,
        },
        {
            code: inlineInvalidReverseUndefinedLooseCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reverse undefined loose inequality predicate",
            output: inlineInvalidReverseUndefinedLooseOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes filter callback to isPresent when import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineInvalidMixedNullishOperatorCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed loose and strict nullish inequality predicate without autofix",
            output: null,
        },
        {
            code: inlineInvalidReversedTypeofUndefinedCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed typeof undefined nullish guards",
            output: inlineInvalidReversedTypeofUndefinedOutput,
        },
        {
            code: inlineValidAndThreeTermNullishGuardCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports three-term conjunction nullish guard callback without autofix",
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
            code: inlineValidStrictNullWithoutPredicateCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict null inequality without type predicate",
        },
        {
            code: inlineValidStrictUndefinedWithoutPredicateCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict undefined inequality without type predicate",
        },
        {
            code: inlineValidAndWithoutUndefinedCheckCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores logical and callback lacking undefined check",
        },
        {
            code: inlineValidLogicalOrNullishGuardCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores disjunction nullish guard callback",
        },
        {
            code: inlineValidUnsupportedNullishOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unsupported nullish binary operators",
        },
        {
            code: inlineValidAndNonParameterNullComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores null comparison using non-parameter identifier",
        },
        {
            code: inlineValidAndNonParameterUndefinedComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison using non-parameter identifier",
        },
        {
            code: inlineValidAndNonNullLiteralComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-null literal comparison in conjunction",
        },
        {
            code: inlineValidAndUndefinedAliasComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined alias identifier comparison in conjunction",
        },
        {
            code: inlineValidReverseNonUndefinedIdentifierComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed non-undefined identifier comparisons",
        },
        {
            code: inlineValidFilterBlockBodyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores block-body filter callback",
        },
        {
            code: inlineValidFunctionExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores function expression callback",
        },
        {
            code: inlineValidComputedFilterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed filter property access",
        },
        {
            code: inlineValidOptionalChainFilterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores optional-chain filter calls",
        },
        {
            code: inlineValidNoCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter call without callback",
        },
        {
            code: inlineValidDestructuredParameterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores destructured callback parameter",
        },
        {
            code: inlineValidSecondCallbackParameterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter callback with second index parameter",
        },
        {
            code: inlineValidMapCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-filter map callback",
        },
        {
            code: inlineValidShadowedUndefinedBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores nullish conjunctions using shadowed undefined bindings",
        },
    ],
});
