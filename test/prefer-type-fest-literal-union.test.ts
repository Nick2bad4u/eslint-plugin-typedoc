/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-literal-union.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    fixtureFixableOutputCode,
    fixtureFixableSecondPassOutputCode,
    inlineFixableBigIntCode,
    inlineFixableBigIntOutput,
    inlineFixableBooleanCode,
    inlineFixableBooleanOutput,
    inlineFixableCode,
    inlineFixableNumberCode,
    inlineFixableNumberOutput,
    inlineFixableOutput,
    inlineFixableSingleLiteralBooleanCode,
    inlineFixableSingleLiteralBooleanOutput,
    inlineFixableSingleLiteralNumberCode,
    inlineFixableSingleLiteralNumberOutput,
    inlineFixableSingleLiteralStringCode,
    inlineFixableSingleLiteralStringOutput,
    inlineInvalidBigIntLiteralUnionCode,
    inlineInvalidBigIntLiteralUnionOutputCode,
    inlineInvalidBooleanLiteralUnionCode,
    inlineInvalidBooleanLiteralUnionOutputCode,
    inlineInvalidNumberLiteralUnionCode,
    inlineInvalidNumberLiteralUnionOutputCode,
    inlineInvalidWithoutFixCode,
    inlineInvalidWithoutFixOutputCode,
    invalidFixtureCode,
    invalidFixtureName,
    keywordLiteralCrossFamilyValidCode,
    keywordOnlyBigIntUnionValidCode,
    keywordOnlyBooleanUnionValidCode,
    keywordOnlyNumberUnionValidCode,
    keywordOnlyStringUnionValidCode,
    literalAndTypeReferenceUnionValidCode,
    literalOnlyBigIntUnionValidCode,
    literalOnlyBooleanUnionValidCode,
    literalOnlyUnionValidCode,
    mismatchedBigIntLiteralFamilyValidCode,
    mixedFamilyUnionValidCode,
    mixedLiteralFamiliesValidCode,
    shadowedReplacementNameInvalidCode,
    templateLiteralAndStringKeywordValidCode,
    validFixtureName,
} from "./_internal/prefer-type-fest-literal-union-cases";
import {
    buildGeneratedTypeAlias,
    generatedCrossFamilyCaseArbitrary,
    type GeneratedLiteralUnionCase,
    generatedLiteralUnionCaseArbitrary,
    parserOptions,
    parseUnionAliasAnnotation,
} from "./_internal/prefer-type-fest-literal-union-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-literal-union", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest LiteralUnion over unions that combine primitive keywords with same-family literal members.",
    enforceRuleShape: true,
    messages: {
        preferLiteralUnion:
            "Prefer `LiteralUnion<...>` from type-fest over unions that mix primitive keywords and same-family literal members.",
    },
    name: "prefer-type-fest-literal-union",
});

