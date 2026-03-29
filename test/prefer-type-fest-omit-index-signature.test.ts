import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-omit-index-signature.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-omit-index-signature";
const docsDescription =
    "require TypeFest OmitIndexSignature over imported aliases such as RemoveIndexSignature.";
const preferOmitIndexSignatureMessage =
    "Prefer `{{replacement}}` from type-fest to strip index signatures from object types instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-omit-index-signature.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-omit-index-signature.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-omit-index-signature.invalid.ts";
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
            `Expected prefer-type-fest-omit-index-signature fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { RemoveIndexSignature } from "type-aliases";\nimport type { OmitIndexSignature } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { RemoveIndexSignature } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "OmitIndexSignature<",
    sourceText: fixtureFixableOutputCode,
    target: "RemoveIndexSignature<",
});
const inlineFixableInvalidCode = [
    'import type { RemoveIndexSignature } from "type-aliases";',
    'import type { OmitIndexSignature } from "type-fest";',
    "",
    "type Input = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement:
        "type Input = OmitIndexSignature<{ a: string; [key: string]: unknown }>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { RemoveIndexSignature } from "type-aliases";',
    "",
    "type Wrapper<OmitIndexSignature> = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
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

const parseOmitIndexSignatureTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an OmitIndexSignature type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferOmitIndexSignature: preferOmitIndexSignatureMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-omit-index-signature parse-safety guards", () => {
    it("fast-check: OmitIndexSignature replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `RemoveIndexSignature<{ ${keyPair.firstKey}: string; [${keyPair.secondKey}: string]: unknown }>`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { RemoveIndexSignature } from "type-aliases";',
                        'import type { OmitIndexSignature } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "OmitIndexSignature<{",
                        sourceText: generatedCode,
                        target: "RemoveIndexSignature<{",
                    });

                    const { tsReference } =
                        parseOmitIndexSignatureTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "OmitIndexSignature"
                        );
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
                        alias: "RemoveIndexSignature",
                        replacement: "OmitIndexSignature",
                    },
                    messageId: "preferOmitIndexSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture RemoveIndexSignature alias usage",
            output: fixtureFixableAliasOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RemoveIndexSignature",
                        replacement: "OmitIndexSignature",
                    },
                    messageId: "preferOmitIndexSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline RemoveIndexSignature alias",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RemoveIndexSignature",
                        replacement: "OmitIndexSignature",
                    },
                    messageId: "preferOmitIndexSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports RemoveIndexSignature alias when replacement identifier is shadowed",
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
            name: "accepts namespace-qualified OmitIndexSignature references",
        },
    ],
});
