/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-less-than` behavior.
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
const ruleId = "prefer-type-fest-less-than";
const docsDescription =
    "require TypeFest LessThan over `GreaterThanOrEqual<A, B> extends true ? false : true` wrappers.";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseLessThanTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a LessThan type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferLessThan:
            "Prefer `LessThan<A, B>` from type-fest over wrappers built from `GreaterThanOrEqual<A, B>`.",
    },
    name: ruleId,
});

describe("prefer-type-fest-less-than parse-safety guards", () => {
    it("fast-check: LessThan replacement remains parseable", () => {
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
                        'import type { GreaterThanOrEqual, LessThan } from "type-fest";',
                        `type IsLess = GreaterThanOrEqual<${leftValue}, ${rightValue}> extends true ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type IsLess = GreaterThanOrEqual<${leftValue}, ${rightValue}> extends true ? false : true;`,
                        `type IsLess = LessThan<${leftValue}, ${rightValue}>;`
                    );

                    const tsReference =
                        parseLessThanTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("LessThan");
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
                'import type { GreaterThanOrEqual, LessThan } from "type-fest";',
                "",
                "type IsLess = GreaterThanOrEqual<1, 2> extends true ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThan" }],
            name: "reports direct GreaterThanOrEqual wrapper usage",
            output: [
                'import type { GreaterThanOrEqual, LessThan } from "type-fest";',
                "",
                "type IsLess = LessThan<1, 2>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { GreaterThanOrEqual, LessThan } from "type-fest";',
                "",
                "type IsLess = GreaterThanOrEqual<4, 9> extends infer Result ? Result extends true ? false : true : never;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThan" }],
            name: "reports infer-wrapped GreaterThanOrEqual wrapper usage",
            output: [
                'import type { GreaterThanOrEqual, LessThan } from "type-fest";',
                "",
                "type IsLess = LessThan<4, 9>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { LessThan } from "type-fest";',
                "",
                "type IsLess = TypeFest.GreaterThanOrEqual<5, 8> extends true ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThan" }],
            name: "reports namespace-qualified GreaterThanOrEqual wrappers",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { LessThan } from "type-fest";',
                "",
                "type IsLess = LessThan<5, 8>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { GreaterThanOrEqual } from "type-fest";',
                "",
                "type Wrapper<LessThan> = GreaterThanOrEqual<1, 2> extends true ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferLessThan" }],
            name: "reports wrapper usage but does not autofix when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { LessThan } from "type-fest";',
                "",
                "type IsLess = LessThan<1, 2>;",
            ].join("\n"),
            name: "accepts LessThan usage",
        },
        {
            code: [
                'import type { GreaterThanOrEqual } from "type-fest";',
                "",
                "type IsNotLess = GreaterThanOrEqual<1, 2> extends true ? true : false;",
            ].join("\n"),
            name: "ignores non-equivalent boolean wrappers",
        },
    ],
});
