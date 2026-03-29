import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-required.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-required.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-required.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-set-required.invalid.ts";
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
            `Expected prefer-type-fest-set-required fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { RequiredBy } from "type-aliases";\nimport type { SetRequired } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { RequiredBy } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "SetRequired<",
    sourceText: fixtureFixableOutputCode,
    target: "RequiredBy<",
});
const inlineFixableInvalidCode = [
    'import type { RequiredBy } from "type-aliases";',
    'import type { SetRequired } from "type-fest";',
    "",
    "type User = {",
    "    id?: string;",
    "};",
    "",
    'type StrictUser = RequiredBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: 'type StrictUser = SetRequired<User, "id">;',
    sourceText: inlineFixableInvalidCode,
    target: 'type StrictUser = RequiredBy<User, "id">;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { RequiredBy } from "type-aliases";',
    "",
    'type Wrapper<SetRequired extends object> = RequiredBy<SetRequired, "id">;',
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

const parseSetRequiredTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a SetRequired type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-set-required", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest SetRequired over imported aliases such as RequiredBy.",
    enforceRuleShape: true,
    messages: {
        preferSetRequired:
            "Prefer `{{replacement}}` from type-fest to make selected keys required instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-set-required",
});

describe("prefer-type-fest-set-required parse-safety guards", () => {
    it("fast-check: SetRequired replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `RequiredBy<{ ${keyPair.firstKey}?: string; ${keyPair.secondKey}?: number }, "${keyPair.firstKey}">`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { RequiredBy } from "type-aliases";',
                        'import type { SetRequired } from "type-fest";',
                        `type StrictUser = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "SetRequired<{",
                        sourceText: generatedCode,
                        target: "RequiredBy<{",
                    });

                    const { tsReference } =
                        parseSetRequiredTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("SetRequired");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-set-required",
    getPluginRule("prefer-type-fest-set-required"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "RequiredBy",
                            replacement: "SetRequired",
                        },
                        messageId: "preferSetRequired",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture MarkRequired and RequiredBy aliases",
                output: fixtureFixableAliasOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "RequiredBy",
                            replacement: "SetRequired",
                        },
                        messageId: "preferSetRequired",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline MarkRequired alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "RequiredBy",
                            replacement: "SetRequired",
                        },
                        messageId: "preferSetRequired",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports RequiredBy alias when replacement identifier is shadowed",
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
                name: "accepts namespace-qualified SetRequired references",
            },
        ],
    }
);
