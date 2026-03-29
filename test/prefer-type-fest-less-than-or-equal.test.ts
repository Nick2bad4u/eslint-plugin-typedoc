/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-less-than-or-equal` behavior.
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
const ruleId = "prefer-type-fest-less-than-or-equal";
const docsDescription =
    "require TypeFest LessThanOrEqual over `GreaterThan<A, B> extends true ? false : true` wrappers.";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseLessThanOrEqualTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a LessThanOrEqual type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferLessThanOrEqual:
            "Prefer `LessThanOrEqual<A, B>` from type-fest over wrappers built from `GreaterThan<A, B>`.",
    },
    name: ruleId,
});

describe("prefer-type-fest-less-than-or-equal parse-safety guards", () => {
    it("fast-check: LessThanOrEqual replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom("0", "1", "2", "10"),
                fc.constantFrom("0", "1", "3", "20"),
                fc.boolean(),
                (leftValue, rightValue, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { GreaterThan, LessThanOrEqual } from "type-fest";',
                        `type IsLessOrEqual = GreaterThan<${leftValue}, ${rightValue}> extends true ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type IsLessOrEqual = GreaterThan<${leftValue}, ${rightValue}> extends true ? false : true;`,
                        `type IsLessOrEqual = LessThanOrEqual<${leftValue}, ${rightValue}>;`
                    );

                    const tsReference =
                        parseLessThanOrEqualTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "LessThanOrEqual"
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
            code: [
                'import type { GreaterThan, LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = GreaterThan<1, 2> extends true ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThanOrEqual" }],
            name: "reports direct GreaterThan wrapper usage",
            output: [
                'import type { GreaterThan, LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = LessThanOrEqual<1, 2>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { GreaterThan, LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = GreaterThan<4, 9> extends infer Result ? Result extends true ? false : true : never;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThanOrEqual" }],
            name: "reports infer-wrapped GreaterThan wrapper usage",
            output: [
                'import type { GreaterThan, LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = LessThanOrEqual<4, 9>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = TypeFest.GreaterThan<5, 8> extends true ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThanOrEqual" }],
            name: "reports namespace-qualified GreaterThan wrappers",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = LessThanOrEqual<5, 8>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { GreaterThan } from "type-fest";',
                "",
                "type Wrapper<LessThanOrEqual> = GreaterThan<1, 2> extends true ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThanOrEqual" }],
            name: "reports wrapper usage but does not autofix when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { LessThanOrEqual } from "type-fest";',
                "",
                "type IsLessOrEqual = LessThanOrEqual<1, 2>;",
            ].join("\n"),
            name: "accepts LessThanOrEqual usage",
        },
        {
            code: [
                'import type { GreaterThan } from "type-fest";',
                "",
                "type IsNotLessOrEqual = GreaterThan<1, 2> extends true ? true : false;",
            ].join("\n"),
            name: "ignores non-equivalent boolean wrappers",
        },
    ],
});
