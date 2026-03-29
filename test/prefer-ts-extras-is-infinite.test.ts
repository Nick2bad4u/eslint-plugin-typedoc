/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-infinite.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    inlineFixableDualSignCode,
    inlineFixableDualSignOutput,
    inlineFixableInfinityIdentifierDualSignCode,
    inlineFixableInfinityIdentifierDualSignOutput,
    inlineInvalidDifferentComparedExpressionsCode,
    inlineInvalidLeftInfinityCode,
    inlineInvalidLogicalAndDualSignCode,
    inlineInvalidMathNegativeInfinityDisjunctionCode,
    inlineInvalidMixedStrictnessDualSignCode,
    inlineInvalidPositiveInfinityCode,
    inlineInvalidSameSignStrictDisjunctionCode,
    inlineParenthesizedDisjunctionCode,
    inlineParenthesizedDisjunctionOutput,
    inlineValidComputedInfinityMemberCode,
    inlineValidNonEqualityOperatorCode,
    inlineValidNonInfinityNumberPropertyCode,
    inlineValidOtherObjectInfinityMemberCode,
    inlineValidShadowedInfinityBindingCode,
    inlineValidShadowedNumberBindingCode,
    inlineValidWithoutInfinityReferenceCode,
    invalidFixtureName,
    validFixtureName,
} from "./_internal/prefer-ts-extras-is-infinite-cases";
import {
    buildComparedExpressionTemplate,
    buildStrictInfinityComparisonText,
    generatedFixableDisjunctionCaseArbitrary,
    generatedMismatchedDisjunctionCaseArbitrary,
    getPositiveInfinityReferenceText,
    parseLogicalDisjunctionFromCode,
    parserOptions,
} from "./_internal/prefer-ts-extras-is-infinite-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-infinite");
const ruleTester = createTypedRuleTester();
const inlineAstNodeDualInfinityInvalidCode = [
    'import type { TSESTree } from "@typescript-eslint/utils";',
    "",
    "const memberExpressionWithParent = {} as Readonly<TSESTree.MemberExpression> & {",
    "    parent?: Readonly<TSESTree.Node>;",
    "};",
    "const parentNode = memberExpressionWithParent.parent;",
    "const hasInfiniteParent =",
    "    parentNode === Infinity || parentNode === Number.NEGATIVE_INFINITY;",
    "String(hasInfiniteParent);",
].join("\n");

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-is-infinite", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras isInfinite over direct Infinity equality checks for consistent predicate helper usage.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsInfinite:
            "Prefer `isInfinite` from `ts-extras` over direct Infinity equality checks.",
    },
    name: "prefer-ts-extras-is-infinite",
});

