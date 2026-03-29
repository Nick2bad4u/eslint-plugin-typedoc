import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-conditional-pick.test` behavior.
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

const validFixtureName = "prefer-type-fest-conditional-pick.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-conditional-pick.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-conditional-pick.invalid.ts";
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
            `Expected prefer-type-fest-conditional-pick fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { PickByTypes } from "type-aliases";\nimport type { ConditionalPick } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { PickByTypes } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "ConditionalPick<",
    sourceText: fixtureFixableOutputCode,
    target: "PickByTypes<",
});
const inlineFixableInvalidCode = [
    'import type { PickByTypes } from "type-aliases";',
    'import type { ConditionalPick } from "type-fest";',
    "",
    "type Input = PickByTypes<{ a: string; b: number }, string>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement:
        "type Input = ConditionalPick<{ a: string; b: number }, string>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = PickByTypes<{ a: string; b: number }, string>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { PickByTypes } from "type-aliases";',
    "",
    "type Wrapper<ConditionalPick> = PickByTypes<{ a: string; b: number }, string>;",
].join("\n");

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
            "firstName",
            "lastName",
            "userId",
            "tenantId",
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

const parseConditionalPickTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    tsReference: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return {
                ast: parsed.ast,
                tsReference: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a ConditionalPick type reference"
    );
};

interface ConditionalPickRuleMetadataSnapshot {
    create: (context: unknown) => unknown;
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

const loadConditionalPickRuleMetadata =
    async (): Promise<ConditionalPickRuleMetadataSnapshot> => {
        vi.resetModules();

        const moduleUnderTest =
            await import("../src/rules/prefer-type-fest-conditional-pick");

        return moduleUnderTest.default as ConditionalPickRuleMetadataSnapshot;
    };

describe("prefer-type-fest-conditional-pick metadata", () => {
    it("exports expected metadata", async () => {
        const metadataRule = await loadConditionalPickRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-type-fest-conditional-pick");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest ConditionalPick over imported aliases such as PickByTypes."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-pick"
        );
        expect(metadataRule.meta?.messages?.["preferConditionalPick"]).toBe(
            "Prefer `{{replacement}}` from type-fest to pick keys whose values match a condition instead of legacy alias `{{alias}}`."
        );
    });
});

describe("prefer-type-fest-conditional-pick parse-safety guards", () => {
    it("fast-check: ConditionalPick replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `PickByTypes<{ ${keyPair.firstKey}: string; ${keyPair.secondKey}: number }, string>`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { PickByTypes } from "type-aliases";',
                        'import type { ConditionalPick } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "ConditionalPick<{",
                        sourceText: generatedCode,
                        target: "PickByTypes<{",
                    });

                    const { tsReference } =
                        parseConditionalPickTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "ConditionalPick"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-conditional-pick",
    getPluginRule("prefer-type-fest-conditional-pick"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture PickByTypes alias usage",
                output: fixtureFixableAliasOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline PickByTypes alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports PickByTypes alias when replacement identifier is shadowed",
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
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-qualified type-fest references",
            },
        ],
    }
);
