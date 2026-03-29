/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-non-empty-tuple.test` behavior.
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
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-non-empty-tuple");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-non-empty-tuple.valid.ts";
const invalidFixtureName = "prefer-type-fest-non-empty-tuple.invalid.ts";
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
            `Expected prefer-type-fest-non-empty-tuple fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { NonEmptyTuple } from "type-fest";\n${replaceOrThrow(
    {
        replacement:
            "type NamedNonEmptyTuple = Readonly<NonEmptyTuple<number>>;",
        sourceText: invalidFixtureCode,
        target: "type NamedNonEmptyTuple = readonly [first: number, ...rest: number[]];",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "type VerboseNonEmptyTuple = Readonly<NonEmptyTuple<string>>;",
    sourceText: fixtureFixableOutputCode,
    target: "type VerboseNonEmptyTuple = readonly [string, ...string[]];",
});
const inlineInvalidTupleCode = "type Input = readonly [string, ...string[]];";
const inlineInvalidTupleOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = Readonly<NonEmptyTuple<string>>;",
].join("\n");
const optionalFirstValidCode = "type Input = [first?: string, ...string[]];";
const restOnlyValidCode = "type Input = [...string[]];";
const mixedUnionValidCode =
    "type Input = [string, ...string[]] | [first?: string, ...string[]];";
const threeElementValidCode = "type Input = [string, number, ...string[]];";
const readonlyTrailingElementAfterRestValidCode =
    "type Input = readonly [string, ...string[], number];";
const optionalReadonlyValidCode =
    "type Input = readonly [first?: string, ...string[]];";
const optionalTypeReadonlyValidCode =
    "type Input = readonly [string?, ...string[]];";
const namedRestInvalidCode =
    "type Input = readonly [string, ...rest: string[]];";
const namedRestInvalidOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = Readonly<NonEmptyTuple<string>>;",
].join("\n");
const namedHeadInvalidCode =
    "type Input = readonly [head: string, ...string[]];";
const namedHeadInvalidOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = Readonly<NonEmptyTuple<string>>;",
].join("\n");
const whitespaceNormalizedInvalidCode =
    "type Input = readonly [Map < string , number >, ...Map<string, number>[]];";
const whitespaceNormalizedInvalidOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = Readonly<NonEmptyTuple<Map < string , number >>>;",
].join("\n");
const nonArrayRestAnnotationValidCode =
    "type Input = readonly [string, ...rest: ReadonlyArray<string>];";
const nonRestSecondElementValidCode = "type Input = readonly [string, number];";
const mismatchedReadonlyValidCode =
    "type Input = readonly [string, ...number[]];";
const shadowedReplacementNameInvalidCode =
    "type Wrapper<NonEmptyTuple> = readonly [string, ...string[]];";
const nonReadonlyOperatorValidCode =
    "type Input = keyof [string, ...string[]];";
const readonlyNonTupleTypeValidCode = "type Input = readonly string[];";
const readonlySingleElementTupleValidCode = "type Input = readonly [string];";
const readonlyEmptyTupleValidCode = "type Input = readonly [];";
const inlineFixableCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "",
    "type Input = readonly [string, ...string[]];",
].join("\n");
const inlineFixableOutput = [
    'import type { NonEmptyTuple } from "type-fest";',
    "",
    "type Input = Readonly<NonEmptyTuple<string>>;",
].join("\n");

type NonEmptyTupleReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const tupleHeadTypeArbitrary = fc.constantFrom(
    "string",
    "number",
    "{ readonly id: string }",
    "Map < string , number >"
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

const parseReadonlyTupleOperatorFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    readonlyOperator: TSESTree.TSTypeOperator;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        const operatorTypeAnnotation =
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeOperator
                ? statement.typeAnnotation.typeAnnotation
                : undefined;

        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeOperator &&
            statement.typeAnnotation.operator === "readonly" &&
            operatorTypeAnnotation?.type === AST_NODE_TYPES.TSTupleType
        ) {
            return {
                ast: parsed.ast,
                readonlyOperator: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a readonly tuple type operator"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-non-empty-tuple", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest NonEmptyTuple over readonly [T, ...T[]] tuple patterns.",
    enforceRuleShape: true,
    messages: {
        preferNonEmptyTuple:
            "Prefer `Readonly<NonEmptyTuple<T>>` from type-fest over `readonly [T, ...T[]]`.",
    },
    name: "prefer-type-fest-non-empty-tuple",
});

