/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-async-return-type.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import { getSourceTextForNode } from "./_internal/source-text-for-node";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-async-return-type");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-async-return-type.valid.ts";
const invalidFixtureName = "prefer-type-fest-async-return-type.invalid.ts";
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
            `Expected async-return-type fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { AsyncReturnType } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "AsyncReturnType<MonitorProbe>",
        sourceText: invalidFixtureCode,
        target: "Awaited<ReturnType<MonitorProbe>>",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "AsyncReturnType<typeof loadMonitorSummary>",
    sourceText: fixtureFixableOutputCode,
    target: "Awaited<ReturnType<typeof loadMonitorSummary>>",
});
const inlineInvalidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>>;";
const inlineInvalidOutput = [
    'import type { AsyncReturnType } from "type-fest";',
    "type Result = AsyncReturnType<() => Promise<string>>;",
].join("\n");
const inlineInvalidWithoutFixCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>>;";
const inlineInvalidWithoutFixOutput = inlineInvalidOutput;
const shadowedReplacementNameInvalidCode =
    "type Wrapper<AsyncReturnType extends (...arguments_: never[]) => Promise<string>> = Awaited<ReturnType<AsyncReturnType>>;";
const awaitedWithoutTypeArgumentValidCode = "type Result = Awaited;";
const awaitedNonReturnTypeValidCode = "type Result = Awaited<string>;";
const awaitedExtraTypeArgumentValidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>, string>;";
const awaitedReturnTypeWithoutArgValidCode =
    "type Result = Awaited<ReturnType>;";
const awaitedReturnTypeWithExtraTypeArgumentValidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>, string>>;";
const awaitedPromiseTypeReferenceValidCode =
    "type Result = Awaited<Promise<string>>;";
const awaitedQualifiedReturnTypeValidCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "type Result = Awaited<TypeFest.ReturnType<() => Promise<string>>>;",
].join("\n");
const nonAwaitedWrapperOfReturnTypeValidCode = [
    "type Wrapper<T> = T;",
    "type Result = Wrapper<ReturnType<() => Promise<string>>>;",
].join("\n");
const inlineFixableCode = [
    'import type { AsyncReturnType } from "type-fest";',
    "",
    "type Result = Awaited<ReturnType<() => Promise<string>>>;",
].join("\n");
const inlineFixableOutput = [
    'import type { AsyncReturnType } from "type-fest";',
    "",
    "type Result = AsyncReturnType<() => Promise<string>>;",
].join("\n");

type AsyncReturnTypeReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const returnTypeTargetArbitrary = fc.constantFrom(
    "() => Promise<string>",
    "(...args: readonly string[]) => Promise<number>",
    "() => Promise<{ readonly status: 'ok' }>",
    "(value: number) => Promise<ReadonlyArray<number>>"
);

const parseAwaitedTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    awaitedTypeReference: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return {
                ast: parsed.ast,
                awaitedTypeReference: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from an Awaited<ReturnType<...>> type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-async-return-type", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest AsyncReturnType over Awaited<ReturnType<T>> compositions for async return extraction.",
    enforceRuleShape: true,
    messages: {
        preferAsyncReturnType:
            "Prefer `AsyncReturnType<T>` from type-fest over `Awaited<ReturnType<T>>`.",
    },
    name: "prefer-type-fest-async-return-type",
});

describe("prefer-type-fest-async-return-type runtime safety assertions", () => {
    it("handles defensive malformed-type-argument fallback without reporting", async () => {
        try {
            vi.resetModules();

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set(["AsyncReturnType"]),
                    createSafeTypeNodeTextReplacementFix: () => null,
                })
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-async-return-type")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const sourceText =
                "type Result = Awaited<ReturnType<() => Promise<string>>>;";
            const parsed = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const [statement] = parsed.ast.body;
            if (
                statement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration ||
                statement.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference
            ) {
                throw new Error(
                    "Expected Awaited<ReturnType<...>> type alias AST shape"
                );
            }

            const awaitedReferenceNode = statement.typeAnnotation;
            if (awaitedReferenceNode.typeArguments === undefined) {
                throw new Error(
                    "Expected Awaited type arguments for malformed-params test"
                );
            }

            Object.defineProperty(
                awaitedReferenceNode.typeArguments,
                "params",
                {
                    value: [undefined],
                }
            );

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-async-return-type.invalid.ts",
                report,
                sourceCode: {
                    ast: parsed.ast,
                    getText: () => "() => Promise<string>",
                },
            });

            listenerMap.TSTypeReference?.(awaitedReferenceNode);

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: AsyncReturnType replacement text remains parseable for Awaited<ReturnType<...>> inputs", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeTextReplacementFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    createSafeTypeNodeTextReplacementFix:
                        createSafeTypeNodeTextReplacementFixMock,
                })
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-async-return-type")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(returnTypeTargetArbitrary, (returnTypeTarget) => {
                    createSafeTypeNodeTextReplacementFixMock.mockClear();

                    const code = [
                        "declare const marker: unique symbol;",
                        `type Candidate = Awaited<ReturnType<${returnTypeTarget}>>;`,
                        "void marker;",
                    ].join("\n");

                    const { ast, awaitedTypeReference } =
                        parseAwaitedTypeReferenceFromCode(code);
                    const reportCalls: AsyncReturnTypeReportDescriptor[] = [];

                    const listeners = undecoratedRuleModule.default.create({
                        filename:
                            "fixtures/typed/prefer-type-fest-async-return-type.invalid.ts",
                        report: (
                            descriptor: AsyncReturnTypeReportDescriptor
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

                    const tsReferenceListener = getSelectorAwareNodeListener(
                        listeners as Readonly<Record<string, unknown>>,
                        "TSTypeReference"
                    );

                    tsReferenceListener?.(awaitedTypeReference);

                    expect(reportCalls).toHaveLength(1);
                    expect(reportCalls[0]).toMatchObject({
                        messageId: "preferAsyncReturnType",
                    });

                    if (
                        createSafeTypeNodeTextReplacementFixMock.mock.calls
                            .length > 0
                    ) {
                        expect(
                            createSafeTypeNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);
                    }

                    const replacementText =
                        createSafeTypeNodeTextReplacementFixMock.mock
                            .calls[0]?.[2] ??
                        `AsyncReturnType<${returnTypeTarget}>`;

                    if (typeof replacementText !== "string") {
                        throw new TypeError(
                            "Expected AsyncReturnType replacement text to be a string"
                        );
                    }

                    const fixedCode = `${code.slice(0, awaitedTypeReference.range[0])}${replacementText}${code.slice(awaitedTypeReference.range[1])}`;

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

ruleTester.run("prefer-type-fest-async-return-type", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferAsyncReturnType",
                },
                {
                    messageId: "preferAsyncReturnType",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Awaited<ReturnType<...>> compositions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline Awaited<ReturnType<...>> composition",
            output: inlineInvalidOutput,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Awaited<ReturnType<...>> without fix when AsyncReturnType import is missing",
            output: inlineInvalidWithoutFixOutput,
        },
        {
            code: shadowedReplacementNameInvalidCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports without autofix when AsyncReturnType identifier is shadowed by a type parameter",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Awaited<ReturnType<...>> when AsyncReturnType import is in scope",
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
            code: awaitedWithoutTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Awaited reference",
        },
        {
            code: awaitedNonReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited over direct non-ReturnType operand",
        },
        {
            code: awaitedExtraTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited references with extra type arguments",
        },
        {
            code: awaitedReturnTypeWithoutArgValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited<ReturnType> without type arguments",
        },
        {
            code: awaitedReturnTypeWithExtraTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited<ReturnType<...>> when ReturnType has extra type arguments",
        },
        {
            code: awaitedPromiseTypeReferenceValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited over Promise<T>",
        },
        {
            code: awaitedQualifiedReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited over namespace-qualified ReturnType",
        },
        {
            code: nonAwaitedWrapperOfReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Awaited wrappers around ReturnType operands",
        },
    ],
});
