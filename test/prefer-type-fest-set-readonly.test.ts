import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-readonly.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-set-readonly";
const docsDescription =
    "require TypeFest SetReadonly over imported aliases such as ReadonlyBy.";
const preferSetReadonlyMessage =
    "Prefer `{{replacement}}` from type-fest to mark selected keys readonly instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-set-readonly.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-readonly.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-set-readonly.invalid.ts";
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
            `Expected prefer-type-fest-set-readonly fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'import type { ReadonlyBy } from "type-aliases";\nimport type { SetReadonly } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { ReadonlyBy } from "type-aliases";\r\n',
});
const fixtureFixableAliasOutputCode = replaceOrThrow({
    replacement: "SetReadonly<",
    sourceText: fixtureFixableOutputCode,
    target: "ReadonlyBy<",
});
const inlineFixableInvalidCode = [
    'import type { ReadonlyBy } from "type-aliases";',
    'import type { SetReadonly } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    'type FrozenUser = ReadonlyBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: 'type FrozenUser = SetReadonly<User, "id">;',
    sourceText: inlineFixableInvalidCode,
    target: 'type FrozenUser = ReadonlyBy<User, "id">;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { ReadonlyBy } from "type-aliases";',
    "",
    'type Wrapper<SetReadonly extends object> = ReadonlyBy<SetReadonly, "id">;',
].join("\n");
const fixtureSafePatternsValidCase = {
    code: readTypedFixture(validFixtureName),
    filename: typedFixturePath(validFixtureName),
    name: "accepts fixture-safe patterns",
} as const;

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

const parseSetReadonlyTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a SetReadonly type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferSetReadonly: preferSetReadonlyMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-set-readonly parse-safety guards", () => {
    it("fast-check: SetReadonly replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                keyNamePairArbitrary,
                fc.boolean(),
                (keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `ReadonlyBy<{ ${keyPair.firstKey}: string; ${keyPair.secondKey}: number }, "${keyPair.firstKey}">`;
                    const generatedCode = [
                        unicodeLine,
                        'import type { ReadonlyBy } from "type-aliases";',
                        'import type { SetReadonly } from "type-fest";',
                        `type FrozenUser = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "SetReadonly<{",
                        sourceText: generatedCode,
                        target: "ReadonlyBy<{",
                    });

                    const { tsReference } =
                        parseSetReadonlyTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("SetReadonly");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe(
    "prefer-type-fest-set-readonly RuleTester fixture validity",
    {
        timeout: 120_000,
    },
    () => {
        ruleTester.run(
            "prefer-type-fest-set-readonly fixture validity",
            getPluginRule(ruleId),
            {
                invalid: [],
                valid: [fixtureSafePatternsValidCase],
            }
        );
    }
);

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyBy",
                        replacement: "SetReadonly",
                    },
                    messageId: "preferSetReadonly",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture MarkReadonly and ReadonlyBy aliases",
            output: fixtureFixableAliasOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyBy",
                        replacement: "SetReadonly",
                    },
                    messageId: "preferSetReadonly",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline MarkReadonly alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyBy",
                        replacement: "SetReadonly",
                    },
                    messageId: "preferSetReadonly",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyBy alias when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(namespaceValidFixtureName),
            filename: typedFixturePath(namespaceValidFixtureName),
            name: "accepts namespace-qualified SetReadonly references",
        },
    ],
});
