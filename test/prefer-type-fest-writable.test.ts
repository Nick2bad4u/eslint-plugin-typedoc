import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleName = "prefer-type-fest-writable";
const rule = getPluginRule(ruleName);
const ruleTester = createTypedRuleTester();

const mappedInvalidFixtureName = "prefer-type-fest-writable.invalid.ts";
const importedAliasInvalidFixtureName =
    "prefer-type-fest-writable-imported-alias.invalid.ts";
const importedAliasInvalidFixtureCode = readTypedFixture(
    importedAliasInvalidFixtureName
);
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
            `Expected prefer-type-fest-writable fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const insertTypeFestWritableImportAfterMutableImport = (
    sourceText: string
): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";

    return replaceOrThrow({
        replacement: `import type { Mutable } from "type-aliases";\nimport type { Writable } from "type-fest";${sourceLineEnding}`,
        sourceText,
        target: `import type { Mutable } from "type-aliases";${sourceLineEnding}`,
    });
};

const importedAliasFixtureFixableOutputCode = replaceOrThrow({
    replacement: "Writable<",
    sourceText: insertTypeFestWritableImportAfterMutableImport(
        importedAliasInvalidFixtureCode
    ),
    target: "Mutable<",
});
const inlineFixableInvalidCode = [
    'import type { Mutable } from "type-aliases";',
    'import type { Writable } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = Mutable<User>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type MutableUser = Writable<User>;",
    sourceText: inlineFixableInvalidCode,
    target: "type MutableUser = Mutable<User>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { Mutable } from "type-aliases";',
    "",
    "type Wrapper<Writable extends object> = Mutable<Writable>;",
].join("\n");
const mappedPKeyInvalidCode =
    "type WritableLike<T> = { -readonly [P in keyof T]: T[P] };";
const mappedWhitespaceVariantInvalidCode =
    "type WritableLike<T, U> = { -readonly [K in keyof (T & U)]: (T&U)[K] };";
const mappedNearMissReadonlyValidCode =
    "type WritableLike<T> = { readonly [K in keyof T]: T[K] };";
const mappedOptionalValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]?: T[K] };";
const mappedNameRemapValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T as K]-?: T[K] };";
const mappedNameRemapWithoutOptionalValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T as K]: T[K] };";
const mappedConstraintValidCode =
    "type WritableLike<T> = { -readonly [K in T]-?: T[K] };";
const mappedConstraintWithoutTypeOperatorValidCode =
    "type WritableLike<T> = { -readonly [K in T]: T[K] };";
const mappedReadonlyOperatorConstraintValidCode =
    "type WritableLike<T extends readonly unknown[]> = { -readonly [K in readonly T]: T[K] };";
const mappedNearMissIndexMismatchValidCode =
    "type WritableLike<T, P extends keyof T> = { -readonly [K in keyof T]: T[P] };";
const mappedLiteralIndexTypeValidCode =
    'type WritableLike<T extends { readonly id: string }> = { -readonly [K in keyof T]: T["id"] };';
const mappedNearMissObjectMismatchValidCode =
    "type WritableLike<T, U extends T> = { -readonly [K in keyof T]: U[K] };";
const mappedNonIndexedAccessValueValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]: K };";
const mappedNamespaceAliasValidCode = [
    'import type * as Aliases from "type-aliases";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = Aliases.Mutable<User>;",
].join("\n");
const validFixtureName = "prefer-type-fest-writable.valid.ts";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const generatedTypeNameArbitrary = fc.constantFrom(
    "User",
    "ReadonlyMonitor",
    "Config",
    "FeatureFlags",
    "Payload"
);

const parseWritableAliasTypeReferenceFromCode = (sourceText: string) => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from Writable<T>"
    );
};

interface WritableRuleMetadataSnapshot {
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        messages?: Record<string, string>;
    };
    name?: string;
}

const loadWritableRuleMetadata =
    async (): Promise<WritableRuleMetadataSnapshot> => {
        vi.resetModules();
        const moduleUnderTest =
            await import("../src/rules/prefer-type-fest-writable");

        return moduleUnderTest.default as WritableRuleMetadataSnapshot;
    };

type WritableMappedTypeNode = TSESTree.TSMappedType;
type WritableRuleCreateContext = Parameters<(typeof rule)["create"]>[0];

const createWritableMappedTypeNode = ({
    constraint,
    key,
    valueTypeAnnotation,
}: Readonly<{
    constraint: WritableMappedTypeNode["constraint"];
    key: WritableMappedTypeNode["key"];
    valueTypeAnnotation: WritableMappedTypeNode["typeAnnotation"];
}>): WritableMappedTypeNode =>
    ({
        constraint,
        key,
        nameType: null,
        optional: false,
        readonly: "-",
        type: "TSMappedType",
        typeAnnotation: valueTypeAnnotation,
    }) as unknown as WritableMappedTypeNode;

const createWritableMappedTypeListenerHarness = ({
    getText,
}: Readonly<{
    getText: (node: unknown) => string;
}>): {
    mappedTypeListener: (node: Readonly<WritableMappedTypeNode>) => void;
    report: ReturnType<typeof vi.fn>;
} => {
    const report = vi.fn();
    const sourceCode = {
        ast: {
            body: [],
        },
        getText,
    } as unknown as WritableRuleCreateContext["sourceCode"];
    const context = {
        filename: "src/writable-guard.ts",
        report,
        sourceCode,
    } as unknown as WritableRuleCreateContext;
    const listeners = rule.create(context) as Partial<
        Record<"TSMappedType", (node: Readonly<WritableMappedTypeNode>) => void>
    >;

    const mappedTypeListener = listeners.TSMappedType;
    if (!mappedTypeListener) {
        throw new Error("Expected TSMappedType listener to be defined");
    }

    return {
        mappedTypeListener,
        report,
    };
};

const createWritableIndexedAccessType = ({
    indexIdentifierName,
    objectType,
}: Readonly<{
    indexIdentifierName: string;
    objectType: TSESTree.TypeNode;
}>): TSESTree.TSIndexedAccessType =>
    ({
        indexType: {
            type: "TSTypeReference",
            typeName: {
                name: indexIdentifierName,
                type: "Identifier",
            },
        },
        objectType,
        type: "TSIndexedAccessType",
    }) as unknown as TSESTree.TSIndexedAccessType;

describe(ruleName, () => {
    it("exports expected metadata", async () => {
        const metadataRule = await loadWritableRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-type-fest-writable");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest Writable over manual mapped types that strip readonly with -readonly."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable"
        );
        expect(rule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable"
        );
        expect(metadataRule.meta?.messages?.["preferWritable"]).toBe(
            "Prefer `Writable<T>` from type-fest over `{-readonly [K in keyof T]: T[K]}`."
        );
        expect(metadataRule.meta?.messages?.["preferWritableAlias"]).toBe(
            "Prefer `{{replacement}}` from type-fest to remove readonly modifiers from selected keys instead of legacy alias `{{alias}}`."
        );
    });

    it("fast-check: Mutable alias replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(generatedTypeNameArbitrary, (valueTypeName) => {
                const generatedCode = [
                    'import type { Mutable } from "type-aliases";',
                    'import type { Writable } from "type-fest";',
                    `type MutableAlias = Mutable<${valueTypeName}>;`,
                ].join("\n");

                const replacedCode = replaceOrThrow({
                    replacement: `Writable<${valueTypeName}>`,
                    sourceText: generatedCode,
                    target: `Mutable<${valueTypeName}>`,
                });

                const tsReference =
                    parseWritableAliasTypeReferenceFromCode(replacedCode);

                expect(tsReference.typeName.type).toBe(
                    AST_NODE_TYPES.Identifier
                );

                if (tsReference.typeName.type === AST_NODE_TYPES.Identifier) {
                    expect(tsReference.typeName.name).toBe("Writable");
                }
            }),
            fastCheckRunConfig.default
        );
    });

    it("does not throw when mapped constraint is missing", () => {
        const baseTypeNode = {
            type: "TSTypeReference",
        } as unknown as TSESTree.TypeNode;
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint:
                undefined as unknown as WritableMappedTypeNode["constraint"],
            key: {
                name: "K",
                type: "Identifier",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: baseTypeNode,
            }),
        });
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T",
            });

        expect(() => {
            mappedTypeListener(mappedTypeNode);
        }).not.toThrow();

        expect(report).not.toHaveBeenCalled();
    });

    it("ignores mapped nodes with missing base type annotation", () => {
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: {
                operator: "keyof",
                type: "TSTypeOperator",
            } as unknown as TSESTree.TSTypeOperator,
            key: {
                name: "K",
                type: "Identifier",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: {
                    type: "TSTypeReference",
                } as unknown as TSESTree.TypeNode,
            }),
        });
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T",
            });

        mappedTypeListener(mappedTypeNode);

        expect(report).not.toHaveBeenCalled();
    });

    it("ignores mapped nodes when key is not an identifier", () => {
        const baseTypeNode = {
            type: "TSTypeReference",
        } as unknown as TSESTree.TypeNode;
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: {
                operator: "keyof",
                type: "TSTypeOperator",
                typeAnnotation: baseTypeNode,
            } as unknown as TSESTree.TSTypeOperator,
            key: {
                name: "K",
                type: "Literal",
                value: "K",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: baseTypeNode,
            }),
        });
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T",
            });

        mappedTypeListener(mappedTypeNode);

        expect(report).not.toHaveBeenCalled();
    });

    it("matches mapped type shape without text normalization", () => {
        const baseTypeNode = {
            type: "TSTypeReference",
        } as unknown as TSESTree.TypeNode;
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: {
                operator: "keyof",
                type: "TSTypeOperator",
                typeAnnotation: baseTypeNode,
            } as unknown as TSESTree.TSTypeOperator,
            key: {
                name: "K",
                type: "Identifier",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: baseTypeNode,
            }),
        });
        const getText = vi.fn(() => "T  \n\tU");
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText,
            });

        mappedTypeListener(mappedTypeNode);

        expect(getText).not.toHaveBeenCalled();
        expect(report).toHaveBeenCalledTimes(1);
    });
});

ruleTester.run(ruleName, rule, {
    invalid: [
        {
            code: importedAliasInvalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "Mutable",
                        replacement: "Writable",
                    },
                    messageId: "preferWritableAlias",
                },
            ],
            filename: typedFixturePath(importedAliasInvalidFixtureName),
            name: "reports fixture imported Mutable alias usage",
            output: importedAliasFixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Mutable",
                        replacement: "Writable",
                    },
                    messageId: "preferWritableAlias",
                },
            ],
            filename: typedFixturePath(importedAliasInvalidFixtureName),
            name: "reports and autofixes inline Mutable alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Mutable",
                        replacement: "Writable",
                    },
                    messageId: "preferWritableAlias",
                },
            ],
            filename: typedFixturePath(importedAliasInvalidFixtureName),
            name: "reports Mutable alias when replacement identifier is shadowed",
            output: null,
        },
        {
            code: readTypedFixture(mappedInvalidFixtureName),
            errors: [
                { messageId: "preferWritable" },
                { messageId: "preferWritable" },
            ],
            filename: typedFixturePath(mappedInvalidFixtureName),
            name: "reports fixture readonly mapped type aliases",
        },
        {
            code: mappedPKeyInvalidCode,
            errors: [{ messageId: "preferWritable" }],
            filename: typedFixturePath(mappedInvalidFixtureName),
            name: "reports mapped type using P key identifier",
        },
        {
            code: mappedWhitespaceVariantInvalidCode,
            errors: [{ messageId: "preferWritable" }],
            filename: typedFixturePath(mappedInvalidFixtureName),
            name: "reports mapped type when base and indexed object text differ only by whitespace",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: mappedNearMissReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type that retains readonly modifier",
        },
        {
            code: mappedOptionalValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type that preserves optional modifier",
        },
        {
            code: mappedNameRemapValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with key remapping and optional removal",
        },
        {
            code: mappedNameRemapWithoutOptionalValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with key remapping only",
        },
        {
            code: mappedConstraintValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with custom key constraint and optional removal",
        },
        {
            code: mappedConstraintWithoutTypeOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with custom key constraint",
        },
        {
            code: mappedReadonlyOperatorConstraintValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with readonly key constraint operator",
        },
        {
            code: mappedNearMissIndexMismatchValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with mismatched indexed access key",
        },
        {
            code: mappedLiteralIndexTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with literal indexed access value",
        },
        {
            code: mappedNearMissObjectMismatchValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type using alternate object source",
        },
        {
            code: mappedNonIndexedAccessValueValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with non-indexed value expression",
        },
        {
            code: mappedNamespaceAliasValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores namespace-qualified Mutable alias reference",
        },
    ],
});
