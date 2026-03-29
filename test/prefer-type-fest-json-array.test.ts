import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-array.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-json-array";
const docsDescription =
    "require TypeFest JsonArray over explicit JsonValue[] | readonly JsonValue[] style unions.";
const preferJsonArrayMessage =
    "Prefer `JsonArray` from type-fest over explicit JsonValue array unions.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-array.invalid.ts";
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
            `Expected prefer-type-fest-json-array fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "JsonArray",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";\r\n',
        sourceText: invalidFixtureCode,
        target: 'import type { JsonValue } from "type-fest";\r\n',
    }),
    target: "JsonValue[] | readonly JsonValue[]",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "    JsonArray",
    sourceText: fixtureFixableOutputCode,
    target: "    | Array<JsonValue>\r\n    | ReadonlyArray<JsonValue>",
});
const inlineInvalidReversedNativeUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type ReversedNative = readonly JsonValue[] | JsonValue[];",
].join("\n");
const inlineInvalidReversedNativeUnionOutputCode = replaceOrThrow({
    replacement: "JsonArray",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";',
        sourceText: inlineInvalidReversedNativeUnionCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: "readonly JsonValue[] | JsonValue[]",
});
const inlineInvalidReversedGenericUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type ReversedGeneric = ReadonlyArray<JsonValue> | Array<JsonValue>;",
].join("\n");
const inlineInvalidReversedGenericUnionOutputCode = replaceOrThrow({
    replacement: "JsonArray",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";',
        sourceText: inlineInvalidReversedGenericUnionCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: "ReadonlyArray<JsonValue> | Array<JsonValue>",
});
const inlineInvalidGenericUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type GenericPair = Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineInvalidGenericUnionOutputCode = replaceOrThrow({
    replacement: "JsonArray",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";',
        sourceText: inlineInvalidGenericUnionCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: "Array<JsonValue> | ReadonlyArray<JsonValue>",
});
const inlineValidMismatchedNativeAndGenericCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidNonJsonElementCode = [
    "type NotJsonArray = Array<string> | ReadonlyArray<string>;",
].join("\n");
const inlineValidThreeMemberUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | readonly JsonValue[] | null;",
].join("\n");
const inlineValidReadonlyArrayTypeMismatchCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | readonly string[];",
].join("\n");
const inlineValidMissingGenericArgumentsCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = Array | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidMissingReadonlyGenericArgumentsCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = Array<JsonValue> | ReadonlyArray;",
].join("\n");
const inlineValidQualifiedArrayTypeCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = globalThis.Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidReadonlyOperatorNonArrayTypeCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = readonly ReadonlyArray<JsonValue> | JsonValue[];",
].join("\n");
const inlineValidNonReadonlyTypeOperatorArrayCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | keyof JsonValue[];",
].join("\n");
const inlineInvalidWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type Payload = JsonValue[] | readonly JsonValue[];",
].join("\n");
const inlineInvalidWithoutFixOutputCode = replaceOrThrow({
    replacement: "JsonArray",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";',
        sourceText: inlineInvalidWithoutFixCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: "JsonValue[] | readonly JsonValue[]",
});
const inlineInvalidGenericWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type Payload = Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineInvalidGenericWithoutFixOutputCode = replaceOrThrow({
    replacement: "JsonArray",
    sourceText: replaceOrThrow({
        replacement:
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";',
        sourceText: inlineInvalidGenericWithoutFixCode,
        target: 'import type { JsonValue } from "type-fest";',
    }),
    target: "Array<JsonValue> | ReadonlyArray<JsonValue>",
});
const inlineFixableReversedNativeCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = readonly JsonValue[] | JsonValue[];",
].join("\n");
const inlineFixableReversedNativeOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineFixableCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonValue[] | readonly JsonValue[];",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineGenericFixableCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineFixableReversedGenericCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = ReadonlyArray<JsonValue> | Array<JsonValue>;",
].join("\n");

const inlineGenericFixableOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineFixableReversedGenericOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineValidNativeNonJsonElementCode = [
    "type NotJsonArray = string[] | readonly string[];",
].join("\n");
const inlineValidQualifiedJsonValueTypeReferenceCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "type NotJsonArray = Array<TypeFest.JsonValue> | ReadonlyArray<TypeFest.JsonValue>;",
].join("\n");

type JsonArrayReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const jsonArrayUnionArbitrary = fc.constantFrom(
    "JsonValue[] | readonly JsonValue[]",
    "readonly JsonValue[] | JsonValue[]",
    "Array<JsonValue> | ReadonlyArray<JsonValue>",
    "ReadonlyArray<JsonValue> | Array<JsonValue>"
);

const parseUnionTypeFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    unionType: TSESTree.TSUnionType;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSUnionType
        ) {
            return {
                ast: parsed.ast,
                unionType: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a TSUnionType"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferJsonArray: preferJsonArrayMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-json-array internal JsonValue[] guard", () => {
    it("reports only native/generic JsonValue array union pairs", async () => {
        const replacementFixCalls: Readonly<UnknownArray>[] = [];
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];

        const createIdentifierNode = (name: string) => ({
            name,
            type: "Identifier",
        });
        const createTypeReferenceNode = (
            referenceName: string,
            genericArguments: Readonly<UnknownArray> = []
        ) => ({
            type: "TSTypeReference",
            ...(genericArguments.length === 0
                ? {}
                : {
                      typeArguments: {
                          params: genericArguments,
                      },
                  }),
            typeName: createIdentifierNode(referenceName),
        });
        const jsonValueTypeReferenceNode = createTypeReferenceNode("JsonValue");
        const createNativeArrayNode = (elementType: unknown) => ({
            elementType,
            type: "TSArrayType",
        });
        const createReadonlyNativeArrayNode = (elementType: unknown) => ({
            operator: "readonly",
            type: "TSTypeOperator",
            typeAnnotation: createNativeArrayNode(elementType),
        });
        const createUnionNode = (...types: Readonly<UnknownArray>) => ({
            type: "TSUnionType",
            types,
        });

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
                (await import("../src/rules/prefer-type-fest-json-array")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
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

            const unionTypeListener = listeners.TSUnionType;

            expect(unionTypeListener).toBeTypeOf("function");

            const validNativePairNode = createUnionNode(
                createNativeArrayNode(jsonValueTypeReferenceNode),
                createReadonlyNativeArrayNode(jsonValueTypeReferenceNode)
            );
            const validGenericPairNode = createUnionNode(
                createTypeReferenceNode("Array", [jsonValueTypeReferenceNode]),
                createTypeReferenceNode("ReadonlyArray", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidNonTargetIdentifiersNode = createUnionNode(
                createTypeReferenceNode("ArrayLike", [
                    jsonValueTypeReferenceNode,
                ]),
                createTypeReferenceNode("ReadonlyArrayLike", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidMissingArrayTypeArgumentNode = createUnionNode(
                createTypeReferenceNode("Array"),
                createTypeReferenceNode("ReadonlyArray", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidMissingReadonlyTypeArgumentNode = createUnionNode(
                createTypeReferenceNode("Array", [jsonValueTypeReferenceNode]),
                createTypeReferenceNode("ReadonlyArray")
            );
            const invalidOneSidedGenericMatchNode = createUnionNode(
                createTypeReferenceNode("ReadonlyArray", [
                    jsonValueTypeReferenceNode,
                ]),
                createTypeReferenceNode("Array", [
                    createTypeReferenceNode("UnknownValue"),
                ])
            );
            const invalidGenericReadonlyIdentifierNode = createUnionNode(
                createTypeReferenceNode("Array", [jsonValueTypeReferenceNode]),
                createTypeReferenceNode("ReadonlyArrayLike", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidNonArrayLeftNativeNode = createUnionNode(
                {
                    operator: "keyof",
                    type: "TSTypeOperator",
                    typeAnnotation: createNativeArrayNode(
                        jsonValueTypeReferenceNode
                    ),
                },
                createReadonlyNativeArrayNode(jsonValueTypeReferenceNode)
            );
            const invalidThreeMemberUnionNode = createUnionNode(
                createNativeArrayNode(jsonValueTypeReferenceNode),
                createReadonlyNativeArrayNode(jsonValueTypeReferenceNode),
                {
                    type: "TSNullKeyword",
                }
            );

            unionTypeListener?.(validNativePairNode);
            unionTypeListener?.(validGenericPairNode);
            unionTypeListener?.(invalidNonTargetIdentifiersNode);
            unionTypeListener?.(invalidMissingArrayTypeArgumentNode);
            unionTypeListener?.(invalidMissingReadonlyTypeArgumentNode);
            unionTypeListener?.(invalidOneSidedGenericMatchNode);
            unionTypeListener?.(invalidGenericReadonlyIdentifierNode);
            unionTypeListener?.(invalidNonArrayLeftNativeNode);
            unionTypeListener?.(invalidThreeMemberUnionNode);

            expect(reportCalls).toHaveLength(2);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferJsonArray",
                node: validNativePairNode,
            });
            expect(reportCalls[1]).toMatchObject({
                messageId: "preferJsonArray",
                node: validGenericPairNode,
            });
            expect(replacementFixCalls).toHaveLength(2);
            expect(replacementFixCalls[0]?.[1]).toBe("JsonArray");
            expect(replacementFixCalls[1]?.[1]).toBe("JsonArray");
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: JsonArray replacement text remains parseable for supported unions", async () => {
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
                (await import("../src/rules/prefer-type-fest-json-array")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(jsonArrayUnionArbitrary, (jsonArrayUnionText) => {
                    createSafeTypeNodeReplacementFixMock.mockClear();

                    const code = [
                        'import type { JsonArray, JsonValue } from "type-fest";',
                        `type Candidate = ${jsonArrayUnionText};`,
                    ].join("\n");

                    const { ast, unionType } = parseUnionTypeFromCode(code);
                    const reportCalls: JsonArrayReportDescriptor[] = [];

                    const listeners = authoredRuleModule.default.create({
                        filename:
                            "fixtures/typed/prefer-type-fest-json-array.invalid.ts",
                        report: (descriptor: JsonArrayReportDescriptor) => {
                            reportCalls.push(descriptor);
                        },
                        sourceCode: {
                            ast,
                        },
                    });

                    const unionTypeListener = getSelectorAwareNodeListener(
                        listeners as Readonly<Record<string, unknown>>,
                        "TSUnionType"
                    );

                    unionTypeListener?.(unionType);

                    expect(reportCalls).toHaveLength(1);
                    expect(reportCalls[0]).toMatchObject({
                        messageId: "preferJsonArray",
                    });

                    if (
                        createSafeTypeNodeReplacementFixMock.mock.calls.length >
                        0
                    ) {
                        expect(
                            createSafeTypeNodeReplacementFixMock
                        ).toHaveBeenCalledTimes(1);
                    } else {
                        expect(reportCalls[0]?.fix).toBeTypeOf("function");
                    }

                    const calledReplacementName =
                        createSafeTypeNodeReplacementFixMock.mock.calls[0]?.[1];

                    if (
                        createSafeTypeNodeReplacementFixMock.mock.calls.length >
                        0
                    ) {
                        expect(calledReplacementName).toBe("JsonArray");
                    }

                    const fixedCode = `${code.slice(0, unionType.range[0])}JsonArray${code.slice(unionType.range[1])}`;

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }),
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
                    messageId: "preferJsonArray",
                },
                {
                    messageId: "preferJsonArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonArray-like unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReversedNativeUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed native array union",
            output: inlineInvalidReversedNativeUnionOutputCode,
        },
        {
            code: inlineInvalidReversedGenericUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed generic array union",
            output: inlineInvalidReversedGenericUnionOutputCode,
        },
        {
            code: inlineInvalidGenericUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic array union",
            output: inlineInvalidGenericUnionOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports JsonValue array union without fix when JsonArray import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineInvalidGenericWithoutFixCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic JsonValue array union without fix when JsonArray import is missing",
            output: inlineInvalidGenericWithoutFixOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes JsonValue array union when JsonArray import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineFixableReversedNativeCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed JsonValue array union when JsonArray import is in scope",
            output: inlineFixableReversedNativeOutput,
        },
        {
            code: inlineGenericFixableCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes generic JsonValue array union when JsonArray import is in scope",
            output: inlineGenericFixableOutput,
        },
        {
            code: inlineFixableReversedGenericCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed generic JsonValue array union when JsonArray import is in scope",
            output: inlineFixableReversedGenericOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidMismatchedNativeAndGenericCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed native and generic array forms",
        },
        {
            code: inlineValidNonJsonElementCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-JsonValue element array union",
        },
        {
            code: inlineValidNativeNonJsonElementCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores native arrays with non-JsonValue element type",
        },
        {
            code: inlineValidThreeMemberUnionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unions with more than two members",
        },
        {
            code: inlineValidReadonlyArrayTypeMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array element type mismatch",
        },
        {
            code: inlineValidMissingGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Array without generic arguments",
        },
        {
            code: inlineValidMissingReadonlyGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without generic arguments",
        },
        {
            code: inlineValidQualifiedArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Array qualified union",
        },
        {
            code: inlineValidQualifiedJsonValueTypeReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores arrays using namespace-qualified JsonValue type references",
        },
        {
            code: inlineValidReadonlyOperatorNonArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly operator applied to non-array reference",
        },
        {
            code: inlineValidNonReadonlyTypeOperatorArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-readonly type-operator array member",
        },
    ],
});
