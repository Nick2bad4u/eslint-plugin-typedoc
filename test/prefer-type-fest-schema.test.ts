import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-schema.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-schema";
const docsDescription =
    "require TypeFest Schema over imported aliases such as RecordDeep.";
const preferSchemaMessage =
    "Prefer `{{replacement}}` from type-fest to model recursive object schemas instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-schema.valid.ts";
const namespaceValidFixtureName = "prefer-type-fest-schema.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-schema.invalid.ts";
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
            `Expected prefer-type-fest-schema fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const insertSchemaImportAfterRecordDeepImport = (
    sourceText: string
): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";

    return replaceOrThrow({
        replacement: `import type { RecordDeep } from "type-aliases";\nimport type { Schema } from "type-fest";${sourceLineEnding}`,
        sourceText,
        target: `import type { RecordDeep } from "type-aliases";${sourceLineEnding}`,
    });
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "Schema<",
    sourceText: insertSchemaImportAfterRecordDeepImport(invalidFixtureCode),
    target: "RecordDeep<",
});
const inlineFixableInvalidCode = [
    'import type { RecordDeep } from "type-aliases";',
    'import type { Schema } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type UserSchema = RecordDeep<User, number>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type UserSchema = Schema<User, number>;",
    sourceText: inlineFixableInvalidCode,
    target: "type UserSchema = RecordDeep<User, number>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { RecordDeep } from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type Wrapper<Schema> = RecordDeep<User, number>;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const schemaValueTypeArbitrary = fc.constantFrom<
    "number" | "readonlyStringArray" | "unionLiteral"
>("number", "readonlyStringArray", "unionLiteral");

const buildSchemaValueType = (
    valueTypeKind: "number" | "readonlyStringArray" | "unionLiteral"
): string => {
    if (valueTypeKind === "number") {
        return "number";
    }

    if (valueTypeKind === "readonlyStringArray") {
        return "readonly string[]";
    }

    return '"enabled" | "disabled"';
};

const parseSchemaTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a Schema type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferSchema: preferSchemaMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-schema parse-safety guards", () => {
    it("fast-check: Schema replacement remains parseable across generic argument variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                schemaValueTypeArbitrary,
                includeUnicodeBannerArbitrary,
                (valueTypeKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const valueType = buildSchemaValueType(valueTypeKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import type { RecordDeep } from "type-aliases";',
                        'import type { Schema } from "type-fest";',
                        "type User = { id: string };",
                        `type UserSchema = RecordDeep<User, ${valueType}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "Schema<",
                        sourceText: generatedCode,
                        target: "RecordDeep<",
                    });

                    const { tsReference } =
                        parseSchemaTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("Schema");
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
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "RecordDeep",
                        replacement: "Schema",
                    },
                    messageId: "preferSchema",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture RecordDeep alias usage",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RecordDeep",
                        replacement: "Schema",
                    },
                    messageId: "preferSchema",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline RecordDeep alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RecordDeep",
                        replacement: "Schema",
                    },
                    messageId: "preferSchema",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports RecordDeep alias when replacement identifier is shadowed",
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
            name: "accepts namespace-qualified Schema references",
        },
    ],
});
