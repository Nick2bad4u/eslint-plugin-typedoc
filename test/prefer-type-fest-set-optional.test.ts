import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-optional.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-optional.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-optional.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-set-optional.invalid.ts";
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
            `Expected prefer-type-fest-set-optional fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { PartialBy } from "type-aliases";\nimport type { SetOptional } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { PartialBy } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "SetOptional<",
    sourceText: fixtureFixableOutputCode,
    target: "PartialBy<",
});
const inlineFixableInvalidCode = [
    'import type { PartialBy } from "type-aliases";',
    'import type { SetOptional } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    'type MaybeUser = PartialBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: 'type MaybeUser = SetOptional<User, "id">;',
    sourceText: inlineFixableInvalidCode,
    target: 'type MaybeUser = PartialBy<User, "id">;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { PartialBy } from "type-aliases";',
    "",
    'type Wrapper<SetOptional extends object> = PartialBy<SetOptional, "id">;',
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

const parseSetOptionalTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a SetOptional type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-set-optional", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest SetOptional over imported alias types like PartialBy.",
    enforceRuleShape: true,
    messages: {
        preferSetOptional:
            "Prefer `{{replacement}}` from type-fest to make selected keys optional instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-set-optional",
});

describe("prefer-type-fest-set-optional parse-safety guards", () => {
    it("fast-check: SetOptional replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `PartialBy<{ ${keyPair.firstKey}: string; ${keyPair.secondKey}: number }, "${keyPair.firstKey}">`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { PartialBy } from "type-aliases";',
                        'import type { SetOptional } from "type-fest";',
                        `type MaybeUser = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "SetOptional<{",
                        sourceText: generatedCode,
                        target: "PartialBy<{",
                    });

                    const { tsReference } =
                        parseSetOptionalTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("SetOptional");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-set-optional",
    getPluginRule("prefer-type-fest-set-optional"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "PartialBy",
                            replacement: "SetOptional",
                        },
                        messageId: "preferSetOptional",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture MarkOptional and PartialBy aliases",
                output: fixtureFixableAliasOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PartialBy",
                            replacement: "SetOptional",
                        },
                        messageId: "preferSetOptional",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline MarkOptional alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PartialBy",
                            replacement: "SetOptional",
                        },
                        messageId: "preferSetOptional",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports PartialBy alias when replacement identifier is shadowed",
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
                name: "accepts namespace-qualified SetOptional references",
            },
        ],
    }
);
