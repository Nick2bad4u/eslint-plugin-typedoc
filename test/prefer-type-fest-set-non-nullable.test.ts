import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-non-nullable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-non-nullable.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-non-nullable.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-set-non-nullable.invalid.ts";
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
            `Expected prefer-type-fest-set-non-nullable fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { NonNullableBy } from "type-aliases";\nimport type { SetNonNullable } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { NonNullableBy } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "SetNonNullable<",
    sourceText: fixtureFixableOutputCode,
    target: "NonNullableBy<",
});
const inlineFixableInvalidCode = [
    'import type { NonNullableBy } from "type-aliases";',
    'import type { SetNonNullable } from "type-fest";',
    "",
    "type User = {",
    "    id: string | null;",
    "};",
    "",
    'type Normalized = NonNullableBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: 'type Normalized = SetNonNullable<User, "id">;',
    sourceText: inlineFixableInvalidCode,
    target: 'type Normalized = NonNullableBy<User, "id">;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { NonNullableBy } from "type-aliases";',
    "",
    "type User = {",
    "    id: string | null;",
    "};",
    "",
    'type Wrapper<SetNonNullable> = NonNullableBy<User, "id">;',
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

const parseSetNonNullableTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a SetNonNullable type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-set-non-nullable", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest SetNonNullable over imported aliases such as NonNullableBy.",
    enforceRuleShape: true,
    messages: {
        preferSetNonNullable:
            "Prefer `{{replacement}}` from type-fest to make selected keys non-nullable instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-set-non-nullable",
});

describe("prefer-type-fest-set-non-nullable parse-safety guards", () => {
    it("fast-check: SetNonNullable replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `NonNullableBy<{ ${keyPair.firstKey}: string | null; ${keyPair.secondKey}: number | null }, "${keyPair.firstKey}">`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { NonNullableBy } from "type-aliases";',
                        'import type { SetNonNullable } from "type-fest";',
                        `type Normalized = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "SetNonNullable<{",
                        sourceText: generatedCode,
                        target: "NonNullableBy<{",
                    });

                    const { tsReference } =
                        parseSetNonNullableTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "SetNonNullable"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-set-non-nullable",
    getPluginRule("prefer-type-fest-set-non-nullable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "NonNullableBy",
                            replacement: "SetNonNullable",
                        },
                        messageId: "preferSetNonNullable",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture SetComplement and SetDifference aliases",
                output: fixtureFixableAliasOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "NonNullableBy",
                            replacement: "SetNonNullable",
                        },
                        messageId: "preferSetNonNullable",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline SetComplement alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "NonNullableBy",
                            replacement: "SetNonNullable",
                        },
                        messageId: "preferSetNonNullable",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports NonNullableBy alias when replacement identifier is shadowed",
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
                name: "accepts namespace-qualified SetNonNullable references",
            },
        ],
    }
);
