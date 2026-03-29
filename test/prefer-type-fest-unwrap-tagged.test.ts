import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unwrap-tagged.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unwrap-tagged.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-unwrap-tagged.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-unwrap-tagged.invalid.ts";
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
            `Expected prefer-type-fest-unwrap-tagged fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const insertUnwrapTaggedImportAfterUnwrapOpaqueImport = (
    sourceText: string
): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";

    return replaceOrThrow({
        replacement: `import type { UnwrapOpaque } from "type-aliases";\nimport type { UnwrapTagged } from "type-fest";${sourceLineEnding}`,
        sourceText,
        target: `import type { UnwrapOpaque } from "type-aliases";${sourceLineEnding}`,
    });
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "UnwrapTagged<",
    sourceText:
        insertUnwrapTaggedImportAfterUnwrapOpaqueImport(invalidFixtureCode),
    target: "UnwrapOpaque<",
});
const inlineFixableInvalidCode = [
    'import type { UnwrapOpaque } from "type-aliases";',
    'import type { UnwrapTagged } from "type-fest";',
    "",
    'type UserId = UnwrapOpaque<{ readonly __brand: "UserId" } & string>;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement:
        'type UserId = UnwrapTagged<{ readonly __brand: "UserId" } & string>;',
    sourceText: inlineFixableInvalidCode,
    target: 'type UserId = UnwrapOpaque<{ readonly __brand: "UserId" } & string>;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { UnwrapOpaque } from "type-aliases";',
    "",
    'type Wrapper<UnwrapTagged> = UnwrapOpaque<{ readonly __brand: "UserId" } & string>;',
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const unwrapOpaqueSourceArbitrary = fc.constantFrom<
    "intersection" | "stringLiteral" | "templateLiteral"
>("intersection", "stringLiteral", "templateLiteral");

const buildUnwrapOpaqueSource = (
    sourceKind: "intersection" | "stringLiteral" | "templateLiteral"
): string => {
    if (sourceKind === "intersection") {
        return 'UnwrapOpaque<{ readonly __brand: "UserId" } & string>';
    }

    if (sourceKind === "stringLiteral") {
        return 'UnwrapOpaque<{ readonly __brand: "Role" } & "admin">';
    }

    return "UnwrapOpaque<{ readonly __brand: `Tenant` } & string>";
};

const parseUnwrapTaggedTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an UnwrapTagged type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-unwrap-tagged", {
    docsDescription:
        "require TypeFest UnwrapTagged over imported aliases such as UnwrapOpaque.",
    enforceRuleShape: true,
    messages: {
        preferUnwrapTagged:
            "Prefer `{{replacement}}` from type-fest to unwrap Tagged/Opaque values instead of legacy alias `{{alias}}`.",
    },
});

describe("prefer-type-fest-unwrap-tagged parse-safety guards", () => {
    it("fast-check: UnwrapTagged replacement remains parseable across wrapper variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                unwrapOpaqueSourceArbitrary,
                includeUnicodeBannerArbitrary,
                (sourceKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const unwrapOpaqueSource =
                        buildUnwrapOpaqueSource(sourceKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import type { UnwrapOpaque } from "type-aliases";',
                        'import type { UnwrapTagged } from "type-fest";',
                        `type UserId = ${unwrapOpaqueSource};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "UnwrapTagged<",
                        sourceText: generatedCode,
                        target: "UnwrapOpaque<",
                    });

                    const { tsReference } =
                        parseUnwrapTaggedTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("UnwrapTagged");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-unwrap-tagged",
    getPluginRule("prefer-type-fest-unwrap-tagged"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture UnwrapOpaque and OpaqueType aliases",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline UnwrapOpaque alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports UnwrapOpaque alias when replacement identifier is shadowed",
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
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-qualified UnwrapTagged references",
            },
        ],
    }
);
