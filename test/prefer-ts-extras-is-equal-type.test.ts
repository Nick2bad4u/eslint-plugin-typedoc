import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-equal-type.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    disableAllAutofixesSettings,
    inlineInvalidAliasedImportCode,
    inlineInvalidAliasedImportSuggestionOutput,
    inlineInvalidAliasedTsExtrasImportCode,
    inlineInvalidAliasedTsExtrasImportSuggestionOutput,
    inlineInvalidSingleTypeArgumentCode,
    inlineInvalidThreeTypeArgumentsCode,
    inlineInvalidWithConflictingIsEqualTypeBindingCode,
    inlineInvalidWithoutTypeArgumentsCode,
    inlineValidLocalNamespaceIsEqualCode,
    inlineValidNamedImportBooleanNonIsEqualCode,
    inlineValidNamespaceBooleanNonIsEqualCode,
    inlineValidNamespaceNonIsEqualCode,
    inlineValidNonBooleanInitializerCode,
    inlineValidNonBooleanLiteralInitializerCode,
    inlineValidNonTypeFestIsEqualImportCode,
    inlineValidObjectPatternDeclaratorCode,
    inlineValidTypeAliasReferenceCode,
    inlineValidUnionBooleanTypeCode,
    invalidFixtureDirectEqualSuggestionOutput,
    invalidFixtureDirectUnequalSuggestionOutput,
    invalidFixtureName,
    invalidFixtureNamespaceSuggestionOutput,
    validFixtureName,
} from "./_internal/prefer-ts-extras-is-equal-type-cases";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import { getSourceTextForNode } from "./_internal/source-text-for-node";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type IsEqualFixFactoryArguments = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
    targetNode: unknown;
}>;
type IsEqualImportKind = "namedImport" | "namespaceImport";

type IsEqualPair = Readonly<{
    leftTypeText: string;
    rightTypeText: string;
}>;

type IsEqualPairId = "booleans" | "numbers" | "stringLiterals";

type IsEqualReportDescriptor = Readonly<{
    messageId?: string;
    suggest?: readonly Readonly<{
        fix?: unknown;
        messageId?: string;
    }>[];
}>;

const isEqualImportKindArbitrary = fc.constantFrom<IsEqualImportKind>(
    "namedImport",
    "namespaceImport"
);
const isEqualPairIdArbitrary = fc.constantFrom<IsEqualPairId>(
    "booleans",
    "numbers",
    "stringLiterals"
);

const buildIsEqualPair = (pairId: IsEqualPairId): IsEqualPair => {
    if (pairId === "booleans") {
        return {
            leftTypeText: "true",
            rightTypeText: "boolean",
        };
    }

    if (pairId === "numbers") {
        return {
            leftTypeText: "number",
            rightTypeText: "42",
        };
    }

    return {
        leftTypeText: '"alpha"',
        rightTypeText: '"alpha"',
    };
};

const buildIsEqualVariableCode = (options: {
    readonly importKind: IsEqualImportKind;
    readonly includeAliasedTsExtrasImport: boolean;
    readonly includeUnicodeBanner: boolean;
    readonly initializerValue: boolean;
    readonly pairId: IsEqualPairId;
    readonly variableName: string;
}): string => {
    const pair = buildIsEqualPair(options.pairId);
    const isEqualReferenceText =
        options.importKind === "namespaceImport"
            ? `TypeFest.IsEqual<${pair.leftTypeText}, ${pair.rightTypeText}>`
            : `IsEqual<${pair.leftTypeText}, ${pair.rightTypeText}>`;
    const isEqualImportText =
        options.importKind === "namespaceImport"
            ? 'import type * as TypeFest from "type-fest";'
            : 'import type { IsEqual } from "type-fest";';

    const codeLines = [
        options.includeAliasedTsExtrasImport
            ? 'import { isEqualType as isEqualTypeAlias } from "ts-extras";'
            : "",
        isEqualImportText,
        "",
        options.includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        `const ${options.variableName}: ${isEqualReferenceText} = ${String(options.initializerValue)};`,
        "",
        `Boolean(${options.variableName});`,
    ];

    return codeLines.filter((line) => line.length > 0).join("\n");
};

const parseIsEqualDeclaratorFromCode = (
    code: string
): Readonly<{
    ast: TSESTree.Program;
    variableDeclarator: TSESTree.VariableDeclarator;
}> => {
    const ast = parser.parseForESLint(code, parserOptions)
        .ast as TSESTree.Program;

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.typeAnnotation?.typeAnnotation?.type ===
                        AST_NODE_TYPES.TSTypeReference &&
                    declaration.init?.type === AST_NODE_TYPES.Literal
                ) {
                    return {
                        ast,
                        variableDeclarator: declaration,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected an IsEqual variable declarator in generated code"
    );
};