describe("prefer-type-fest-non-empty-tuple runtime safety assertions", () => {
    it("returns early before text extraction for optional/rest tuple heads", async () => {
        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-non-empty-tuple")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeOperator?: (node: unknown) => void;
                        };
                    };
                };

            const optionalHeadCode =
                "type Input = readonly [string?, ...string[]];";
            const optionalParsed = parser.parseForESLint(optionalHeadCode, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const [optionalStatement] = optionalParsed.ast.body;
            if (
                optionalStatement?.type !==
                    AST_NODE_TYPES.TSTypeAliasDeclaration ||
                optionalStatement.typeAnnotation.type !==
                    AST_NODE_TYPES.TSTypeOperator
            ) {
                throw new Error("Expected optional-head tuple alias AST shape");
            }

            const optionalTupleNode = optionalStatement.typeAnnotation;

            const restFirstTupleNode = {
                operator: "readonly",
                type: "TSTypeOperator",
                typeAnnotation: {
                    elementTypes: [
                        {
                            type: "TSRestType",
                            typeAnnotation: {
                                elementType: { type: "TSStringKeyword" },
                                type: "TSArrayType",
                            },
                        },
                        {
                            type: "TSRestType",
                            typeAnnotation: {
                                elementType: { type: "TSStringKeyword" },
                                type: "TSArrayType",
                            },
                        },
                    ],
                    type: "TSTupleType",
                },
            };
            const missingRestTupleNode = {
                operator: "readonly",
                type: "TSTypeOperator",
                typeAnnotation: {
                    elementTypes: [{ type: "TSStringKeyword" }, undefined],
                    type: "TSTupleType",
                },
            };

            const report = vi.fn();
            const getText = vi.fn((node: unknown): string => {
                const nodeType =
                    typeof node === "object" && node !== null && "type" in node
                        ? (node as { type?: string }).type
                        : undefined;

                if (
                    nodeType === "TSOptionalType" ||
                    nodeType === "TSRestType"
                ) {
                    throw new Error(
                        "Optional/rest tuple heads should return before text extraction"
                    );
                }

                return "string";
            });

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-non-empty-tuple.valid.ts",
                report,
                sourceCode: {
                    ast: optionalParsed.ast,
                    getText,
                },
            });

            listenerMap.TSTypeOperator?.(optionalTupleNode);
            listenerMap.TSTypeOperator?.(restFirstTupleNode);
            listenerMap.TSTypeOperator?.(missingRestTupleNode);

            expect(report).not.toHaveBeenCalled();
            expect(getText).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: Readonly<NonEmptyTuple<T>> replacement remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeTextReplacementFixPreservingReadonlyMock =
                vi.fn((...args: readonly unknown[]) =>
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
                    createSafeTypeNodeTextReplacementFixPreservingReadonly:
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-non-empty-tuple")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeOperator?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(tupleHeadTypeArbitrary, (tupleHeadTypeText) => {
                    createSafeTypeNodeTextReplacementFixPreservingReadonlyMock.mockClear();

                    const code = [
                        "declare const seed: unique symbol;",
                        `type Input = readonly [${tupleHeadTypeText}, ...${tupleHeadTypeText}[]];`,
                        "void seed;",
                    ].join("\n");

                    const { ast, readonlyOperator } =
                        parseReadonlyTupleOperatorFromCode(code);
                    const reportCalls: NonEmptyTupleReportDescriptor[] = [];

                    const listeners = authoredRuleModule.default.create({
                        filename:
                            "fixtures/typed/prefer-type-fest-non-empty-tuple.invalid.ts",
                        report: (descriptor: NonEmptyTupleReportDescriptor) => {
                            reportCalls.push(descriptor);
                        },
                        sourceCode: {
                            ast,
                            getText(node: unknown): string {
                                return getSourceTextForNode({ code, node });
                            },
                        },
                    });

                    listeners.TSTypeOperator?.(readonlyOperator);

                    expect(reportCalls).toHaveLength(1);
                    expect(reportCalls[0]).toMatchObject({
                        fix: "FIX",
                        messageId: "preferNonEmptyTuple",
                    });

                    expect(
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyMock
                    ).toHaveBeenCalledTimes(1);
                    expect(
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyMock
                            .mock.calls[0]?.[1]
                    ).toBe("NonEmptyTuple");
                    expect(
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyMock
                            .mock.calls[0]?.[2]
                    ).toBe(`NonEmptyTuple<${tupleHeadTypeText}>`);

                    const fixedCode = `${code.slice(0, readonlyOperator.range[0])}Readonly<NonEmptyTuple<${tupleHeadTypeText}>>${code.slice(readonlyOperator.range[1])}`;

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

ruleTester.run("prefer-type-fest-non-empty-tuple", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferNonEmptyTuple",
                },
                {
                    messageId: "preferNonEmptyTuple",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture readonly non-empty tuple aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with required head element",
            output: inlineInvalidTupleOutputCode,
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports without autofix when import-insertion fixes are disabled",
            settings: {
                typefest: {
                    disableImportInsertionFixes: true,
                },
            },
        },
        {
            code: shadowedReplacementNameInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports without autofix when replacement identifier is shadowed by a type parameter",
        },
        {
            code: namedRestInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with named rest element",
            output: namedRestInvalidOutputCode,
        },
        {
            code: namedHeadInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with named required head element",
            output: namedHeadInvalidOutputCode,
        },
        {
            code: whitespaceNormalizedInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple when first and rest element text only differ by whitespace",
            output: whitespaceNormalizedInvalidOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes readonly [T, ...T[]] when NonEmptyTuple import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: optionalFirstValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple with optional first element",
        },
        {
            code: restOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple containing only rest elements",
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed union with optional tuple variant",
        },
        {
            code: threeElementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple with multiple required leading elements",
        },
        {
            code: readonlyTrailingElementAfterRestValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with trailing element after rest",
        },
        {
            code: optionalReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with optional named head",
        },
        {
            code: optionalTypeReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with optional shorthand head",
        },
        {
            code: nonArrayRestAnnotationValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple rest annotated as ReadonlyArray",
        },
        {
            code: nonRestSecondElementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuples whose second element is not a rest array",
        },
        {
            code: mismatchedReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with mismatched rest type",
        },
        {
            code: nonReadonlyOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple in non-readonly type operator context",
        },
        {
            code: readonlyNonTupleTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array type alias",
        },
        {
            code: readonlySingleElementTupleValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with single element",
        },
        {
            code: readonlyEmptyTupleValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly empty tuple",
        },
    ],
});
