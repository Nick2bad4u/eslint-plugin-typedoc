import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-keys-of-union.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-keys-of-union";
const docsDescription =
    "require TypeFest KeysOfUnion over imported aliases such as AllKeys.";
const preferKeysOfUnionMessage =
    "Prefer `{{replacement}}` from type-fest to derive keys from union members instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-keys-of-union.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-keys-of-union.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-keys-of-union.invalid.ts";
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
            `Expected prefer-type-fest-keys-of-union fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { AllKeys } from "type-aliases";\nimport type { KeysOfUnion } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { AllKeys } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "KeysOfUnion<",
    sourceText: fixtureFixableOutputCode,
    target: "AllKeys<",
});
const inlineFixableInvalidCode = [
    'import type { AllKeys } from "type-aliases";',
    'import type { KeysOfUnion } from "type-fest";',
    "",
    "type Input = AllKeys<{ a: string } | { b: number }>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Input = KeysOfUnion<{ a: string } | { b: number }>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = AllKeys<{ a: string } | { b: number }>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { AllKeys } from "type-aliases";',
    "",
    "type Wrapper<KeysOfUnion> = AllKeys<{ a: string } | { b: number }>;",
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

const parseKeysOfUnionTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a KeysOfUnion type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferKeysOfUnion: preferKeysOfUnionMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-keys-of-union parse-safety guards", () => {
    it("fast-check: KeysOfUnion replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `AllKeys<{ ${keyPair.firstKey}: string } | { ${keyPair.secondKey}: number }>`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { AllKeys } from "type-aliases";',
                        'import type { KeysOfUnion } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "KeysOfUnion<{",
                        sourceText: generatedCode,
                        target: "AllKeys<{",
                    });

                    const { tsReference } =
                        parseKeysOfUnionTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("KeysOfUnion");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "AllKeys",
                        replacement: "KeysOfUnion",
                    },
                    messageId: "preferKeysOfUnion",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture AllKeys alias usage",
            output: fixtureFixableAliasOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "AllKeys",
                        replacement: "KeysOfUnion",
                    },
                    messageId: "preferKeysOfUnion",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline AllKeys alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "AllKeys",
                        replacement: "KeysOfUnion",
                    },
                    messageId: "preferKeysOfUnion",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports AllKeys alias when replacement identifier is shadowed",
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
            name: "accepts namespace-qualified KeysOfUnion references",
        },
    ],
});
