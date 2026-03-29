import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-one-or-none.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-require-one-or-none";
const docsDescription =
    "require TypeFest RequireOneOrNone over imported aliases such as AtMostOne.";
const preferRequireOneOrNoneMessage =
    "Prefer `{{replacement}}` from type-fest to allow one-or-none key groups instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-require-one-or-none.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-one-or-none.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-require-one-or-none.invalid.ts";
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
            `Expected prefer-type-fest-require-one-or-none fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { AtMostOne } from "type-aliases";\nimport type { RequireOneOrNone } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { AtMostOne } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "RequireOneOrNone<",
    sourceText: fixtureFixableOutputCode,
    target: "AtMostOne<",
});
const inlineFixableInvalidCode = [
    'import type { AtMostOne } from "type-aliases";',
    'import type { RequireOneOrNone } from "type-fest";',
    "",
    "type Input = AtMostOne<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Input = RequireOneOrNone<{ a?: string; b?: number }>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = AtMostOne<{ a?: string; b?: number }>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { AtMostOne } from "type-aliases";',
    "",
    "type Wrapper<RequireOneOrNone> = AtMostOne<{ a?: string; b?: number }>;",
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

const parseRequireOneOrNoneTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a RequireOneOrNone type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferRequireOneOrNone: preferRequireOneOrNoneMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-require-one-or-none parse-safety guards", () => {
    it("fast-check: RequireOneOrNone replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `AtMostOne<{ ${keyPair.firstKey}?: string; ${keyPair.secondKey}?: number }>`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { AtMostOne } from "type-aliases";',
                        'import type { RequireOneOrNone } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "RequireOneOrNone<{",
                        sourceText: generatedCode,
                        target: "AtMostOne<{",
                    });

                    const { tsReference } =
                        parseRequireOneOrNoneTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "RequireOneOrNone"
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
                        alias: "AtMostOne",
                        replacement: "RequireOneOrNone",
                    },
                    messageId: "preferRequireOneOrNone",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture AtMostOne alias usage",
            output: fixtureFixableAliasOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "AtMostOne",
                        replacement: "RequireOneOrNone",
                    },
                    messageId: "preferRequireOneOrNone",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline AtMostOne alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "AtMostOne",
                        replacement: "RequireOneOrNone",
                    },
                    messageId: "preferRequireOneOrNone",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports AtMostOne alias when replacement identifier is shadowed",
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
            name: "accepts namespace-qualified RequireOneOrNone references",
        },
    ],
});
