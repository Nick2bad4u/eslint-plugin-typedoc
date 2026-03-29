/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-optional` behavior.
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
const ruleId = "prefer-type-fest-optional";
const docsDescription =
    "require TypeFest Optional over `Exclude<T, null> | undefined` and `NonNullable<T> | undefined` patterns.";
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
            `Expected prefer-type-fest-optional source text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const parseOptionalTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an Optional type reference"
    );
};

describe("prefer-type-fest-optional parse-safety guards", () => {
    it("fast-check: Optional replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "string | null",
                    "number | null",
                    "readonly [1, 2] | null"
                ),
                fc.boolean(),
                (baseType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { Optional } from "type-fest";',
                        `type MaybeValue = Exclude<${baseType}, null> | undefined;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: `type MaybeValue = Optional<${baseType}>;`,
                        sourceText: generatedCode,
                        target: `type MaybeValue = Exclude<${baseType}, null> | undefined;`,
                    });

                    const tsReference =
                        parseOptionalTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("Optional");
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
        preferOptional:
            "Prefer `Optional<T>` from type-fest over `Exclude<T, null> | undefined` and equivalent optional-value patterns.",
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: [
                'import type { Optional } from "type-fest";',
                "",
                "type MaybeName = Exclude<string | null, null> | undefined;",
            ].join("\n"),
            errors: [{ messageId: "preferOptional" }],
            name: "reports Exclude<T, null> | undefined patterns",
            output: [
                'import type { Optional } from "type-fest";',
                "",
                "type MaybeName = Optional<string | null>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { Optional } from "type-fest";',
                "",
                "type MaybeRegion = NonNullable<string | null> | undefined;",
            ].join("\n"),
            errors: [{ messageId: "preferOptional" }],
            name: "reports NonNullable<T> | undefined patterns",
            output: [
                'import type { Optional } from "type-fest";',
                "",
                "type MaybeRegion = Optional<string | null>;",
            ].join("\n"),
        },
        {
            code: [
                "",
                "type Wrapper<Optional> = Exclude<string | null, null> | undefined;",
            ].join("\n"),
            errors: [{ messageId: "preferOptional" }],
            name: "reports but does not autofix when Optional is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { Optional } from "type-fest";',
                "",
                "type MaybeName = Optional<string | null>;",
            ].join("\n"),
            name: "accepts existing Optional usage",
        },
        {
            code: "type MaybeName = string | undefined;",
            name: "ignores plain optional unions without null exclusion semantics",
        },
        {
            code: "type MaybeName = Exclude<string | null, undefined> | undefined;",
            name: "ignores Exclude patterns that do not remove null",
        },
    ],
});
