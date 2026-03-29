/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-set.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-set");
const ruleTester = createRuleTester();

const validFixtureName = "prefer-type-fest-unknown-set.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-set.invalid.ts";
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
            `Expected prefer-type-fest-unknown-set fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { UnknownSet } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "Readonly<UnknownSet>",
        sourceText: invalidFixtureCode,
        target: "ReadonlySet<unknown>",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "Readonly<UnknownSet>",
    sourceText: fixtureFixableOutputCode,
    target: "ReadonlySet<unknown>",
});
const inlineInvalidSetCode = "type Input = Set<unknown>;";
const inlineInvalidReadonlySetCode = "type Input = ReadonlySet<unknown>;";
const inlineInvalidReadonlySetOutputCode = [
    'import type { UnknownSet } from "type-fest";',
    "type Input = Readonly<UnknownSet>;",
].join("\n");
const inlineValidSetCode = "type Input = Set<string>;";
const inlineValidReadonlySetCode = "type Input = ReadonlySet<number>;";
const inlineValidReadonlySetNoTypeArgumentsCode = "type Input = ReadonlySet;";
const inlineValidReadonlySetWrongArityCode =
    "type Input = ReadonlySet<unknown, unknown>;";
const inlineValidGlobalReadonlySetCode =
    "type Input = globalThis.ReadonlySet<unknown>;";
const inlineFixableCode = [
    'import type { UnknownSet } from "type-fest";',
    "",
    "type Input = ReadonlySet<unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownSet } from "type-fest";',
    "",
    "type Input = Readonly<UnknownSet>;",
].join("\n");
const inlineNoFixShadowedReplacementCode =
    "type Wrapper<UnknownSet> = ReadonlySet<unknown>;";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const generatedIdentifierArbitrary = fc.constantFrom(
    "alpha",
    "beta",
    "token",
    "tenant",
    "scope"
);

const parseReadonlyUnknownSetTypeReferenceFromCode = (sourceText: string) => {
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
        "Expected generated source text to include a type alias assigned from Readonly<UnknownSet>"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-unknown-set", {
    docsDescription:
        "require TypeFest UnknownSet over ReadonlySet<unknown> aliases.",
    enforceRuleShape: true,
    messages: {
        preferUnknownSet:
            "Prefer `Readonly<UnknownSet>` from type-fest over `ReadonlySet<unknown>`.",
    },
});

describe("prefer-type-fest-unknown-set source assertions", () => {
    it("matches ReadonlySet<unknown> in undecorated visitor", async () => {
        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-unknown-set")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                "type Input = ReadonlySet<unknown>;",
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const [firstStatement] = parsedResult.ast.body;

            expect(firstStatement?.type).toBe("TSTypeAliasDeclaration");

            if (
                firstStatement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration
            ) {
                throw new Error("Expected a type alias declaration statement");
            }

            const aliasAnnotation = firstStatement.typeAnnotation;

            expect(aliasAnnotation.type).toBe("TSTypeReference");

            if (aliasAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
                throw new Error("Expected a type reference in the type alias");
            }

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-unknown-set.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            listenerMap.TSTypeReference?.(aliasAnnotation);

            expect(report).toHaveBeenCalledTimes(1);
            expect(report).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageId: "preferUnknownSet",
                    node: aliasAnnotation,
                })
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: Readonly<UnknownSet> replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedIdentifierArbitrary,
                fc.boolean(),
                (valueTypeName, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { UnknownSet } from "type-fest";',
                        `type Input = ReadonlySet<${valueTypeName}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "Readonly<UnknownSet>",
                        sourceText: generatedCode,
                        target: `ReadonlySet<${valueTypeName}>`,
                    });

                    const tsReference =
                        parseReadonlyUnknownSetTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("Readonly");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run("prefer-type-fest-unknown-set", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferUnknownSet",
                },
                {
                    messageId: "preferUnknownSet",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture UnknownSet aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReadonlySetCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline ReadonlySet<unknown> alias",
            output: inlineInvalidReadonlySetOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlySet<unknown> when UnknownSet import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixShadowedReplacementCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlySet<unknown> when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: inlineInvalidSetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable Set<unknown> alias",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidSetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable Set with concrete element type",
        },
        {
            code: inlineValidReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet with concrete element type",
        },
        {
            code: inlineValidReadonlySetNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet without type arguments",
        },
        {
            code: inlineValidReadonlySetWrongArityCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet with invalid generic arity",
        },
        {
            code: inlineValidGlobalReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlySet reference",
        },
    ],
});
