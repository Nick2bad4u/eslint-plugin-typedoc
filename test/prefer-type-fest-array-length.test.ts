/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-array-length` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
    warmTypedParserServices,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-array-length";
const docsDescription =
    'require TypeFest ArrayLength over array and tuple `T["length"]` type queries.';
const validFixtureName = "prefer-type-fest-array-length.valid.ts";
const invalidFixtureName = "prefer-type-fest-array-length.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const invalidFixtureOutputCode = invalidFixtureCode.replace(
    'type StepCount = EventSteps["length"];',
    "type StepCount = ArrayLength<EventSteps>;"
);
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseArrayLengthTypeReferenceFromCode = (
    sourceText: string
): TSESTree.TSTypeReference => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "Length" &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from an ArrayLength type reference"
    );
};

warmTypedParserServices(typedFixturePath(validFixtureName));

describe("prefer-type-fest-array-length parse-safety guards", () => {
    it("fast-check: ArrayLength replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "readonly [1, 2, 3]",
                    "string[]",
                    'readonly ["queued", "running", ...string[]]'
                ),
                fc.boolean(),
                (arrayType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { ArrayLength } from "type-fest";',
                        `type Length = ${arrayType}["length"];`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type Length = ${arrayType}["length"];`,
                        `type Length = ArrayLength<${arrayType}>;`
                    );

                    const tsReference =
                        parseArrayLengthTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("ArrayLength");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferArrayLength:
            'Prefer `ArrayLength<T>` from type-fest over array and tuple `T["length"]` type queries.',
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [{ messageId: "preferArrayLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports tuple length indexed-access patterns",
            output: invalidFixtureOutputCode,
        },
        {
            code: 'type Wrapper<ArrayLength> = readonly [1, 2]["length"];',
            errors: [{ messageId: "preferArrayLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports but does not autofix when ArrayLength is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts existing ArrayLength usage and non-array length properties",
        },
    ],
});