interface IsEqualTypeRuleMetadataSnapshot {
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        hasSuggestions?: boolean;
        messages?: Record<string, string>;
        schema?: Readonly<UnknownArray>;
        type?: string;
    };
    name?: string;
}

const loadIsEqualTypeRuleMetadata =
    async (): Promise<IsEqualTypeRuleMetadataSnapshot> => {
        const moduleUnderTest =
            await import("../src/rules/prefer-ts-extras-is-equal-type");

        return moduleUnderTest.default as IsEqualTypeRuleMetadataSnapshot;
    };

describe("prefer-ts-extras-is-equal-type metadata", () => {
    it("exposes stable report and suggestion messages", async () => {
        const metadataRule = await loadIsEqualTypeRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-ts-extras-is-equal-type");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-equal-type"
        );
        expect(metadataRule.meta?.hasSuggestions).toBeTruthy();
        expect(metadataRule.meta?.messages?.["preferTsExtrasIsEqualType"]).toBe(
            "Prefer `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertion variables."
        );
        expect(
            metadataRule.meta?.messages?.["suggestTsExtrasIsEqualType"]
        ).toBe(
            "Replace this boolean `IsEqual<...>` assertion variable with `isEqualType<...>()`."
        );
        expect(metadataRule.meta?.schema).toStrictEqual([]);
        expect(metadataRule.meta?.type).toBe("suggestion");
    });
});

