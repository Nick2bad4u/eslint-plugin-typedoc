/**
 * @packageDocumentation
 * Focused tests for createTypedRule autofix-gating behavior.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { ESLintUtils } from "@typescript-eslint/utils";
import { assertDefined } from "ts-extras";
import { describe, expect, it, vi } from "vitest";

import { createTypedRule } from "../../src/_internal/typed-rule";

describe(createTypedRule, () => {
    type RuleMessageIds = "blocked";

    const createFixOnlyRule = (): ReturnType<typeof createTypedRule> =>
        createTypedRule({
            create(context) {
                return {
                    Program(node) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(node, "\n"),
                            messageId: "blocked",
                            node,
                        });
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-autofix-gating-test-rule",
        });

    const createSuggestOnlyRule = (): ReturnType<typeof createTypedRule> =>
        createTypedRule({
            create(context) {
                return {
                    Program(node) {
                        context.report({
                            messageId: "blocked",
                            node,
                            suggest: [
                                {
                                    fix: (fixer) =>
                                        fixer.insertTextAfter(node, "\n"),
                                    messageId: "blocked",
                                },
                            ],
                        });
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-suggest-gating-test-rule",
        });

    const createRuleContext = ({
        report,
        settings,
    }: Readonly<{
        report: TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"];
        settings: unknown;
    }>): TSESLint.RuleContext<RuleMessageIds, UnknownArray> =>
        ({
            filename: "test-file.ts",
            id: "internal-autofix-gating-test-rule",
            languageOptions: {
                parser: {
                    meta: {
                        name: "@typescript-eslint/parser",
                    },
                },
            },
            options: [],
            report,
            settings,
            sourceCode: {
                ast: {
                    body: [],
                    comments: [],
                    range: [0, 0],
                    sourceType: "module",
                    tokens: [],
                    type: "Program",
                },
            },
        }) as unknown as TSESLint.RuleContext<RuleMessageIds, UnknownArray>;

    it("keeps fix callbacks when disableAllAutofixes is not enabled", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {},
        });

        const ruleUnderTest = createFixOnlyRule();
        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeTypeOf("function");
    });

    it("removes fix callbacks while keeping suggestions when disableAllAutofixes is enabled", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createSuggestOnlyRule();
        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeUndefined();
        expect(descriptor.suggest).toHaveLength(1);
    });

    it("preserves top-level fix and suggestions when both are present", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        ruleContext.report({
                            fix: (fixer) => fixer.insertTextAfter(node, "\n"),
                            messageId: "blocked",
                            node,
                            suggest: [
                                {
                                    fix: (fixer) =>
                                        fixer.insertTextAfter(node, "\n"),
                                    messageId: "blocked",
                                },
                            ],
                        });
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-combined-fix-suggest-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeTypeOf("function");
        expect(descriptor.suggest).toHaveLength(1);
    });

    it("does not mutate original report descriptor when stripping fix", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        let originalDescriptor:
            | TSESLint.ReportDescriptor<RuleMessageIds>
            | undefined = undefined;

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        originalDescriptor = {
                            fix: (fixer) => fixer.insertTextAfter(node, "\n"),
                            messageId: "blocked",
                            node,
                        };

                        ruleContext.report(originalDescriptor);
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-descriptor-mutation-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);
        expect(originalDescriptor).toBeDefined();

        const ensuredDescriptor =
            originalDescriptor as unknown as TSESLint.ReportDescriptor<RuleMessageIds>;

        expect(Object.hasOwn(ensuredDescriptor, "fix")).toBeTruthy();
    });

    it("does not strip non-function fix values", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        ruleContext.report({
                            fix: null,
                            messageId: "blocked",
                            node,
                        } as unknown as TSESLint.ReportDescriptor<RuleMessageIds>);
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-non-function-fix-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeNull();
    });

    it("falls back safely when fix descriptor lookup returns undefined", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        let fixDescriptorLookups = 0;

                        const descriptorTarget = {
                            messageId: "blocked",
                            node,
                        };

                        const descriptorWithVolatileFix = new Proxy(
                            descriptorTarget,
                            {
                                getOwnPropertyDescriptor(target, property) {
                                    if (property !== "fix") {
                                        return Reflect.getOwnPropertyDescriptor(
                                            target,
                                            property
                                        );
                                    }

                                    fixDescriptorLookups += 1;

                                    if (fixDescriptorLookups === 1) {
                                        return {
                                            configurable: true,
                                            enumerable: true,
                                            value: () => null,
                                            writable: true,
                                        };
                                    }

                                    return undefined;
                                },
                            }
                        ) as unknown as TSESLint.ReportDescriptor<RuleMessageIds>;

                        ruleContext.report(descriptorWithVolatileFix);
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-volatile-fix-descriptor-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        expect(() =>
            listeners.Program?.(
                context.sourceCode.ast as unknown as TSESTree.Program
            )
        ).not.toThrow();
        expect(reportSpy).toHaveBeenCalledTimes(1);
    });

    it("does not crash when fix getter throws", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        const descriptor = {
                            messageId: "blocked",
                            node,
                        } as TSESLint.ReportDescriptor<RuleMessageIds>;

                        const fixGetter = vi.fn(() => {
                            throw new TypeError("boom");
                        });

                        Object.defineProperty(descriptor, "fix", {
                            get: fixGetter,
                        });

                        ruleContext.report(descriptor);

                        expect(fixGetter).not.toHaveBeenCalled();
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-throwing-fix-getter-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        expect(() =>
            listeners.Program?.(
                context.sourceCode.ast as unknown as TSESTree.Program
            )
        ).not.toThrow();
        expect(reportSpy).toHaveBeenCalledTimes(1);
    });

    it("injects canonical docs metadata for cataloged prefer-* rules", () => {
        const ruleUnderTest = createTypedRule({
            create() {
                return {};
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "cataloged metadata normalization test",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "prefer-ts-extras-array-at",
        });

        const docs = ruleUnderTest.meta.docs;
        assertDefined(docs);

        expect(docs.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-at"
        );
        expect(docs.ruleCatalogId).toMatch(/^R\d{3}$/v);
        expect(docs.ruleId).toBe("R001");
        expect(docs.ruleNumber).toBe(1);
    });

    it("throws when authored docs.url is non-canonical", () => {
        expect(() =>
            createTypedRule({
                create() {
                    return {};
                },
                defaultOptions: [],
                meta: {
                    docs: {
                        description: "non-canonical url test",
                        recommended: false,
                        url: "https://example.invalid/custom-url",
                    },
                    messages: {
                        blocked: "blocked",
                    },
                    schema: [],
                    type: "problem",
                },
                name: "prefer-ts-extras-array-at",
            })
        ).toThrow(/has non-canonical docs\.url/v);
    });

    it("injects ruleCatalogId for non-catalog internal rules without ruleId/ruleNumber", () => {
        const ruleUnderTest = createTypedRule({
            create() {
                return {};
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal metadata normalization test",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-metadata-normalization-test-rule",
        });

        const docs = ruleUnderTest.meta.docs;
        assertDefined(docs);

        expect(docs.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/internal-metadata-normalization-test-rule"
        );
        expect(docs.ruleCatalogId).toMatch(/^R\d{3}$/v);
        expect(docs.ruleId).toBeUndefined();
        expect(docs.ruleNumber).toBeUndefined();
    });

    it("throws for prefer-* rules missing from the stable catalog", () => {
        expect(() =>
            createTypedRule({
                create() {
                    return {};
                },
                defaultOptions: [],
                meta: {
                    docs: {
                        description: "missing catalog rule test",
                        recommended: false,
                    },
                    messages: {
                        blocked: "blocked",
                    },
                    schema: [],
                    type: "problem",
                },
                name: "prefer-internal-missing-catalog-test-rule",
            })
        ).toThrow(/missing from the stable rule catalog/v);
    });

    it("preserves meta.defaultOptions when upstream RuleCreator metadata provides it", () => {
        const syntheticCreatedRule = {
            create: vi.fn(() => ({})),
            defaultOptions: [] as const,
            meta: {
                defaultOptions: [{ enabled: true }] as const,
                docs: {
                    description: "synthetic upstream metadata",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-upstream-default-options-compat-test-rule",
        };

        const withoutDocsSpy = vi
            .spyOn(ESLintUtils.RuleCreator, "withoutDocs")
            .mockReturnValue(
                syntheticCreatedRule as unknown as ReturnType<
                    typeof ESLintUtils.RuleCreator.withoutDocs
                >
            );

        try {
            const ruleUnderTest = createTypedRule({
                create() {
                    return {};
                },
                defaultOptions: [],
                meta: {
                    docs: {
                        description: "compat test",
                        recommended: false,
                    },
                    messages: {
                        blocked: "blocked",
                    },
                    schema: [],
                    type: "problem",
                },
                name: "internal-upstream-default-options-compat-test-rule",
            });

            expect(ruleUnderTest.meta.defaultOptions).toStrictEqual([
                {
                    enabled: true,
                },
            ]);
        } finally {
            withoutDocsSpy.mockRestore();
        }
    });
});
