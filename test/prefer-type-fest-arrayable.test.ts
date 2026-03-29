import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { createSafeTypeNodeTextReplacementFix } from "../src/_internal/imported-type-aliases.js";
import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    bothMembersAreNativeArraysValidCode,
    genericArrayExtraTypeArgumentValidCode,
    genericArrayMismatchedElementValidCode,
    genericArrayMissingTypeArgumentValidCode,
    inlineFixableCode,
    inlineFixableOutput,
    inlineGenericFixableCode,
    inlineGenericFixableOutput,
    inlineGenericFixableReversedCode,
    inlineGenericFixableReversedOutput,
    inlineInvalidCode,
    inlineInvalidGenericArrayCode,
    inlineInvalidGenericArrayOutputCode,
    inlineInvalidGenericArrayReversedCode,
    inlineInvalidGenericArrayReversedOutputCode,
    inlineInvalidOutputCode,
    inlineInvalidReadonlyArrayCode,
    inlineInvalidReversedCode,
    inlineInvalidReversedOutputCode,
    inlineInvalidWhitespaceNormalizedGenericArrayCode,
    inlineInvalidWhitespaceNormalizedGenericArrayOutputCode,
    inlineInvalidWhitespaceNormalizedGenericArrayReversedCode,
    inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode,
    invalidFixtureName,
    nonArrayGenericMatchingElementValidCode,
    nonMatchingUnionValidCode,
    qualifiedGenericArrayValidCode,
    reversedGenericArrayMismatchedElementValidCode,
    singleTypeValidCode,
    threeMemberUnionValidCode,
    validFixtureName,
} from "./_internal/prefer-type-fest-arrayable-cases";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-arrayable";
const docsDescription =
    "require TypeFest Arrayable over T | T[] and T | Array<T> unions.";