describe("prefer-ts-extras-is-equal-type internal listener guards", () => {
    it("ignores IsEqual-like references with malformed non-qualified typeName nodes", async () => {
        const report = vi.fn();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectNamedImportLocalNamesFromSource: () =>
                        new Set<string>(["IsEqual"]),
                    collectNamespaceImportLocalNamesFromSource: () =>
                        new Set<string>(["TypeFest"]),
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-equal-type")) as {
                    default: {
                        create: (context: unknown) => {
                            VariableDeclarator?: (node: unknown) => void;
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
                    getText: () => "string",
                },
            });

            listeners.VariableDeclarator?.({
                id: {
                    name: "equalCheck",
                    type: "Identifier",
                    typeAnnotation: {
                        typeAnnotation: {
                            type: "TSTypeReference",
                            typeName: {
                                type: "TSImportType",
                            },
                        },
                    },
                },
                init: {
                    type: "Literal",
                    value: true,
                },
                type: "VariableDeclarator",
            });

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-is-equal-type fast-check fix safety", () => {
    it("fast-check: IsEqual boolean assertions expose parseable isEqualType suggestions", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: IsEqualFixFactoryArguments): string => {
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
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectNamedImportLocalNamesFromSource: () =>
                        new Set(["IsEqual"]),
                    collectNamespaceImportLocalNamesFromSource: () =>
                        new Set(["TypeFest"]),
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-equal-type")) as {
                    default: {
                        create: (context: unknown) => {
                            VariableDeclarator?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    isEqualImportKindArbitrary,
                    isEqualPairIdArbitrary,
                    fc.boolean(),
                    fc.boolean(),
                    fc.constantFrom(
                        "equalCheck",
                        "runtimeTypeMatch",
                        "schemaTypeGuard"
                    ),
                    (
                        importKind,
                        pairId,
                        initializerValue,
                        includeUnicodeBanner,
                        variableName
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const code = buildIsEqualVariableCode({
                            importKind,
                            includeAliasedTsExtrasImport: false,
                            includeUnicodeBanner,
                            initializerValue,
                            pairId,
                            variableName,
                        });
                        const { ast, variableDeclarator } =
                            parseIsEqualDeclaratorFromCode(code);
                        const reportCalls: IsEqualReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: IsEqualReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        const variableDeclaratorListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "VariableDeclarator"
                            );

                        variableDeclaratorListener?.(variableDeclarator);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]?.messageId).toBe(
                            "preferTsExtrasIsEqualType"
                        );

                        const firstSuggestion = reportCalls[0]?.suggest?.[0];
                        const createSafeFixInvocationCount =
                            createSafeValueNodeTextReplacementFixMock.mock.calls
                                .length;

                        if (createSafeFixInvocationCount === 0) {
                            if (firstSuggestion !== undefined) {
                                expect(typeof firstSuggestion.fix).toBe(
                                    "function"
                                );
                            }

                            return;
                        }

                        expect(reportCalls[0]?.suggest).toHaveLength(1);

                        expect(firstSuggestion?.fix).toBe("FIX");
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const annotationNode =
                            variableDeclarator.id.typeAnnotation;

                        expect(annotationNode).toBeDefined();

                        if (
                            annotationNode?.typeAnnotation.type !==
                            AST_NODE_TYPES.TSTypeReference
                        ) {
                            throw new Error(
                                "Expected variable declarator to use TSTypeReference"
                            );
                        }

                        const annotationArguments =
                            annotationNode.typeAnnotation.typeArguments
                                ?.params ?? [];
                        const [leftTypeNode, rightTypeNode] =
                            annotationArguments;

                        expect(leftTypeNode).toBeDefined();
                        expect(rightTypeNode).toBeDefined();

                        if (
                            leftTypeNode === undefined ||
                            rightTypeNode === undefined
                        ) {
                            throw new Error(
                                "Expected IsEqual type reference to include two type arguments"
                            );
                        }

                        const leftTypeText = getSourceTextForNode({
                            code,
                            node: leftTypeNode,
                        });
                        const rightTypeText = getSourceTextForNode({
                            code,
                            node: rightTypeNode,
                        });
                        const expectedReplacementName = "isEqualType";
                        const expectedCallText = `${expectedReplacementName}<${leftTypeText}, ${rightTypeText}>()`;
                        const expectedRuntimeExpression = initializerValue
                            ? `${expectedCallText} || true`
                            : `${expectedCallText} && false`;

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        expect(fixArguments).toBeDefined();

                        if (fixArguments === undefined) {
                            throw new Error(
                                "Expected replacement-fix mock arguments"
                            );
                        }

                        const replacementText =
                            fixArguments.replacementTextFactory(
                                expectedReplacementName
                            );

                        expect(replacementText).toBe(
                            `${variableName} = ${expectedRuntimeExpression}`
                        );

                        const declaratorRange = variableDeclarator.range;

                        expect(declaratorRange).toBeDefined();

                        if (declaratorRange === undefined) {
                            throw new Error(
                                "Expected variable declarator to expose source range"
                            );
                        }

                        const fixedCode =
                            code.slice(0, declaratorRange[0]) +
                            replacementText +
                            code.slice(declaratorRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-is-equal-type",
    getPluginRule("prefer-ts-extras-is-equal-type"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureDirectEqualSuggestionOutput,
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureDirectUnequalSuggestionOutput,
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureNamespaceSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture IsEqual variable initializers",
            },
            {
                code: inlineInvalidAliasedImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports aliased IsEqual import in variable initializer",
            },
            {
                code: inlineInvalidAliasedImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "preserves suggestions when disableAllAutofixes is enabled",
                settings: disableAllAutofixesSettings,
            },
            {
                code: inlineInvalidAliasedTsExtrasImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedTsExtrasImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reuses aliased ts-extras isEqualType import when present",
            },
            {
                code: inlineInvalidWithoutTypeArgumentsCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without explicit type arguments",
            },
            {
                code: inlineInvalidSingleTypeArgumentCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage with a single type argument without suggestion",
            },
            {
                code: inlineInvalidThreeTypeArgumentsCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage with three type arguments without suggestion",
            },
            {
                code: inlineInvalidWithConflictingIsEqualTypeBindingCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without suggestion when local isEqualType binding conflicts",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidTypeAliasReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual used through type alias reference",
            },
            {
                code: inlineValidNonBooleanInitializerCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual initializer that is not plain boolean literal",
            },
            {
                code: inlineValidNonBooleanLiteralInitializerCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual initializer when literal value is not boolean",
            },
            {
                code: inlineValidObjectPatternDeclaratorCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual inside object-pattern declarator",
            },
            {
                code: inlineValidNamespaceNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace usage of non-IsEqual type-fest type",
            },
            {
                code: inlineValidUnionBooleanTypeCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores plain boolean union type",
            },
            {
                code: inlineValidNamespaceBooleanNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace Promisable boolean value",
            },
            {
                code: inlineValidNamedImportBooleanNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores named-import Promisable boolean value",
            },
            {
                code: inlineValidNonTypeFestIsEqualImportCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual imports that do not originate from type-fest",
            },
            {
                code: inlineValidLocalNamespaceIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores local namespace IsEqual references that are not type-fest imports",
            },
        ],
    }
);
