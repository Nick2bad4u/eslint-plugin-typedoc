/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-union-member` behavior.
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
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-union-member";
const docsDescription =
    "require TypeFest UnionMember over custom union-member extraction helpers based on `UnionToIntersection`.";
const validFixtureName = "prefer-type-fest-union-member.valid.ts";
const invalidFixtureName = "prefer-type-fest-union-member.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
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
            `Expected prefer-type-fest-union-member fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const invalidFixtureOutputCode = replaceOrThrow({
    replacement: ["type LastOfUnion<Union> =", "    UnionMember<Union>;"].join(
        "\r\n"
    ),
    sourceText: invalidFixtureCode,
    target: [
        "type LastOfUnion<Union> =",
        "    IsNever<Union> extends true",
        "        ? never",
        "        : UnionToIntersection<",
        "                Union extends any ? () => Union : never",
        "            > extends () => infer Last",
        "          ? Last",
        "          : never;",
    ].join("\r\n"),
});

const parseUnionMemberTypeReferenceFromCode = (
    sourceText: string
): TSESTree.TSTypeReference => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "LastOfUnion" &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a UnionMember type reference"
    );
};

describe("prefer-type-fest-union-member parse-safety guards", () => {
    it("fast-check: UnionMember replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    '"open" | "close"',
                    '"queued" | "running" | "done"',
                    "1 | 2 | 3"
                ),
                fc.boolean(),
                (unionType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { IsNever, UnionMember } from "type-fest";',
                        "",
                        "type UnionToIntersection<Union> = (Union extends any ? () => Union : never) extends () => infer Intersection ? Intersection : never;",
                        "type LastOfUnion<Union> = IsNever<Union> extends true ? never : UnionToIntersection<Union extends any ? () => Union : never> extends () => infer Last ? Last : never;",
                        `type Example = LastOfUnion<${unionType}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement:
                            "type LastOfUnion<Union> = UnionMember<Union>;",
                        sourceText: generatedCode,
                        target: "type LastOfUnion<Union> = IsNever<Union> extends true ? never : UnionToIntersection<Union extends any ? () => Union : never> extends () => infer Last ? Last : never;",
                    });

                    const tsReference =
                        parseUnionMemberTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("UnionMember");
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
        preferUnionMember:
            "Prefer `UnionMember<T>` from type-fest over custom union-member extraction helpers based on `UnionToIntersection`.",
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [{ messageId: "preferUnionMember" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports custom LastOfUnion helper definitions",
            output: invalidFixtureOutputCode,
        },
        {
            code: [
                'import type { IsNever } from "type-fest";',
                'import type { UnionMember } from "type-fest";',
                "",
                "type UnionToIntersection<Union> = (Union extends any ? () => Union : never) extends () => infer Intersection ? Intersection : never;",
                "type Wrapper<UnionMember, Union> = IsNever<Union> extends true ? never : UnionToIntersection<Union extends any ? () => Union : never> extends () => infer Last ? Last : never;",
            ].join("\n"),
            errors: [{ messageId: "preferUnionMember" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports but does not autofix when UnionMember is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts existing UnionMember usage",
        },
        {
            code: [
                'import type { IsNever } from "type-fest";',
                "",
                "type UnionToIntersection<Union> = (Union extends unknown ? () => Union : never) extends () => infer Intersection ? Intersection : never;",
                "type LastOfUnion<Union> = IsNever<Union> extends true ? never : UnionToIntersection<Union extends unknown ? () => Union : never> extends () => infer Last ? Last : never;",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "ignores similar helpers that are outside the exact supported pattern",
        },
    ],
});
