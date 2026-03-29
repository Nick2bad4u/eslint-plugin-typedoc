import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-at-least-one.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
    warmTypedParserServices,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-require-at-least-one";
const docsDescription =
    "require TypeFest RequireAtLeastOne over imported aliases such as AtLeastOne.";
const preferRequireAtLeastOneMessage =
    "Prefer `{{replacement}}` from type-fest to require at least one key from a group instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-require-at-least-one.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-at-least-one.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-require-at-least-one.invalid.ts";
warmTypedParserServices(typedFixturePath(validFixtureName));

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
            `Expected prefer-type-fest-require-at-least-one fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { AtLeastOne } from "type-aliases";\nimport type { RequireAtLeastOne } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { AtLeastOne } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "RequireAtLeastOne<",
    sourceText: fixtureFixableOutputCode,
    target: "AtLeastOne<",
});
const inlineFixableInvalidCode = [
    'import type { AtLeastOne } from "type-aliases";',
    'import type { RequireAtLeastOne } from "type-fest";',
    "",
    "type Input = AtLeastOne<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Input = RequireAtLeastOne<{ a?: string; b?: number }>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = AtLeastOne<{ a?: string; b?: number }>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { AtLeastOne } from "type-aliases";',
    "",
    "type Wrapper<RequireAtLeastOne> = AtLeastOne<{ a?: string; b?: number }>;",
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

const parseRequireAtLeastOneTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a RequireAtLeastOne type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferRequireAtLeastOne: preferRequireAtLeastOneMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-require-at-least-one parse-safety guards", () => {
    it("fast-check: RequireAtLeastOne replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `AtLeastOne<{ ${keyPair.firstKey}?: string; ${keyPair.secondKey}?: number }>`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { AtLeastOne } from "type-aliases";',
                        'import type { RequireAtLeastOne } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "RequireAtLeastOne<{",
                        sourceText: generatedCode,
                        target: "AtLeastOne<{",
                    });

                    const { tsReference } =
                        parseRequireAtLeastOneTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "RequireAtLeastOne"
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
                        alias: "AtLeastOne",
                        replacement: "RequireAtLeastOne",
                    },
                    messageId: "preferRequireAtLeastOne",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture AtLeastOne alias usage",
            output: fixtureFixableAliasOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "AtLeastOne",
                        replacement: "RequireAtLeastOne",
                    },
                    messageId: "preferRequireAtLeastOne",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline AtLeastOne alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "AtLeastOne",
                        replacement: "RequireAtLeastOne",
                    },
                    messageId: "preferRequireAtLeastOne",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports AtLeastOne alias when replacement identifier is shadowed",
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
            name: "accepts namespace-qualified RequireAtLeastOne references",
        },
    ],
});