describe("prefer-type-fest-literal-union runtime safety assertions", () => {
    it("tSUnionType visitor handles bigint-literal variants and rejects cross-family unions", async () => {
        const code = [
            "type BigIntValue = bigint | 1n;",
            "type BigIntText = bigint | 2n;",
            'type BooleanAndString = boolean | "dev";',
            'type NumberAndString = number | "dev";',
        ].join("\n");

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-literal-union")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const parsed = parser.parseForESLint(code, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const unionByAliasName = new Map<string, unknown>();

            for (const statement of parsed.ast.body) {
                if (
                    statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
                    statement.typeAnnotation.type === AST_NODE_TYPES.TSUnionType
                ) {
                    unionByAliasName.set(
                        statement.id.name,
                        statement.typeAnnotation
                    );
                }
            }

            const getRequiredUnion = (aliasName: string): unknown => {
                const unionNode = unionByAliasName.get(aliasName);

                if (unionNode === undefined) {
                    throw new Error(`Expected union type alias '${aliasName}'`);
                }

                return unionNode;
            };

            const bigIntValueUnion = getRequiredUnion("BigIntValue") as {
                types: unknown[];
            };
            const bigIntTextUnion = getRequiredUnion("BigIntText") as {
                types: unknown[];
            };
            const booleanAndStringUnion = getRequiredUnion("BooleanAndString");
            const numberAndStringUnion = getRequiredUnion("NumberAndString");

            const secondBigIntValueMember = bigIntValueUnion.types[1] as {
                literal?: { bigint?: unknown };
                type?: string;
            };
            if (
                secondBigIntValueMember.type === "TSLiteralType" &&
                secondBigIntValueMember.literal
            ) {
                Reflect.deleteProperty(
                    secondBigIntValueMember.literal,
                    "bigint"
                );
                secondBigIntValueMember.literal.bigint = undefined;
            }

            const secondBigIntTextMember = bigIntTextUnion.types[1] as {
                literal?: { bigint?: unknown; value?: unknown };
                type?: string;
            };
            if (
                secondBigIntTextMember.type === "TSLiteralType" &&
                secondBigIntTextMember.literal
            ) {
                secondBigIntTextMember.literal.value = null;
                secondBigIntTextMember.literal.bigint = "2";
            }

            const sourceCode = {
                ast: parsed.ast,
                getText(node: unknown): string {
                    if (
                        typeof node !== "object" ||
                        node === null ||
                        !("range" in node)
                    ) {
                        return "";
                    }

                    const nodeRange = (
                        node as { range?: readonly [number, number] }
                    ).range;

                    if (!nodeRange) {
                        return "";
                    }

                    const [start, end] = nodeRange;
                    return code.slice(start, end);
                },
            };

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-literal-union.invalid.ts",
                report,
                sourceCode,
            });

            listenerMap.TSUnionType?.(bigIntValueUnion);
            listenerMap.TSUnionType?.(bigIntTextUnion);
            listenerMap.TSUnionType?.(booleanAndStringUnion);
            listenerMap.TSUnionType?.(numberAndStringUnion);

            expect(report).toHaveBeenCalledTimes(2);

            const reportedNodes = report.mock.calls
                .map((call) => call[0] as { node?: unknown })
                .map((descriptor) => descriptor.node);

            expect(reportedNodes).toContain(bigIntValueUnion);
            expect(reportedNodes).toContain(bigIntTextUnion);
            expect(reportedNodes).not.toContain(booleanAndStringUnion);
            expect(reportedNodes).not.toContain(numberAndStringUnion);
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: reports same-family unions and produces parseable replacement text", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const capturedReplacementTexts: string[] = [];

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    createSafeTypeNodeTextReplacementFix: (
                        _targetNode: unknown,
                        _importedName: unknown,
                        replacementText: unknown
                    ) => {
                        if (typeof replacementText === "string") {
                            capturedReplacementTexts.push(replacementText);
                        }

                        return null;
                    },
                })
            );

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-literal-union")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedLiteralUnionCaseArbitrary,
                    (generatedCase: GeneratedLiteralUnionCase) => {
                        const sourceText = buildGeneratedTypeAlias({
                            keywordFamily: generatedCase.family,
                            literalMembers: generatedCase.literalMembers,
                        });
                        const { ast, unionType } =
                            parseUnionAliasAnnotation(sourceText);

                        const reports: Readonly<{ messageId?: string }>[] = [];

                        const listeners = undecoratedRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-literal-union.invalid.ts",
                            report: (
                                descriptor: Readonly<{ messageId?: string }>
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

                                    const nodeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!nodeRange) {
                                        return "";
                                    }

                                    const [start, end] = nodeRange;
                                    return sourceText.slice(start, end);
                                },
                            },
                        });

                        listeners.TSUnionType?.(unionType);

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            messageId: "preferLiteralUnion",
                        });

                        const replacementText = capturedReplacementTexts.at(-1);

                        expect(replacementText).toBeDefined();

                        if (replacementText === undefined) {
                            throw new Error(
                                "Expected replacement text captured from fixer helper"
                            );
                        }

                        expectTypeOf(replacementText).toBeString();

                        expect(replacementText).toContain("LiteralUnion<");

                        expect(() => {
                            parser.parseForESLint(
                                `type Output = ${replacementText};`,
                                parserOptions
                            );
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: ignores generated cross-family unions", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    createSafeTypeNodeTextReplacementFix: () => null,
                })
            );

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-literal-union")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedCrossFamilyCaseArbitrary,
                    (generatedCase) => {
                        const sourceText = buildGeneratedTypeAlias({
                            keywordFamily: generatedCase.keywordFamily,
                            literalMembers:
                                generatedCase.literalCase.literalMembers,
                        });
                        const { ast, unionType } =
                            parseUnionAliasAnnotation(sourceText);

                        const reports: Readonly<{ messageId?: string }>[] = [];

                        const listeners = undecoratedRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-literal-union.valid.ts",
                            report: (
                                descriptor: Readonly<{ messageId?: string }>
                            ) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText: () => "",
                            },
                        });

                        listeners.TSUnionType?.(unionType);

                        expect(reports).toHaveLength(0);
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("handles defensive fallback branches when union members change across successive reads", async () => {
        const createBigIntKeywordMember = () => ({
            type: "TSBigIntKeyword",
        });
        const createBigIntLiteralMember = () => ({
            literal: {
                type: "Literal",
                value: 1n,
            },
            type: "TSLiteralType",
        });
        const createStringKeywordMember = () => ({
            type: "TSStringKeyword",
        });
        const createNumberLiteralMember = () => ({
            literal: {
                type: "Literal",
                value: 1,
            },
            type: "TSLiteralType",
        });

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-literal-union")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-literal-union.invalid.ts",
                report,
                sourceCode: {
                    ast: {
                        body: [],
                        sourceType: "module",
                        type: "Program",
                    },
                    getText: (): string => "'dev'",
                },
            });

            let familyFallbackReadCount = 0;
            const familyFallbackNode = {
                type: "TSUnionType",
                get types() {
                    familyFallbackReadCount += 1;

                    if (familyFallbackReadCount === 1) {
                        return [
                            createBigIntKeywordMember(),
                            createBigIntLiteralMember(),
                        ];
                    }

                    return [
                        createStringKeywordMember(),
                        createNumberLiteralMember(),
                    ];
                },
            };

            let replacementFallbackReadCount = 0;
            const replacementFallbackNode = {
                type: "TSUnionType",
                get types() {
                    replacementFallbackReadCount += 1;

                    if (replacementFallbackReadCount < 3) {
                        return [
                            createBigIntKeywordMember(),
                            createBigIntLiteralMember(),
                        ];
                    }

                    return [createBigIntKeywordMember()];
                },
            };

            listenerMap.TSUnionType?.(familyFallbackNode);
            listenerMap.TSUnionType?.(replacementFallbackNode);

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-type-fest-literal-union",
    getPluginRule("prefer-type-fest-literal-union"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferLiteralUnion",
                    },
                    {
                        messageId: "preferLiteralUnion",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture literal plus base type unions",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineInvalidBigIntLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports bigint base plus bigint literal union",
                output: inlineInvalidBigIntLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidBooleanLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports boolean base plus boolean literal union",
                output: inlineInvalidBooleanLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidNumberLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports number base plus numeric literal union",
                output: inlineInvalidNumberLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports primitive+literal union without fix when LiteralUnion import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports without autofix when import-insertion fixes are disabled",
                settings: {
                    typefest: {
                        disableImportInsertionFixes: true,
                    },
                },
            },
            {
                code: shadowedReplacementNameInvalidCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports without autofix when replacement identifier is shadowed by a type parameter",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes primitive+literal union when LiteralUnion import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineFixableBooleanCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes boolean literal unions when LiteralUnion import is in scope",
                output: inlineFixableBooleanOutput,
            },
            {
                code: inlineFixableNumberCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes number literal unions when LiteralUnion import is in scope",
                output: inlineFixableNumberOutput,
            },
            {
                code: inlineFixableSingleLiteralStringCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal string unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralStringOutput,
            },
            {
                code: inlineFixableBigIntCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes bigint literal unions when LiteralUnion import is in scope",
                output: inlineFixableBigIntOutput,
            },
            {
                code: inlineFixableSingleLiteralBooleanCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal boolean unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralBooleanOutput,
            },
            {
                code: inlineFixableSingleLiteralNumberCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal number unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralNumberOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: mixedFamilyUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that mix multiple primitive families",
            },
            {
                code: literalOnlyUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that contain only literal members",
            },
            {
                code: literalOnlyBooleanUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only boolean literal members",
            },
            {
                code: literalOnlyBigIntUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only bigint literal members",
            },
            {
                code: mixedLiteralFamiliesValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include literals from different families",
            },
            {
                code: keywordOnlyStringUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only string keyword members",
            },
            {
                code: keywordOnlyNumberUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only number keyword members",
            },
            {
                code: keywordOnlyBooleanUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only boolean keyword members",
            },
            {
                code: keywordOnlyBigIntUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only bigint keyword members",
            },
            {
                code: literalAndTypeReferenceUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include non-literal type references",
            },
            {
                code: mismatchedBigIntLiteralFamilyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores bigint unions with numeric (non-bigint) literals",
            },
            {
                code: keywordLiteralCrossFamilyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions where keyword and literal members belong to different primitive families",
            },
            {
                code: templateLiteralAndStringKeywordValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include template literal types",
            },
        ],
    }
);