const preferArrayableMessage =
    "Prefer `Arrayable<T>` from type-fest over `T | T[]` or `T | Array<T>` unions.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();
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
            `Expected prefer-type-fest-arrayable fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { Arrayable } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "Arrayable<number>",
        sourceText: invalidFixtureCode,
        target: "Array<number> | number",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "Arrayable<string>",
    sourceText: fixtureFixableOutputCode,
    target: "string | string[]",
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ArrayableElementTemplateId =
    | "map"
    | "object"
    | "promise"
    | "string"
    | "tuple";

type ArrayableUnionTemplateId =
    | "genericLeft"
    | "genericRight"
    | "genericWhitespaceLeft"
    | "genericWhitespaceRight"
    | "nativeLeft"
    | "nativeRight";

const arrayableElementTemplateIdArbitrary = fc.constantFrom(
    "string",
    "map",
    "promise",
    "tuple",
    "object"
);

const arrayableUnionTemplateIdArbitrary = fc.constantFrom(
    "nativeRight",
    "nativeLeft",
    "genericRight",
    "genericLeft",
    "genericWhitespaceRight",
    "genericWhitespaceLeft"
);

const buildArrayableElementTemplate = (
    templateId: ArrayableElementTemplateId
): Readonly<{
    elementTypeText: string;
}> => {
    if (templateId === "map") {
        return {
            elementTypeText: "Map<string, number>",
        };
    }

    if (templateId === "object") {
        return {
            elementTypeText: "{ readonly id: string }",
        };
    }

    if (templateId === "promise") {
        return {
            elementTypeText: "Promise<string>",
        };
    }

    if (templateId === "tuple") {
        return {
            elementTypeText: "[string, number]",
        };
    }

    return {
        elementTypeText: "string",
    };
};

const buildArrayableUnionTypeText = ({
    elementTypeText,
    unionTemplateId,
}: Readonly<{
    elementTypeText: string;
    unionTemplateId: ArrayableUnionTemplateId;
}>): string => {
    if (unionTemplateId === "nativeRight") {
        return `${elementTypeText} | ${elementTypeText}[]`;
    }

    if (unionTemplateId === "nativeLeft") {
        return `${elementTypeText}[] | ${elementTypeText}`;
    }

    if (unionTemplateId === "genericRight") {
        return `${elementTypeText} | Array<${elementTypeText}>`;
    }

    if (unionTemplateId === "genericLeft") {
        return `Array<${elementTypeText}> | ${elementTypeText}`;
    }

    if (unionTemplateId === "genericWhitespaceRight") {
        return `${elementTypeText} | Array < ${elementTypeText} >`;
    }

    return `Array < ${elementTypeText} > | ${elementTypeText}`;
};

const isArrayTypeReferenceNode = (
    node: Readonly<TSESTree.TypeNode>
): node is TSESTree.TSTypeReference => {
    if (
        node.type !== AST_NODE_TYPES.TSTypeReference ||
        node.typeName.type !== AST_NODE_TYPES.Identifier ||
        node.typeName.name !== "Array"
    ) {
        return false;
    }

    const genericArguments = node.typeArguments?.params ?? [];

    return genericArguments.length === 1;
};

const parseQueryValueUnionFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    expectedElementText: string;
    unionNode: TSESTree.TSUnionType;
    unionRange: readonly [number, number];
}> => {
    const parsedResult = parser.parseForESLint(code, parserOptions);

    for (const statement of parsedResult.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "QueryValue" &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSUnionType
        ) {
            const [firstType, secondType] = statement.typeAnnotation.types;

            if (!firstType || !secondType) {
                throw new Error(
                    "Expected QueryValue union to contain two members"
                );
            }

            const expectedElementText =
                firstType.type === AST_NODE_TYPES.TSArrayType ||
                isArrayTypeReferenceNode(firstType)
                    ? code.slice(secondType.range[0], secondType.range[1])
                    : code.slice(firstType.range[0], firstType.range[1]);

            return {
                ast: parsedResult.ast,
                expectedElementText,
                unionNode: statement.typeAnnotation,
                unionRange: statement.typeAnnotation.range,
            };
        }
    }

    throw new Error("Expected generated code to include QueryValue union");
};

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

    const nodeRange = (node as Readonly<{ range?: readonly [number, number] }>)
        .range;

    if (!nodeRange) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

const assertIsReplaceFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected report descriptor fix to be a function");
    }
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferArrayable: preferArrayableMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-arrayable internal generic Array<T> guard", () => {
    it("reports only matching Array<T> union shapes", async () => {
        const replacementFixCalls: Readonly<UnknownArray>[] = [];
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];

        const createIdentifierNode = (name: string) => ({
            name,
            type: "Identifier",
        });
        const createKeywordTypeNode = (
            type: "TSNumberKeyword" | "TSStringKeyword",
            text: string
        ) => ({
            text,
            type,
        });
        const createTypeReferenceNode = (
            referenceName: string,
            genericArguments: Readonly<UnknownArray> = [],
            text = referenceName
        ) => ({
            text,
            type: "TSTypeReference",
            typeArguments:
                genericArguments.length === 0
                    ? undefined
                    : {
                          params: genericArguments,
                      },
            typeName: createIdentifierNode(referenceName),
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
                    createSafeTypeNodeTextReplacementFix: (
                        ...parameters: Readonly<UnknownArray>
                    ) => {
                        replacementFixCalls.push(parameters);

                        return null;
                    },
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-arrayable")) as {
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
                    getText(node: Readonly<{ text?: string }>) {
                        return node.text ?? "";
                    },
                },
            });

            const unionTypeListener = listeners.TSUnionType;

            expect(unionTypeListener).toBeTypeOf("function");

            const stringKeywordNode = createKeywordTypeNode(
                "TSStringKeyword",
                "string"
            );
            const numberKeywordNode = createKeywordTypeNode(
                "TSNumberKeyword",
                "number"
            );

            const validRightGenericNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode(
                    "Array",
                    [stringKeywordNode],
                    "Array<string>"
                )
            );
            const validLeftGenericNode = createUnionNode(
                createTypeReferenceNode(
                    "Array",
                    [stringKeywordNode],
                    "Array<string>"
                ),
                stringKeywordNode
            );
            const invalidNonArrayGenericNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode(
                    "Box",
                    [stringKeywordNode],
                    "Box<string>"
                )
            );
            const invalidMismatchedLeftGenericNode = createUnionNode(
                createTypeReferenceNode(
                    "Array",
                    [numberKeywordNode],
                    "Array<number>"
                ),
                stringKeywordNode
            );
            const invalidMissingGenericArgumentNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode("Array", [], "Array")
            );
            const invalidThreeMemberUnionNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode(
                    "Array",
                    [stringKeywordNode],
                    "Array<string>"
                ),
                {
                    text: "null",
                    type: "TSNullKeyword",
                }
            );
            const invalidUndefinedUnionMemberNode = createUnionNode(
                stringKeywordNode,
                undefined
            );
            const invalidUndefinedArrayTypeArgumentNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode(
                    "Array",
                    [undefined],
                    "Array<undefined>"
                )
            );

            unionTypeListener?.(validRightGenericNode);
            unionTypeListener?.(validLeftGenericNode);
            unionTypeListener?.(invalidNonArrayGenericNode);
            unionTypeListener?.(invalidMismatchedLeftGenericNode);
            unionTypeListener?.(invalidMissingGenericArgumentNode);
            unionTypeListener?.(invalidThreeMemberUnionNode);
            unionTypeListener?.(invalidUndefinedUnionMemberNode);
            unionTypeListener?.(invalidUndefinedArrayTypeArgumentNode);

            expect(reportCalls).toHaveLength(2);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferArrayable",
                node: validRightGenericNode,
            });
            expect(reportCalls[1]).toMatchObject({
                messageId: "preferArrayable",
                node: validLeftGenericNode,
            });
            expect(replacementFixCalls).toHaveLength(2);
            expect(replacementFixCalls[0]?.[1]).toBe("Arrayable");
            expect(replacementFixCalls[1]?.[1]).toBe("Arrayable");
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: arrayable unions report and produce parseable Arrayable replacements", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set(["Arrayable"]),
                    createSafeTypeNodeTextReplacementFix,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-arrayable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    arrayableElementTemplateIdArbitrary,
                    arrayableUnionTemplateIdArbitrary,
                    fc.boolean(),
                    (elementTemplateId, unionTemplateId, includeNoiseLine) => {
                        const elementTemplate =
                            buildArrayableElementTemplate(elementTemplateId);
                        const unionTypeText = buildArrayableUnionTypeText({
                            elementTypeText: elementTemplate.elementTypeText,
                            unionTemplateId,
                        });
                        const code = [
                            'import type { Arrayable } from "type-fest";',
                            includeNoiseLine
                                ? 'type Noise = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                                : "",
                            `type QueryValue = ${unionTypeText};`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            expectedElementText,
                            unionNode,
                            unionRange,
                        } = parseQueryValueUnionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
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

                        listeners.TSUnionType?.(unionNode);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferArrayable",
                        });
                        expect(reportCalls[0]?.fix).toBeDefined();

                        const fixFunction: unknown = reportCalls[0]?.fix;
                        assertIsReplaceFixFunction(fixFunction);

                        let replacementText = "";

                        fixFunction({
                            replaceText(node, text): unknown {
                                expect(node).toBe(unionNode);

                                replacementText = text;

                                return text;
                            },
                        });

                        expect(replacementText).toBe(
                            `Arrayable<${expectedElementText}>`
                        );

                        const fixedCode =
                            code.slice(0, unionRange[0]) +
                            replacementText +
                            code.slice(unionRange[1]);

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
                { messageId: "preferArrayable" },
                { messageId: "preferArrayable" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture string-or-array unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports string | string[] union",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineInvalidReversedCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed string[] | string union",
            output: inlineInvalidReversedOutputCode,
        },
        {
            code: inlineInvalidGenericArrayCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports string | Array<string> union",
            output: inlineInvalidGenericArrayOutputCode,
        },
        {
            code: inlineInvalidGenericArrayReversedCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed Array<string> | string union",
            output: inlineInvalidGenericArrayReversedOutputCode,
        },
        {
            code: inlineInvalidWhitespaceNormalizedGenericArrayCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic unions when element text only differs by whitespace",
            output: inlineInvalidWhitespaceNormalizedGenericArrayOutputCode,
        },
        {
            code: inlineInvalidWhitespaceNormalizedGenericArrayReversedCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed generic unions when element text only differs by whitespace",
            output: inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes T | T[] union when Arrayable import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineGenericFixableCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes T | Array<T> union when Arrayable import is in scope",
            output: inlineGenericFixableOutput,
        },
        {
            code: inlineGenericFixableReversedCode,
            errors: [{ messageId: "preferArrayable" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed Array<T> | T union when Arrayable import is in scope",
            output: inlineGenericFixableReversedOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonMatchingUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unions with mismatched array element types",
        },
        {
            code: singleTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores single non-union type alias",
        },
        {
            code: threeMemberUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unions with more than two members",
        },
        {
            code: genericArrayMissingTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores generic array without type arguments",
        },
        {
            code: genericArrayExtraTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores generic array with extra type arguments",
        },
        {
            code: genericArrayMismatchedElementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores generic array with mismatched element type",
        },
        {
            code: reversedGenericArrayMismatchedElementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed generic array with mismatched element type",
        },
        {
            code: nonArrayGenericMatchingElementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Array generic with matching element type",
        },
        {
            code: bothMembersAreNativeArraysValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unions where both members are native arrays",
        },
        {
            code: qualifiedGenericArrayValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Array qualified generic unions",
        },
        {
            code: inlineInvalidReadonlyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array unions already matching Arrayable semantics",
        },
    ],
});
