/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-or-all` behavior.
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
const ruleId = "prefer-type-fest-or-all";
const docsDescription =
    "require TypeFest OrAll over `SomeExtend<TTuple, true>` boolean-tuple checks.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseOrAllTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an OrAll type reference"
    );
};

describe("prefer-type-fest-or-all parse-safety guards", () => {
    it("fast-check: OrAll replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "[false, false, true]",
                    "[false, false, false]",
                    "[boolean, false]"
                ),
                fc.boolean(),
                (tupleType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { OrAll, SomeExtend } from "type-fest";',
                        `type Result = SomeExtend<${tupleType}, true>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type Result = SomeExtend<${tupleType}, true>;`,
                        `type Result = OrAll<${tupleType}>;`
                    );

                    const tsReference =
                        parseOrAllTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("OrAll");
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
        preferOrAll:
            "Prefer `OrAll<TTuple>` from type-fest over `SomeExtend<TTuple, true>` for boolean-tuple disjunction checks.",
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: [
                'import type { OrAll, SomeExtend } from "type-fest";',
                "",
                "type AnyFlagsTrue = SomeExtend<[false, false, true], true>;",
            ].join("\n"),
            errors: [{ messageId: "preferOrAll" }],
            name: "reports direct SomeExtend<TTuple, true> usage",
            output: [
                'import type { OrAll, SomeExtend } from "type-fest";',
                "",
                "type AnyFlagsTrue = OrAll<[false, false, true]>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { OrAll } from "type-fest";',
                "",
                "type AnyFlagsTrue = TypeFest.SomeExtend<[false, true], true>;",
            ].join("\n"),
            errors: [{ messageId: "preferOrAll" }],
            name: "reports namespace-qualified SomeExtend<TTuple, true> usage",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { OrAll } from "type-fest";',
                "",
                "type AnyFlagsTrue = OrAll<[false, true]>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { SomeExtend } from "type-fest";',
                "",
                "type Wrapper<OrAll> = SomeExtend<[false, true], true>;",
            ].join("\n"),
            errors: [{ messageId: "preferOrAll" }],
            name: "reports but does not autofix when OrAll is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { OrAll, SomeExtend } from "type-fest";',
                "",
                "type AnyFlagsTrue = OrAll<[false, false, true]>;",
                'type AnyStringsExtendString = SomeExtend<[1, "x", true], string>;',
            ].join("\n"),
            name: "accepts OrAll and non-boolean SomeExtend patterns",
        },
    ],
});
