/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-map.test` behavior.
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

const rule = getPluginRule("prefer-type-fest-unknown-map");
const ruleTester = createRuleTester();

const validFixtureName = "prefer-type-fest-unknown-map.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-map.invalid.ts";
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
            `Expected prefer-type-fest-unknown-map fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { UnknownMap } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "Readonly<UnknownMap>",
        sourceText: invalidFixtureCode,
        target: "ReadonlyMap<unknown, unknown>",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "Readonly<UnknownMap>",
    sourceText: fixtureFixableOutputCode,
    target: "ReadonlyMap<unknown, unknown>",
});
const inlineInvalidMapCode = "type Input = Map<unknown, unknown>;";
const inlineInvalidReadonlyMapCode =
    "type Input = ReadonlyMap<unknown, unknown>;";
const inlineInvalidReadonlyMapOutputCode = [
    'import type { UnknownMap } from "type-fest";',
    "type Input = Readonly<UnknownMap>;",
].join("\n");
const inlineValidMixedMapCode = "type Input = Map<string, unknown>;";
const inlineValidMixedReadonlyMapCode =
    "type Input = ReadonlyMap<unknown, string>;";
const inlineValidReadonlyMapWithUnknownValueCode =
    "type Input = ReadonlyMap<string, unknown>;";
const inlineValidReadonlyMapNoTypeArgumentsCode = "type Input = ReadonlyMap;";
const inlineValidReadonlyMapWrongArityCode =
    "type Input = ReadonlyMap<unknown, unknown, unknown>;";
const inlineValidGlobalReadonlyMapCode =
    "type Input = globalThis.ReadonlyMap<unknown, unknown>;";
const inlineFixableCode = [
    'import type { UnknownMap } from "type-fest";',
    "",
    "type Input = ReadonlyMap<unknown, unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownMap } from "type-fest";',
    "",
    "type Input = Readonly<UnknownMap>;",
].join("\n");
const inlineNoFixShadowedReplacementCode =
    "type Wrapper<UnknownMap> = ReadonlyMap<unknown, unknown>;";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const keyNamePairArbitrary = fc
    .shuffledSubarray(
        [
            "alpha",
            "beta",
            "key",
            "token",
            "tenant",
            "scope",
        ],
        {
            maxLength: 2,
            minLength: 2,
        }
    )
    .map(([firstKey, secondKey]) => ({
        firstKey,
        secondKey,
    }));

const parseReadonlyUnknownMapTypeReferenceFromCode = (sourceText: string) => {
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
        "Expected generated source text to include a type alias assigned from Readonly<UnknownMap>"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-unknown-map", {
    docsDescription:
        "require TypeFest UnknownMap over ReadonlyMap<unknown, unknown> aliases.",
    enforceRuleShape: true,
    messages: {
        preferUnknownMap:
            "Prefer `Readonly<UnknownMap>` from type-fest over `ReadonlyMap<unknown, unknown>`.",
    },
});

describe("prefer-type-fest-unknown-map source assertions", () => {
    it("matches only ReadonlyMap<unknown, unknown> in undecorated visitor", async () => {
        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-unknown-map")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                [
                    "type Reported = ReadonlyMap<unknown, unknown>;",
                    "type Ignored = ReadonlyMap<string, unknown>;",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const [reportedAlias, ignoredAlias] = parsedResult.ast.body;

            if (
                reportedAlias?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration ||
                ignoredAlias?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration
            ) {
                throw new Error("Expected two type alias declarations in AST");
            }

            const reportedTypeReference = reportedAlias.typeAnnotation;
            const ignoredTypeReference = ignoredAlias.typeAnnotation;

            if (
                reportedTypeReference.type !== AST_NODE_TYPES.TSTypeReference ||
                ignoredTypeReference.type !== AST_NODE_TYPES.TSTypeReference
            ) {
                throw new Error(
                    "Expected type alias annotations to be type references"
                );
            }

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-unknown-map.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            listenerMap.TSTypeReference?.(reportedTypeReference);
            listenerMap.TSTypeReference?.(ignoredTypeReference);

            expect(report).toHaveBeenCalledTimes(1);
            expect(report).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageId: "preferUnknownMap",
                    node: reportedTypeReference,
                })
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: Readonly<UnknownMap> replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { UnknownMap } from "type-fest";',
                        `type Input = ReadonlyMap<${keyPair.firstKey}, ${keyPair.secondKey}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "Readonly<UnknownMap>",
                        sourceText: generatedCode,
                        target: `ReadonlyMap<${keyPair.firstKey}, ${keyPair.secondKey}>`,
                    });

                    const tsReference =
                        parseReadonlyUnknownMapTypeReferenceFromCode(
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

ruleTester.run("prefer-type-fest-unknown-map", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferUnknownMap",
                },
                {
                    messageId: "preferUnknownMap",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture UnknownMap aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReadonlyMapCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown map shorthand",
            output: inlineInvalidReadonlyMapOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlyMap<unknown, unknown> when UnknownMap import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixShadowedReplacementCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyMap<unknown, unknown> when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: inlineInvalidMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown map shorthand alias",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidMixedMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown map alias",
        },
        {
            code: inlineValidMixedReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly map with mismatched value type",
        },
        {
            code: inlineValidReadonlyMapWithUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly map with non-unknown key type",
        },
        {
            code: inlineValidReadonlyMapNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyMap without generic arguments",
        },
        {
            code: inlineValidReadonlyMapWrongArityCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyMap with wrong generic arity",
        },
        {
            code: inlineValidGlobalReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlyMap reference",
        },
    ],
});
