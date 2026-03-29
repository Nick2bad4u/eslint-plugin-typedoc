/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-conditional-pick-deep` behavior.
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
const ruleId = "prefer-type-fest-conditional-pick-deep";
const docsDescription =
    "require TypeFest ConditionalPickDeep over imported aliases such as PickDeepByTypes.";

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
            `Expected prefer-type-fest-conditional-pick-deep text to contain replaceable segment: ${target}`
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

const parseConditionalPickDeepTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a ConditionalPickDeep type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferConditionalPickDeep:
            "Prefer `{{replacement}}` from type-fest for deep conditional property filtering instead of legacy alias `{{alias}}`.",
    },
    name: ruleId,
});

describe("prefer-type-fest-conditional-pick-deep parse-safety guards", () => {
    it("fast-check: ConditionalPickDeep replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom("string", "number", "boolean"),
                fc.boolean(),
                (conditionType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { PickDeepByTypes } from "type-aliases";',
                        'import type { ConditionalPickDeep } from "type-fest";',
                        `type Picked = PickDeepByTypes<{ profile: { name: string; age: number } }, ${conditionType}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "ConditionalPickDeep<{",
                        sourceText: generatedCode,
                        target: "PickDeepByTypes<{",
                    });

                    const tsReference =
                        parseConditionalPickDeepTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "ConditionalPickDeep"
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
                'import type { PickDeepByTypes } from "type-aliases";',
                'import type { ConditionalPickDeep } from "type-fest";',
                "",
                "type StringProps = PickDeepByTypes<{ profile: { name: string; age: number } }, string>;",
            ].join("\n"),
            errors: [
                {
                    data: {
                        alias: "PickDeepByTypes",
                        replacement: "ConditionalPickDeep",
                    },
                    messageId: "preferConditionalPickDeep",
                },
            ],
            name: "reports PickDeepByTypes alias usage",
            output: [
                'import type { PickDeepByTypes } from "type-aliases";',
                'import type { ConditionalPickDeep } from "type-fest";',
                "",
                "type StringProps = ConditionalPickDeep<{ profile: { name: string; age: number } }, string>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { PickDeepByType } from "type-aliases";',
                'import type { ConditionalPickDeep } from "type-fest";',
                "",
                "type NumberProps = PickDeepByType<{ profile: { name: string; age: number } }, number>;",
            ].join("\n"),
            errors: [
                {
                    data: {
                        alias: "PickDeepByType",
                        replacement: "ConditionalPickDeep",
                    },
                    messageId: "preferConditionalPickDeep",
                },
            ],
            name: "reports PickDeepByType alias usage",
            output: [
                'import type { PickDeepByType } from "type-aliases";',
                'import type { ConditionalPickDeep } from "type-fest";',
                "",
                "type NumberProps = ConditionalPickDeep<{ profile: { name: string; age: number } }, number>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { PickDeepByTypes } from "type-aliases";',
                "",
                "type Wrapper<ConditionalPickDeep> = PickDeepByTypes<{ profile: { name: string } }, string>;",
            ].join("\n"),
            errors: [
                {
                    data: {
                        alias: "PickDeepByTypes",
                        replacement: "ConditionalPickDeep",
                    },
                    messageId: "preferConditionalPickDeep",
                },
            ],
            name: "reports alias usage but does not autofix when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { ConditionalPickDeep } from "type-fest";',
                "",
                "type StringProps = ConditionalPickDeep<{ profile: { name: string; age: number } }, string>;",
            ].join("\n"),
            name: "accepts ConditionalPickDeep usage",
        },
    ],
});
