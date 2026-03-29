import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-array.test` behavior.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-unknown-array";
const docsDescription =
    "require TypeFest UnknownArray over readonly unknown[] and ReadonlyArray<unknown> aliases.";
const preferUnknownArrayMessage =
    "Prefer `Readonly<UnknownArray>` from type-fest over `readonly unknown[]` or `ReadonlyArray<unknown>`.";

const rule = getPluginRule(ruleId);
const ruleTester = createRuleTester();

const validFixtureName = "prefer-type-fest-unknown-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-array.invalid.ts";
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
            `Expected prefer-type-fest-unknown-array fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { UnknownArray } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "Readonly<UnknownArray>",
        sourceText: invalidFixtureCode,
        target: "readonly unknown[]",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "Readonly<UnknownArray>",
    sourceText: fixtureFixableOutputCode,
    target: "ReadonlyArray<unknown>",
});
const inlineInvalidReadonlyArrayCode = "type Input = readonly unknown[];";
const inlineInvalidReadonlyArrayOutputCode = [
    'import type { UnknownArray } from "type-fest";',
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineValidArrayCode = "type Input = unknown[];";
const inlineValidAnyArrayCode = "type Input = readonly any[];";
const inlineValidNoTypeArgumentCode = "type Input = ReadonlyArray<string>;";
const inlineValidAnyTypeArgumentCode = "type Input = ReadonlyArray<any>;";
const inlineValidUnknownUnionTypeArgumentCode =
    "type Input = ReadonlyArray<unknown | string>;";
const inlineValidQualifiedReadonlyArrayCode =
    "type Input = globalThis.ReadonlyArray<unknown>;";
const inlineValidKeyofUnknownArrayCode = "type Input = keyof unknown[];";
const inlineInvalidReadonlyNonArrayOperatorCode =
    "type Input = readonly ReadonlyArray<unknown>;";
const inlineInvalidReadonlyNonArrayOperatorOutputCode = [
    'import type { UnknownArray } from "type-fest";',
    "type Input = readonly Readonly<UnknownArray>;",
].join("\n");
const inlineValidMissingReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray;";
const inlineValidExtraReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray<unknown, string>;";
const inlineValidNestedUnknownArrayTypeArgumentCode =
    "type Input = ReadonlyArray<unknown[]>;";
const inlineValidCustomGenericUnknownCode = [
    "type Box<T> = T;",
    "type Input = Box<unknown>;",
].join("\n");
const inlineInvalidWithoutFixCode = "type Input = ReadonlyArray<unknown>;";
const inlineInvalidWithoutFixOutputCode = [
    'import type { UnknownArray } from "type-fest";',
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineReadonlyNonArrayOperatorFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly ReadonlyArray<unknown>;",
].join("\n");
const inlineReadonlyNonArrayOperatorFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly Readonly<UnknownArray>;",
].join("\n");
const inlineReadonlyShorthandFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly unknown[];",
].join("\n");
const inlineReadonlyShorthandFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = ReadonlyArray<unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineNoFixShadowedReplacementCode = [
    "type Wrapper<UnknownArray> = readonly unknown[];",
].join("\n");

type UnknownArrayReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

type UnknownArrayVariant = "readonlyArrayShorthand" | "readonlyArrayTypeRef";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const unknownArrayVariantArbitrary = fc.constantFrom<UnknownArrayVariant>(
    "readonlyArrayShorthand",
    "readonlyArrayTypeRef"
);

const parseUnknownArrayCandidateFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    candidateNode: TSESTree.TSTypeOperator | TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            if (
                statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeOperator
            ) {
                return {
                    ast: parsed.ast,
                    candidateNode: statement.typeAnnotation,
                };
            }

            if (
                statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
            ) {
                return {
                    ast: parsed.ast,
                    candidateNode: statement.typeAnnotation,
                };
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias for readonly unknown array candidate"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferUnknownArray: preferUnknownArrayMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-unknown-array internal readonly-array identifier guard", () => {
    it("reports ReadonlyArray<unknown> but ignores other generic identifiers", async () => {
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];
        const replacementFixCalls: Readonly<UnknownArray>[] = [];

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
                    createSafeTypeNodeReplacementFixPreservingReadonly: (
                        ...parameters: Readonly<UnknownArray>
                    ) => {
                        replacementFixCalls.push(parameters);

                        return null;
                    },
                })
            );

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-unknown-array")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = undecoratedRuleModule.default.create({
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

            const readonlyArrayUnknownNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [{ type: "TSUnknownKeyword" }],
                },
                typeName: {
                    name: "ReadonlyArray",
                    type: "Identifier",
                },
            };
            const customGenericUnknownNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [{ type: "TSUnknownKeyword" }],
                },
                typeName: {
                    name: "Box",
                    type: "Identifier",
                },
            };

            referenceListener?.(readonlyArrayUnknownNode);
            referenceListener?.(customGenericUnknownNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferUnknownArray",
                node: readonlyArrayUnknownNode,
            });
            expect(replacementFixCalls).toHaveLength(1);
            expect(replacementFixCalls[0]?.[1]).toBe("UnknownArray");
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: Readonly<UnknownArray> replacement remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeReplacementFixPreservingReadonlyMock =
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
                    createSafeTypeNodeReplacementFixPreservingReadonly:
                        createSafeTypeNodeReplacementFixPreservingReadonlyMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-unknown-array")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeOperator?: (node: unknown) => void;
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    unknownArrayVariantArbitrary,
                    fc.boolean(),
                    (variant, includeUnicodeLine) => {
                        createSafeTypeNodeReplacementFixPreservingReadonlyMock.mockClear();

                        const candidateTypeExpression =
                            variant === "readonlyArrayShorthand"
                                ? "readonly unknown[]"
                                : "ReadonlyArray<unknown>";
                        const unicodeLine = includeUnicodeLine
                            ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                            : "";
                        const generatedCode = [
                            unicodeLine,
                            `type Input = ${candidateTypeExpression};`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, candidateNode } =
                            parseUnknownArrayCandidateFromCode(generatedCode);
                        const reports: UnknownArrayReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-unknown-array.invalid.ts",
                            report: (
                                descriptor: UnknownArrayReportDescriptor
                            ) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                            },
                        });

                        const tsOperatorListener = getSelectorAwareNodeListener(
                            listeners as Readonly<Record<string, unknown>>,
                            "TSTypeOperator"
                        );
                        const tsReferenceListener =
                            getSelectorAwareNodeListener(
                                listeners as Readonly<Record<string, unknown>>,
                                "TSTypeReference"
                            );

                        if (
                            candidateNode.type === AST_NODE_TYPES.TSTypeOperator
                        ) {
                            tsOperatorListener?.(candidateNode);
                        } else {
                            tsReferenceListener?.(candidateNode);
                        }

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            messageId: "preferUnknownArray",
                        });

                        if (
                            createSafeTypeNodeReplacementFixPreservingReadonlyMock
                                .mock.calls.length > 0
                        ) {
                            expect(
                                createSafeTypeNodeReplacementFixPreservingReadonlyMock
                            ).toHaveBeenCalledTimes(1);
                            expect(
                                createSafeTypeNodeReplacementFixPreservingReadonlyMock
                                    .mock.calls[0]?.[1]
                            ).toBe("UnknownArray");
                        } else {
                            expect(reports[0]?.fix).toBeTypeOf("function");
                        }

                        const nodeRange = candidateNode.range;
                        const fixedCode = `${generatedCode.slice(0, nodeRange[0])}Readonly<UnknownArray>${generatedCode.slice(nodeRange[1])}`;

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
                    messageId: "preferUnknownArray",
                },
                {
                    messageId: "preferUnknownArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture readonly unknown array aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReadonlyArrayCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown array shorthand alias",
            output: inlineInvalidReadonlyArrayOutputCode,
        },
        {
            code: inlineInvalidReadonlyNonArrayOperatorCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly operator over unknown[] type reference",
            output: inlineInvalidReadonlyNonArrayOperatorOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyArray<unknown> even when UnknownArray import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown[] when replacement identifier is shadowed",
            output: null,
        },
        {
            code: inlineReadonlyShorthandFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes readonly unknown[] when UnknownArray import is in scope",
            output: inlineReadonlyShorthandFixableOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlyArray<unknown> when UnknownArray import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineReadonlyNonArrayOperatorFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes nested ReadonlyArray<unknown> inside readonly type operator when UnknownArray import is in scope",
            output: inlineReadonlyNonArrayOperatorFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown array shorthand",
        },
        {
            code: inlineValidAnyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly any array shorthand",
        },
        {
            code: inlineValidNoTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array with concrete element type",
        },
        {
            code: inlineValidAnyTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray<any>",
        },
        {
            code: inlineValidUnknownUnionTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray where type argument is not exactly unknown",
        },
        {
            code: inlineValidQualifiedReadonlyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlyArray qualified type reference",
        },
        {
            code: inlineValidKeyofUnknownArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores keyof unknown[] type query",
        },
        {
            code: inlineValidMissingReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without explicit unknown element",
        },
        {
            code: inlineValidExtraReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray with extra type arguments",
        },
        {
            code: inlineValidNestedUnknownArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray with nested unknown[] element type",
        },
        {
            code: inlineValidCustomGenericUnknownCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-ReadonlyArray generic with unknown type argument",
        },
    ],
});
