import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-object.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import {
    fastCheckRunConfig,
    isSafeGeneratedIdentifier,
} from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-json-object";
const docsDescription =
    "require TypeFest JsonObject over equivalent Record<string, JsonValue> object aliases.";
const preferJsonObjectMessage =
    "Prefer `JsonObject` from type-fest over equivalent explicit JSON-object type shapes.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-object.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-object.invalid.ts";
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
            `Expected prefer-type-fest-json-object fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "JsonObject",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonObject } from "type-fest";\r\n',
        sourceText: invalidFixtureCode,
        target: 'import type { JsonValue } from "type-fest";\r\n',
    }),
    target: "Record<string, JsonValue>",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "JsonObject",
    sourceText: fixtureFixableOutputCode,
    target: "Record<string, JsonValue>",
});
const inlineInvalidLiteralStringKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    'type MonitorJsonShape = Record<"string", JsonValue>;',
].join("\n");
const inlineInvalidLiteralStringKeyOutputCode = replaceOrThrow({
    replacement: "JsonObject",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonObject } from "type-fest";',
        sourceText: inlineInvalidLiteralStringKeyCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: 'Record<"string", JsonValue>',
});
const inlineValidGlobalRecordCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = globalThis.Record<string, JsonValue>;",
].join("\n");
const inlineValidLiteralNonStringKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    'type MonitorJsonShape = Record<"number", JsonValue>;',
].join("\n");
const inlineValidNonJsonValueCode = [
    "type MonitorJsonShape = Record<string, number>;",
].join("\n");
const inlineValidNumberKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<number, JsonValue>;",
].join("\n");
const inlineValidMissingRecordTypeArgumentsCode =
    "type MonitorJsonShape = Record;";
const inlineValidRecordSingleTypeArgumentCode =
    "type MonitorJsonShape = Record<string>;";
const inlineValidRecordUnknownValueCode =
    "type MonitorJsonShape = Record<string, unknown>;";
const inlineInvalidWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<string, JsonValue>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = replaceOrThrow({
    replacement: "JsonObject",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonObject } from "type-fest";',
        sourceText: inlineInvalidWithoutFixCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: "Record<string, JsonValue>",
});
const inlineFixableCode = [
    'import type { JsonObject, JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<string, JsonValue>;",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonObject, JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = JsonObject;",
].join("\n");
const disableImportInsertionSettings = {
    typefest: {
        disableImportInsertionFixes: true,
    },
};

type JsonObjectReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const keyTypeArbitrary = fc.constantFrom("string", '"string"');
const aliasNameArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate))
    .filter(
        (candidate) => candidate !== "JsonObject" && candidate !== "JsonValue"
    );

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return "";
    }

    const nodeRange = (
        node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (nodeRange === undefined) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

const parseRecordTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    tsReference: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return {
                ast: parsed.ast,
                tsReference: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a Record<..., JsonValue> type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferJsonObject: preferJsonObjectMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-json-object internal Record<JsonValue> guard", () => {
    it("reports only Record<string, JsonValue> references with exactly two type arguments", async () => {
        const replacementFixCalls: Readonly<UnknownArray>[] = [];
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];

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
                    createSafeTypeNodeReplacementFix: (
                        ...parameters: Readonly<UnknownArray>
                    ) => {
                        replacementFixCalls.push(parameters);

                        return null;
                    },
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-json-object")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(
                    descriptor: Readonly<{ messageId?: string; node?: unknown }>
                ) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const referenceListener = listeners.TSTypeReference;

            expect(referenceListener).toBeTypeOf("function");

            const matchingRecordNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                        {
                            type: "TSTypeReference",
                            typeName: {
                                name: "JsonValue",
                                type: "Identifier",
                            },
                        },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            };
            const nonRecordIdentifierNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                        {
                            type: "TSTypeReference",
                            typeName: {
                                name: "JsonValue",
                                type: "Identifier",
                            },
                        },
                    ],
                },
                typeName: {
                    name: "Box",
                    type: "Identifier",
                },
            };
            const singleTypeArgumentNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            };
            const nonJsonValueRecordNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                        {
                            type: "TSUnknownKeyword",
                        },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            };

            referenceListener?.(matchingRecordNode);
            referenceListener?.(nonRecordIdentifierNode);
            referenceListener?.(singleTypeArgumentNode);
            referenceListener?.(nonJsonValueRecordNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferJsonObject",
                node: matchingRecordNode,
            });
            expect(replacementFixCalls).toHaveLength(1);
            expect(replacementFixCalls[0]?.[1]).toBe("JsonObject");
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: JsonObject replacement remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeReplacementFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    createSafeTypeNodeReplacementFix:
                        createSafeTypeNodeReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-json-object")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    aliasNameArbitrary,
                    keyTypeArbitrary,
                    (aliasName, keyTypeText) => {
                        createSafeTypeNodeReplacementFixMock.mockClear();

                        const code = [
                            'import type { JsonValue } from "type-fest";',
                            `type ${aliasName} = Record<${keyTypeText}, JsonValue>;`,
                            "declare const seed: unique symbol;",
                            "void seed;",
                        ].join("\n");

                        const { ast, tsReference } =
                            parseRecordTypeReferenceFromCode(code);
                        const reportCalls: JsonObjectReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-json-object.invalid.ts",
                            report: (
                                descriptor: JsonObjectReportDescriptor
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        const tsReferenceListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "TSTypeReference"
                            );

                        tsReferenceListener?.(tsReference);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferJsonObject",
                        });

                        if (
                            createSafeTypeNodeReplacementFixMock.mock.calls
                                .length > 0
                        ) {
                            expect(
                                createSafeTypeNodeReplacementFixMock
                            ).toHaveBeenCalledTimes(1);
                            expect(
                                createSafeTypeNodeReplacementFixMock.mock
                                    .calls[0]?.[1]
                            ).toBe("JsonObject");
                        } else {
                            expect(reportCalls[0]?.fix).toBeTypeOf("function");
                        }

                        const fixedCode = `${code.slice(0, tsReference.range[0])}JsonObject${code.slice(tsReference.range[1])}`;

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferJsonObject",
                },
                {
                    messageId: "preferJsonObject",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonObject-like Record aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidLiteralStringKeyCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record with literal string key and JsonValue value",
            output: inlineInvalidLiteralStringKeyOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record<string, JsonValue> without fix when JsonObject import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports without autofix when import insertion fixes are globally disabled",
            output: null,
            settings: disableImportInsertionSettings,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Record<string, JsonValue> when JsonObject import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "still autofixes when disableImportInsertionFixes is enabled and JsonObject import is in scope",
            output: inlineFixableOutput,
            settings: disableImportInsertionSettings,
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
            name: "ignores globalThis.Record usage",
        },
        {
            code: inlineValidLiteralNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: 'ignores Record with literal key other than "string"',
        },
        {
            code: inlineValidNonJsonValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-JsonValue values",
        },
        {
            code: inlineValidNumberKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-string key type",
        },
        {
            code: inlineValidMissingRecordTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Record reference",
        },
        {
            code: inlineValidRecordSingleTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with a single type argument",
        },
        {
            code: inlineValidRecordUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record<string, unknown>",
        },
    ],
});
