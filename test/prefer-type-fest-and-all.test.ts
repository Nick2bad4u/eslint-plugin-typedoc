/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-and-all` behavior.
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
const ruleId = "prefer-type-fest-and-all";
const docsDescription =
    "require TypeFest AndAll over `AllExtend<TTuple, true>` boolean-tuple checks.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseAndAllTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an AndAll type reference"
    );
};

describe("prefer-type-fest-and-all parse-safety guards", () => {
    it("fast-check: AndAll replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "[true, true, true]",
                    "[true, false, true]",
                    "[boolean, true]"
                ),
                fc.boolean(),
                (tupleType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { AllExtend, AndAll } from "type-fest";',
                        `type Result = AllExtend<${tupleType}, true>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type Result = AllExtend<${tupleType}, true>;`,
                        `type Result = AndAll<${tupleType}>;`
                    );

                    const tsReference =
                        parseAndAllTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("AndAll");
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
        preferAndAll:
            "Prefer `AndAll<TTuple>` from type-fest over `AllExtend<TTuple, true>` for boolean-tuple conjunction checks.",
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: [
                'import type { AllExtend, AndAll } from "type-fest";',
                "",
                "type AllFlagsTrue = AllExtend<[true, true, false], true>;",
            ].join("\n"),
            errors: [{ messageId: "preferAndAll" }],
            name: "reports direct AllExtend<TTuple, true> usage",
            output: [
                'import type { AllExtend, AndAll } from "type-fest";',
                "",
                "type AllFlagsTrue = AndAll<[true, true, false]>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { AndAll } from "type-fest";',
                "",
                "type AllFlagsTrue = TypeFest.AllExtend<[true, false], true>;",
            ].join("\n"),
            errors: [{ messageId: "preferAndAll" }],
            name: "reports namespace-qualified AllExtend<TTuple, true> usage",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { AndAll } from "type-fest";',
                "",
                "type AllFlagsTrue = AndAll<[true, false]>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { AllExtend } from "type-fest";',
                "",
                "type Wrapper<AndAll> = AllExtend<[true, true], true>;",
            ].join("\n"),
            errors: [{ messageId: "preferAndAll" }],
            name: "reports but does not autofix when AndAll is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { AllExtend, AndAll } from "type-fest";',
                "",
                "type AllFlagsTrue = AndAll<[true, true, true]>;",
                "type AllNumbersExtendNumber = AllExtend<[1, 2, 3], number>;",
            ].join("\n"),
            name: "accepts AndAll and non-boolean AllExtend patterns",
        },
    ],
});
