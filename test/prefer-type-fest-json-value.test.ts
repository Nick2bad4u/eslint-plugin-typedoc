import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-value.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-json-value";
const docsDescription =
    "require TypeFest JsonObject for string-keyed JSON record contract types in serialization boundaries.";
const preferJsonValueMessage =
    "Use `JsonObject` from type-fest for string-keyed JSON record contracts in serialization boundaries instead of Record<string, unknown|any>.";
const suggestJsonObjectMessage =
    "Replace with `JsonObject` from type-fest (review value constraints, this may narrow accepted shapes).";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

const invalidFixtureName = "prefer-type-fest-json-value.invalid.ts";
const validFixtureName = "prefer-type-fest-json-value.valid.ts";
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
            `Expected prefer-type-fest-json-value fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const invalidFixtureSuggestionOutput = `import type { JsonObject } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "JsonObject",
        sourceText: invalidFixtureCode,
        target: "Record<string, unknown>",
    }
)}`;
const inlineInvalidAnyPayloadCode = "type IpcPayload = Record<string, any>;";
const inlineInvalidAnyPayloadSuggestionOutput = [
    'import type { JsonObject } from "type-fest";',
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineSuggestableCode = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = Record<string, unknown>;",
].join("\n");
const inlineSuggestableOutput = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineSuggestableLiteralStringKeyCode = [
    'import type { JsonObject } from "type-fest";',
    "",
    'type IpcPayload = Record<"string", unknown>;',
].join("\n");
const inlineSuggestableLiteralStringKeyOutput = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineSuggestableAnyPayloadCode = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = Record<string, any>;",
].join("\n");
const inlineSuggestableAnyPayloadOutput = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineValidGlobalRecordCode =
    "type IpcPayload = globalThis.Record<string, unknown>;";
const inlineValidNonStringKeyCode =
    "type IpcPayload = Record<number, unknown>;";
const inlineValidLiteralNonStringKeyCode =
    'type IpcPayload = Record<"payload", unknown>;';
const inlineValidNonUnknownValueCode =
    "type IpcPayload = Record<string, string>;";
const inlineValidMapCode = "type IpcPayload = Map<string, unknown>;";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const recordKeyTypeArbitrary = fc.constantFrom<"keyword" | "stringLiteralKey">(
    "keyword",
    "stringLiteralKey"
);
const recordValueTypeArbitrary = fc.constantFrom<"any" | "unknown">(
    "unknown",
    "any"
);

const buildRecordKeyType = (keyType: "keyword" | "stringLiteralKey"): string =>
    keyType === "keyword" ? "string" : '"string"';

const buildRecordValueType = (valueType: "any" | "unknown"): string =>
    valueType === "unknown" ? "unknown" : "any";

const parseJsonObjectTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a JsonObject type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferJsonValue: preferJsonValueMessage,
        suggestJsonObject: suggestJsonObjectMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-json-value metadata", () => {
    it("declares authored hasSuggestions metadata literal", async () => {
        const authoredRuleModule =
            (await import("../src/rules/prefer-type-fest-json-value")) as {
                default: {
                    readonly meta?: {
                        readonly hasSuggestions?: boolean;
                    };
                };
            };

        expect(authoredRuleModule.default.meta?.hasSuggestions).toBeTruthy();
    });
});

describe("prefer-type-fest-json-value internal listener guards", () => {
    it("reports without suggestions when replacement fix is unavailable", async () => {
        const reportCalls: unknown[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    createSafeTypeNodeReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-json-value")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report: (descriptor: unknown) => {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            listeners.TSTypeReference?.({
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        { type: "TSStringKeyword" },
                        { type: "TSUnknownKeyword" },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferJsonValue",
            });
            expect(reportCalls[0]).not.toMatchObject({
                suggest: expect.anything(),
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-type-fest-json-value parse-safety guards", () => {
    it("fast-check: JsonObject suggestion replacement remains parseable across Record key/value variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                recordKeyTypeArbitrary,
                recordValueTypeArbitrary,
                includeUnicodeBannerArbitrary,
                (recordKeyType, recordValueType, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const keyType = buildRecordKeyType(recordKeyType);
                    const valueType = buildRecordValueType(recordValueType);
                    const recordTypeText = `Record<${keyType}, ${valueType}>`;
                    const generatedCode = [
                        unicodeBanner,
                        'import type { JsonObject } from "type-fest";',
                        `type IpcPayload = ${recordTypeText};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "JsonObject",
                        sourceText: generatedCode,
                        target: recordTypeText,
                    });

                    const { tsReference } =
                        parseJsonObjectTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("JsonObject");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: invalidFixtureSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Record<string, any> aliases",
        },
        {
            code: inlineInvalidAnyPayloadCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineInvalidAnyPayloadSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline Record<string, any> alias",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests JsonObject when import is in scope",
        },
        {
            code: inlineSuggestableLiteralStringKeyCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineSuggestableLiteralStringKeyOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: 'suggests JsonObject for Record<"string", unknown> when import is in scope',
        },
        {
            code: inlineSuggestableAnyPayloadCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineSuggestableAnyPayloadOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests JsonObject for Record<string, any> when import is in scope",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidGlobalRecordCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Record<string, unknown>",
        },
        {
            code: inlineValidNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-string key type",
        },
        {
            code: inlineValidLiteralNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: 'ignores Record with literal key that is not "string"',
        },
        {
            code: inlineValidNonUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with concrete value type",
        },
        {
            code: inlineValidMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Record map type alias",
        },
    ],
});