describe("prefer-ts-extras-is-infinite internal listener guards", () => {
    it("ignores strict disjunctions when one Number member is non-infinity", async () => {
        const report = vi.fn();

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
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) => node.type === "Identifier" && node.name === name,
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
                (await import("../src/rules/prefer-ts-extras-is-infinite")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report,
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            listeners.LogicalExpression?.({
                left: {
                    left: {
                        name: "metric",
                        type: "Identifier",
                    },
                    operator: "===",
                    right: {
                        computed: false,
                        object: {
                            name: "Number",
                            type: "Identifier",
                        },
                        property: {
                            name: "MAX_VALUE",
                            type: "Identifier",
                        },
                        type: "MemberExpression",
                    },
                    type: "BinaryExpression",
                },
                operator: "||",
                right: {
                    left: {
                        name: "metric",
                        type: "Identifier",
                    },
                    operator: "===",
                    right: {
                        computed: false,
                        object: {
                            name: "Number",
                            type: "Identifier",
                        },
                        property: {
                            name: "NEGATIVE_INFINITY",
                            type: "Identifier",
                        },
                        type: "MemberExpression",
                    },
                    type: "BinaryExpression",
                },
                type: "LogicalExpression",
            });

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: strict dual-sign disjunctions report with parseable isInfinite replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) => node.type === "Identifier" && node.name === name,
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
                (await import("../src/rules/prefer-ts-extras-is-infinite")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedFixableDisjunctionCaseArbitrary,
                    (generatedCase) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const template = buildComparedExpressionTemplate(
                            generatedCase.templateId
                        );
                        const positiveComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: template.expressionText,
                                infinityReferenceText:
                                    getPositiveInfinityReferenceText(
                                        generatedCase.positiveInfinityReferenceKind
                                    ),
                                orientation: generatedCase.positiveOrientation,
                            });
                        const negativeComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: template.expressionText,
                                infinityReferenceText:
                                    "Number.NEGATIVE_INFINITY",
                                orientation: generatedCase.negativeOrientation,
                            });

                        const disjunctionTerms = generatedCase.reverseOrder
                            ? [negativeComparisonText, positiveComparisonText]
                            : [positiveComparisonText, negativeComparisonText];

                        const code = [
                            ...template.declarations,
                            generatedCase.includeUnicodeLine
                                ? 'const marker = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                                : "",
                            `const isInfiniteMetric = ${disjunctionTerms[0]} || ${disjunctionTerms[1]};`,
                            "String(isInfiniteMetric);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            comparedExpressionText,
                            logicalExpression,
                            logicalRange,
                        } = parseLogicalDisjunctionFromCode(code);
                        const reports: Readonly<{
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
                                reports.push(descriptor);
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

                                    const maybeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!maybeRange) {
                                        return "";
                                    }

                                    return code.slice(
                                        maybeRange[0],
                                        maybeRange[1]
                                    );
                                },
                            },
                        });

                        listeners.LogicalExpression?.(logicalExpression);

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            messageId: "preferTsExtrasIsInfinite",
                        });

                        if (
                            createSafeValueArgumentFunctionCallFixMock.mock
                                .calls.length > 0
                        ) {
                            expect(
                                createSafeValueArgumentFunctionCallFixMock
                            ).toHaveBeenCalledTimes(1);
                        } else {
                            const reportFix = reports[0]?.fix;

                            if (reportFix !== undefined) {
                                expect(typeof reportFix).toBe("function");
                            }
                        }

                        const replacementText = `isInfinite(${comparedExpressionText})`;
                        const fixedCode =
                            code.slice(0, logicalRange[0]) +
                            replacementText +
                            code.slice(logicalRange[1]);

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

    it("fast-check: disjunctions with different compared expressions never use the logical-expression fix", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) => node.type === "Identifier" && node.name === name,
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
                (await import("../src/rules/prefer-ts-extras-is-infinite")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedMismatchedDisjunctionCaseArbitrary,
                    (generatedCase) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const firstComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: "firstMetric",
                                infinityReferenceText:
                                    getPositiveInfinityReferenceText(
                                        generatedCase.positiveInfinityReferenceKind
                                    ),
                                orientation: generatedCase.firstOrientation,
                            });
                        const secondComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: "secondMetric",
                                infinityReferenceText:
                                    "Number.NEGATIVE_INFINITY",
                                orientation: generatedCase.secondOrientation,
                            });

                        const disjunctionTerms = generatedCase.reverseOrder
                            ? [secondComparisonText, firstComparisonText]
                            : [firstComparisonText, secondComparisonText];

                        const code = [
                            "declare const firstMetric: number;",
                            "declare const secondMetric: number;",
                            generatedCase.includeUnicodeLine
                                ? 'const marker = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                                : "",
                            `const isInfiniteMetric = ${disjunctionTerms[0]} || ${disjunctionTerms[1]};`,
                            "String(isInfiniteMetric);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, logicalExpression } =
                            parseLogicalDisjunctionFromCode(code);
                        const reports: Readonly<{ messageId?: string }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{ messageId?: string }>
                            ) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText: () => code,
                            },
                        });

                        listeners.LogicalExpression?.(logicalExpression);

                        expect(reports).toHaveLength(0);
                        expect(
                            createSafeValueArgumentFunctionCallFixMock
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

ruleTester.run("prefer-ts-extras-is-infinite", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsInfinite",
                },
                {
                    messageId: "preferTsExtrasIsInfinite",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture infinity comparisons",
        },
        {
            code: inlineInvalidPositiveInfinityCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality against Number.POSITIVE_INFINITY",
        },
        {
            code: inlineInvalidLeftInfinityCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict equality with Infinity literal on left",
        },
        {
            code: inlineFixableDualSignCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes strict dual-sign infinity disjunction when isInfinite import is in scope",
            output: inlineFixableDualSignOutput,
        },
        {
            code: inlineFixableInfinityIdentifierDualSignCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes strict dual-sign disjunction when Infinity identifier appears on left",
            output: inlineFixableInfinityIdentifierDualSignOutput,
        },
        {
            code: inlineInvalidMixedStrictnessDualSignCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed strictness dual-sign disjunction without treating it as safe helper target",
        },
        {
            code: inlineParenthesizedDisjunctionCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes paired disjunction when one compared expression is parenthesized",
            output: inlineParenthesizedDisjunctionOutput,
        },
        {
            code: inlineInvalidSameSignStrictDisjunctionCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict disjunction comparing only positive infinity variants",
        },
        {
            code: inlineInvalidDifferentComparedExpressionsCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict dual-sign disjunction when compared expressions differ",
        },
        {
            code: inlineInvalidLogicalAndDualSignCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports logical-and dual-sign comparisons without collapsing into helper form",
        },
        {
            code: inlineInvalidMathNegativeInfinityDisjunctionCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports only Number infinity comparisons when paired side is non-Number member",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidNonEqualityOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-equality infinity comparison",
        },
        {
            code: inlineValidWithoutInfinityReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparison without infinity reference",
        },
        {
            code: inlineValidComputedInfinityMemberCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Number infinity member access",
        },
        {
            code: inlineValidOtherObjectInfinityMemberCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores infinity member access on non-Number object",
        },
        {
            code: inlineValidNonInfinityNumberPropertyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number member comparisons that are not infinity constants",
        },
        {
            code: inlineValidShadowedInfinityBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparisons against shadowed Infinity identifiers",
        },
        {
            code: inlineValidShadowedNumberBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number infinity member checks when Number binding is shadowed",
        },
        {
            code: inlineAstNodeDualInfinityInvalidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores AST-node strict dual-sign disjunctions",
        },
    ],
});
