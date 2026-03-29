/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-except.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
    warmTypedParserServices,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-except");
const ruleTester = createTypedRuleTester();
const defaultOptions = [{ enforceBuiltinOmit: true }] as const;
const aliasOnlyOptions = [{ enforceBuiltinOmit: false }] as const;

const validFixtureName = "prefer-type-fest-except.valid.ts";
const invalidFixtureName = "prefer-type-fest-except.invalid.ts";
const fixtureSafePatternsValidCase = {
    code: readTypedFixture(validFixtureName),
    filename: typedFixturePath(validFixtureName),
    name: "accepts fixture-safe patterns",
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
            `Expected prefer-type-fest-except fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const inlineFixableInvalidCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    'import type { Except } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: 'type UserWithoutId = Except<User, "id">;',
    sourceText: inlineFixableInvalidCode,
    target: 'type UserWithoutId = HomomorphicOmit<User, "id">;',
});
const inlineNoFixWithoutExceptImportCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");
const inlineNoFixWithoutExceptImportOutputCode = replaceOrThrow({
    replacement: 'type UserWithoutId = Except<User, "id">;',
    sourceText: replaceOrThrow({
        replacement:
            'import type { HomomorphicOmit } from "type-aliases";\nimport type { Except } from "type-fest";',
        sourceText: inlineNoFixWithoutExceptImportCode,
        target: 'import type { HomomorphicOmit } from "type-aliases";',
    }),
    target: 'type UserWithoutId = HomomorphicOmit<User, "id">;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    "",
    'type Wrapper<Except extends object> = HomomorphicOmit<Except, "id">;',
].join("\n");
const inlineValidNamespaceAliasCode = [
    'import type * as TypeAliases from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = TypeAliases.HomomorphicOmit<User, "id">;',
].join("\n");
const inlineValidOmitWithoutTypeArgumentsCode = [
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    "type UserWithoutId = Omit<User>;",
].join("\n");
const inlineValidBareOmitReferenceCode = "type OmitFactory = Omit;";
const builtinOmitIgnoredByOptionsValidCode = [
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = Omit<User, "id">;',
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const subjectTypeNameArbitrary = fc.constantFrom("Account", "Payload", "User");
const omittedKeyLiteralArbitrary = fc.constantFrom('"id"', '"name"', '"value"');

const parseExceptTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    tsReference: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            const tsAnnotation = statement.typeAnnotation;

            if (tsAnnotation.type === AST_NODE_TYPES.TSTypeReference) {
                return {
                    ast: parsed.ast,
                    tsReference: tsAnnotation,
                };
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias with a type reference"
    );
};

warmTypedParserServices(typedFixturePath(validFixtureName));

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-except", {
    defaultOptions,
    docsDescription:
        "require TypeFest Except over Omit when removing properties from object types.",
    messages: {
        preferExcept:
            "Prefer `Except<T, K>` from type-fest over `Omit<T, K>` for stricter omitted-key modeling.",
    },
    name: "prefer-type-fest-except",
});

describe("prefer-type-fest-except source assertions", () => {
    it("reports builtin Omit type references in undecorated visitor", async () => {
        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-except")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                'type UserWithoutId = Omit<{ id: string; name: string }, "id">;',
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const [firstStatement] = parsedResult.ast.body;

            expect(firstStatement?.type).toBe("TSTypeAliasDeclaration");

            if (
                firstStatement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration
            ) {
                throw new Error("Expected a type alias declaration statement");
            }

            const aliasAnnotation = firstStatement.typeAnnotation;

            expect(aliasAnnotation.type).toBe("TSTypeReference");

            if (aliasAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
                throw new Error("Expected a type reference in the type alias");
            }

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename: "fixtures/typed/prefer-type-fest-except.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            listenerMap.TSTypeReference?.(aliasAnnotation);

            expect(report).toHaveBeenCalledTimes(1);
            expect(report).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageId: "preferExcept",
                    node: aliasAnnotation,
                })
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-type-fest-except parse-safety guards", () => {
    it("fast-check: Except replacement remains parseable across alias variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                subjectTypeNameArbitrary,
                omittedKeyLiteralArbitrary,
                includeUnicodeBannerArbitrary,
                (subjectTypeName, omittedKeyLiteral, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'type UnicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const originalAliasStatement = `type SubjectWithoutKey = HomomorphicOmit<${subjectTypeName}, ${omittedKeyLiteral}>;`;
                    const replacementAliasStatement = `type SubjectWithoutKey = Except<${subjectTypeName}, ${omittedKeyLiteral}>;`;
                    const generatedCode = [
                        unicodeBanner,
                        'import type { HomomorphicOmit } from "type-aliases";',
                        'import type { Except } from "type-fest";',
                        `type ${subjectTypeName} = { id: string; name: string; value: number };`,
                        originalAliasStatement,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: replacementAliasStatement,
                        sourceText: generatedCode,
                        target: originalAliasStatement,
                    });

                    const { tsReference } =
                        parseExceptTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("Except");
                    }

                    expect(tsReference.typeArguments?.params).toHaveLength(2);
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe(
    "prefer-type-fest-except RuleTester fixture validity",
    {
        timeout: 60_000,
    },
    () => {
        ruleTester.run("prefer-type-fest-except fixture validity", rule, {
            invalid: [],
            valid: [fixtureSafePatternsValidCase],
        });
    }
);

ruleTester.run("prefer-type-fest-except", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferExcept",
                },
                {
                    messageId: "preferExcept",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Omit-alias usage",
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes imported HomomorphicOmit alias",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixWithoutExceptImportCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports alias usage without available Except import fix",
            output: inlineNoFixWithoutExceptImportOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports HomomorphicOmit alias when replacement identifier is shadowed",
            output: null,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "still reports imported alias when enforceBuiltinOmit is disabled",
            options: aliasOnlyOptions,
            output: inlineFixableOutputCode,
        },
    ],
    valid: [
        {
            code: inlineValidNamespaceAliasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores namespace-qualified alias reference",
        },
        {
            code: inlineValidOmitWithoutTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Omit with missing second type argument",
        },
        {
            code: inlineValidBareOmitReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Omit type reference",
        },
        {
            code: builtinOmitIgnoredByOptionsValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores builtin Omit<T, K> when enforceBuiltinOmit is disabled",
            options: aliasOnlyOptions,
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath(invalidFixtureName),
            name: "accepts fixture Omit usage when enforceBuiltinOmit is disabled",
            options: aliasOnlyOptions,
        },
    ],
});
