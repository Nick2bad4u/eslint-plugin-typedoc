import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-primitive.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-primitive";
const docsDescription =
    "require TypeFest Primitive over explicit primitive keyword unions.";
const preferPrimitiveMessage =
    "Prefer `Primitive` from type-fest over explicit primitive keyword unions.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-primitive.valid.ts";
const partialValidFixtureName = "prefer-type-fest-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-primitive.invalid.ts";
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
            `Expected prefer-type-fest-primitive fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const primitiveUnionFixtureSegment =
    "    | bigint\r\n    | boolean\r\n    | null\r\n    | number\r\n    | string\r\n    | symbol\r\n    | undefined";
const fixtureFixableOutputCode = `import type { Primitive } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "    Primitive",
        sourceText: invalidFixtureCode,
        target: primitiveUnionFixtureSegment,
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "    Primitive",
    sourceText: fixtureFixableOutputCode,
    target: primitiveUnionFixtureSegment,
});
const nonPrimitiveKeywordUnionValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | object;";
const duplicatePrimitiveMemberValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined | string;";
const missingBigIntValidCode =
    "type PrimitiveLike = boolean | null | number | string | symbol | undefined;";
const missingBooleanValidCode =
    "type PrimitiveLike = bigint | null | number | string | symbol | undefined;";
const missingNullValidCode =
    "type PrimitiveLike = bigint | boolean | number | string | symbol | undefined;";
const missingNumberValidCode =
    "type PrimitiveLike = bigint | boolean | null | string | symbol | undefined;";
const missingStringValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | symbol | undefined;";
const missingSymbolValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | undefined;";
const missingUndefinedValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol;";
const missingBigIntWithDuplicateBooleanValidCode =
    "type PrimitiveLike = boolean | null | number | string | symbol | undefined | boolean;";
const missingBooleanWithDuplicateBigIntValidCode =
    "type PrimitiveLike = bigint | null | number | string | symbol | undefined | bigint;";
const missingNullWithDuplicateNumberValidCode =
    "type PrimitiveLike = bigint | boolean | number | string | symbol | undefined | number;";
const missingNumberWithDuplicateStringValidCode =
    "type PrimitiveLike = bigint | boolean | null | string | symbol | undefined | string;";
const missingStringWithDuplicateSymbolValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | symbol | undefined | symbol;";
const missingSymbolWithDuplicateUndefinedValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | undefined | undefined;";
const missingUndefinedWithDuplicateNullValidCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | null;";
const inlineInvalidWithoutFixCode =
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined;";
const inlineInvalidWithoutFixOutputCode = [
    'import type { Primitive } from "type-fest";',
    "type PrimitiveLike = Primitive;",
].join("\n");
const inlineFixableCode = [
    'import type { Primitive } from "type-fest";',
    "",
    "type PrimitiveLike = bigint | boolean | null | number | string | symbol | undefined;",
].join("\n");
const inlineFixableOutput = [
    'import type { Primitive } from "type-fest";',
    "",
    "type PrimitiveLike = Primitive;",
].join("\n");
const inlineNoFixShadowedReplacementCode = [
    "type Wrapper<Primitive> =",
    "    bigint | boolean | null | number | string | symbol | undefined;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const primitiveUnionMemberArbitrary = fc.shuffledSubarray(
    [
        "bigint",
        "boolean",
        "null",
        "number",
        "string",
        "symbol",
        "undefined",
    ],
    { maxLength: 7, minLength: 7 }
);

const parsePrimitiveTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a Primitive type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferPrimitive: preferPrimitiveMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-primitive parse-safety guards", () => {
    it("fast-check: Primitive replacement remains parseable across union ordering", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                primitiveUnionMemberArbitrary,
                fc.boolean(),
                (unionMembers, includeUnicodeLine) => {
                    const primitiveUnion = unionMembers.join(" | ");
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { Primitive } from "type-fest";',
                        `type PrimitiveLike = ${primitiveUnion};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "Primitive",
                        sourceText: generatedCode,
                        target: primitiveUnion,
                    });

                    const { tsReference } =
                        parsePrimitiveTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("Primitive");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferPrimitive",
                },
                {
                    messageId: "preferPrimitive",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture primitive alias unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports primitive keyword union without fix when Primitive import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes primitive keyword union when Primitive import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixShadowedReplacementCode,
            errors: [{ messageId: "preferPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports primitive union when replacement identifier is shadowed",
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
            code: readTypedFixture(partialValidFixtureName),
            filename: typedFixturePath(partialValidFixtureName),
            name: "accepts partial primitive union fixture",
        },
        {
            code: nonPrimitiveKeywordUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union containing non-primitive object keyword",
        },
        {
            code: duplicatePrimitiveMemberValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union with duplicate members",
        },
        {
            code: missingBigIntValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing bigint",
        },
        {
            code: missingBooleanValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing boolean",
        },
        {
            code: missingNullValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing null",
        },
        {
            code: missingNumberValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing number",
        },
        {
            code: missingStringValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing string",
        },
        {
            code: missingSymbolValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing symbol",
        },
        {
            code: missingUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores primitive union missing undefined",
        },
        {
            code: missingBigIntWithDuplicateBooleanValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing bigint with duplicate boolean",
        },
        {
            code: missingBooleanWithDuplicateBigIntValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing boolean with duplicate bigint",
        },
        {
            code: missingNullWithDuplicateNumberValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing null with duplicate number",
        },
        {
            code: missingNumberWithDuplicateStringValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing number with duplicate string",
        },
        {
            code: missingStringWithDuplicateSymbolValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing string with duplicate symbol",
        },
        {
            code: missingSymbolWithDuplicateUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing symbol with duplicate undefined",
        },
        {
            code: missingUndefinedWithDuplicateNullValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores 7-member primitive union missing undefined with duplicate null",
        },
    ],
});
