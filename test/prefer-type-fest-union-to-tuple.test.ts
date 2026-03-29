/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-union-to-tuple` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-union-to-tuple";
const docsDescription =
    "require TypeFest UnionToTuple over imported aliases such as TuplifyUnion.";

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
            `Expected prefer-type-fest-union-to-tuple text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseUnionToTupleTypeReferenceFromCode = (
    sourceText: string
): TSESTree.TSTypeReference => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a UnionToTuple type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferUnionToTuple:
            "Prefer `{{replacement}}` from type-fest to convert unions into tuple forms instead of legacy alias `{{alias}}`.",
    },
    name: ruleId,
});

describe("prefer-type-fest-union-to-tuple parse-safety guards", () => {
    it("fast-check: UnionToTuple replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom('"red" | "green"', "1 | 2 | 3"),
                fc.boolean(),
                (unionText, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { TuplifyUnion } from "type-aliases";',
                        'import type { UnionToTuple } from "type-fest";',
                        `type OrderedMembers = TuplifyUnion<${unionText}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "UnionToTuple<",
                        sourceText: generatedCode,
                        target: "TuplifyUnion<",
                    });

                    const tsReference =
                        parseUnionToTupleTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("UnionToTuple");
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
            code: [
                'import type { TuplifyUnion } from "type-aliases";',
                'import type { UnionToTuple } from "type-fest";',
                "",
                'type MemberTuple = TuplifyUnion<"one" | "two" | "three">;',
            ].join("\n"),
            errors: [
                {
                    data: {
                        alias: "TuplifyUnion",
                        replacement: "UnionToTuple",
                    },
                    messageId: "preferUnionToTuple",
                },
            ],
            name: "reports TuplifyUnion alias usage",
            output: [
                'import type { TuplifyUnion } from "type-aliases";',
                'import type { UnionToTuple } from "type-fest";',
                "",
                'type MemberTuple = UnionToTuple<"one" | "two" | "three">;',
            ].join("\n"),
        },
        {
            code: [
                'import type { TupleFromUnion } from "type-aliases";',
                'import type { UnionToTuple } from "type-fest";',
                "",
                "type NumericTuple = TupleFromUnion<1 | 2 | 3>;",
            ].join("\n"),
            errors: [
                {
                    data: {
                        alias: "TupleFromUnion",
                        replacement: "UnionToTuple",
                    },
                    messageId: "preferUnionToTuple",
                },
            ],
            name: "reports TupleFromUnion alias usage",
            output: [
                'import type { TupleFromUnion } from "type-aliases";',
                'import type { UnionToTuple } from "type-fest";',
                "",
                "type NumericTuple = UnionToTuple<1 | 2 | 3>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { TuplifyUnion } from "type-aliases";',
                "",
                'type Wrapper<UnionToTuple> = TuplifyUnion<"one" | "two">;',
            ].join("\n"),
            errors: [
                {
                    data: {
                        alias: "TuplifyUnion",
                        replacement: "UnionToTuple",
                    },
                    messageId: "preferUnionToTuple",
                },
            ],
            name: "reports alias usage but does not autofix when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { UnionToTuple } from "type-fest";',
                "",
                'type MemberTuple = UnionToTuple<"one" | "two">;',
            ].join("\n"),
            name: "accepts UnionToTuple usage",
        },
    ],
});
