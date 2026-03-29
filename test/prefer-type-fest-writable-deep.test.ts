import type { UnknownArray, UnknownRecord } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable-deep.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const writableDeepRule = getPluginRule("prefer-type-fest-writable-deep");

const validFixtureName = "prefer-type-fest-writable-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-writable-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
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
            `Expected prefer-type-fest-writable-deep fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { WritableDeep } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "WritableDeep<TeamConfig>",
        sourceText: invalidFixtureCode,
        target: "DeepMutable<TeamConfig>",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "WritableDeep<TeamConfig>",
    sourceText: fixtureFixableOutputCode,
    target: "MutableDeep<TeamConfig>",
});
const inlineFixableInvalidCode = [
    'import type { DeepMutable } from "type-aliases";',
    'import type { WritableDeep } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = DeepMutable<User>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type MutableUser = WritableDeep<User>;",
    sourceText: inlineFixableInvalidCode,
    target: "type MutableUser = DeepMutable<User>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { DeepMutable } from "type-aliases";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type Wrapper<WritableDeep> = DeepMutable<User>;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const writableDeepAliasArbitrary = fc.constantFrom(
    "DeepMutable",
    "MutableDeep"
);
const writableDeepTypeNameArbitrary = fc.constantFrom(
    "User",
    "TeamConfig",
    "Payload",
    "FeatureFlags"
);

const parseWritableDeepTypeReferenceFromCode = (sourceText: string) => {
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
        "Expected generated source text to include a type alias assigned from WritableDeep<T>"
    );
};

ruleTester.run("prefer-type-fest-writable-deep", writableDeepRule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferWritableDeep" },
                { messageId: "preferWritableDeep" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture DeepMutable aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferWritableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline DeepMutable alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [{ messageId: "preferWritableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports DeepMutable alias when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
    ],
});

describe("prefer-type-fest-writable-deep parse-safety guards", () => {
    it("fast-check: WritableDeep replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                writableDeepAliasArbitrary,
                writableDeepTypeNameArbitrary,
                (aliasName, valueTypeName) => {
                    const generatedCode = [
                        'import type { WritableDeep } from "type-fest";',
                        `type Candidate = ${aliasName}<${valueTypeName}>;`,
                    ].join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: `WritableDeep<${valueTypeName}>`,
                        sourceText: generatedCode,
                        target: `${aliasName}<${valueTypeName}>`,
                    });

                    const tsReference =
                        parseWritableDeepTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("WritableDeep");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

interface WritableDeepRuleMetadataSnapshot {
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

const loadWritableDeepRuleMetadata =
    async (): Promise<WritableDeepRuleMetadataSnapshot> => {
        vi.resetModules();
        const moduleUnderTest =
            await import("../src/rules/prefer-type-fest-writable-deep");

        return moduleUnderTest.default as WritableDeepRuleMetadataSnapshot;
    };

describe("prefer-type-fest-writable-deep metadata", () => {
    it("declares stable metadata values", async () => {
        const metadataRule = await loadWritableDeepRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.name).toBe("prefer-type-fest-writable-deep");
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest WritableDeep over `DeepMutable` and `MutableDeep` aliases."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
        );
        expect(writableDeepRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
        );
        expect(metadataRule.meta?.messages?.["preferWritableDeep"]).toBe(
            "Prefer `WritableDeep` from type-fest over `DeepMutable`/`MutableDeep`."
        );
    });
});

interface WritableDeepRuleModuleForCreate {
    create: (
        context: Readonly<{
            filename?: string | undefined;
            sourceCode: object;
        }>
    ) => UnknownRecord;
}

describe("prefer-type-fest-writable-deep filename fallback", () => {
    it("keeps create callable when filename is omitted", async () => {
        expect.hasAssertions();

        const collectDirectNamedImportsFromSourceMock = vi.fn(
            () => new Set<string>()
        );

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource:
                        collectDirectNamedImportsFromSourceMock,
                    createSafeTypeReferenceReplacementFix: () => undefined,
                })
            );

            const moduleUnderTest =
                (await import("../src/rules/prefer-type-fest-writable-deep")) as unknown as {
                    default: WritableDeepRuleModuleForCreate;
                };

            expect(() => {
                moduleUnderTest.default.create({
                    sourceCode: {
                        ast: {
                            body: [],
                        },
                    },
                });
            }).not.toThrow();
            expect(collectDirectNamedImportsFromSourceMock).toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.resetModules();
        }
    });
});
