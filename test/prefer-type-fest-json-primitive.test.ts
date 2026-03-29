/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-primitive.test` behavior.
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
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-json-primitive");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-primitive.valid.ts";
const partialValidFixtureName =
    "prefer-type-fest-json-primitive.partial.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-primitive.invalid.ts";
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
            `Expected prefer-type-fest-json-primitive fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { JsonPrimitive } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "JsonPrimitive",
        sourceText: invalidFixtureCode,
        target: "boolean | null | number | string",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "JsonPrimitive",
    sourceText: fixtureFixableOutputCode,
    target: "boolean | null | number | string",
});
const nonKeywordUnionValidCode =
    "type Payload = string | number | boolean | bigint;";
const duplicatePrimitiveUnionValidCode =
    "type Payload = string | number | boolean | number;";
const duplicateBooleanPrimitiveUnionValidCode =
    "type Payload = null | number | string | string;";
const duplicateNullPrimitiveUnionValidCode =
    "type Payload = boolean | number | string | string;";
const duplicateNumberPrimitiveUnionValidCode =
    "type Payload = boolean | null | string | string;";
const duplicateStringPrimitiveUnionValidCode =
    "type Payload = boolean | null | number | number;";
const fiveMemberPrimitiveUnionValidCode =
    "type Payload = boolean | null | number | string | string;";
const inlineInvalidWithoutFixCode =
    "type Payload = boolean | null | number | string;";
const inlineInvalidWithoutFixOutputCode = [
    'import type { JsonPrimitive } from "type-fest";',
    "type Payload = JsonPrimitive;",
].join("\n");
const inlineFixableCode = [
    'import type { JsonPrimitive } from "type-fest";',
    "",
    "type Payload = boolean | null | number | string;",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonPrimitive } from "type-fest";',
    "",
    "type Payload = JsonPrimitive;",
].join("\n");

type JsonPrimitiveReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const jsonPrimitiveUnionMemberArbitrary = fc.shuffledSubarray(
    [
        "boolean",
        "null",
        "number",
        "string",
    ],
    { maxLength: 4, minLength: 4 }
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
        "Expected generated source text to include a type alias assigned from a JSON primitive union"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-json-primitive", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest JsonPrimitive over explicit null|boolean|number|string unions.",
    enforceRuleShape: true,
    messages: {
        preferJsonPrimitive:
            "Prefer `JsonPrimitive` from type-fest over explicit primitive JSON keyword unions.",
    },
    name: "prefer-type-fest-json-primitive",
});

describe("prefer-type-fest-json-primitive internal listener guards", () => {
    it("reports without fix when replacement builder returns null", async () => {
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
                (await import("../src/rules/prefer-type-fest-json-primitive")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
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

            listeners.TSUnionType?.({
                type: "TSUnionType",
                types: [
                    { type: "TSBooleanKeyword" },
                    { type: "TSNullKeyword" },
                    { type: "TSNumberKeyword" },
                    { type: "TSStringKeyword" },
                ],
            });

            let unstableTypeReadCount = 0;
            const unstableBooleanLikeNode = {
                get type() {
                    unstableTypeReadCount += 1;

                    return unstableTypeReadCount === 1
                        ? "TSBooleanKeyword"
                        : "TSNeverKeyword";
                },
            };

            listeners.TSUnionType?.({
                type: "TSUnionType",
                types: [
                    unstableBooleanLikeNode,
                    { type: "TSNullKeyword" },
                    { type: "TSNumberKeyword" },
                    { type: "TSStringKeyword" },
                ],
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferJsonPrimitive",
            });
            expect(reportCalls[0]).not.toMatchObject({
                fix: expect.anything(),
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: JsonPrimitive replacement remains parseable across union ordering", async () => {
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
                (await import("../src/rules/prefer-type-fest-json-primitive")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    jsonPrimitiveUnionMemberArbitrary,
                    fc.boolean(),
                    (unionMembers, includeUnicodeLine) => {
                        createSafeTypeNodeReplacementFixMock.mockClear();

                        const unicodeLine = includeUnicodeLine
                            ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                            : "";
                        const generatedCode = [
                            unicodeLine,
                            `type Payload = ${unionMembers.join(" | ")};`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, unionType } =
                            parseUnionTypeFromCode(generatedCode);
                        const reports: JsonPrimitiveReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-json-primitive.invalid.ts",
                            report: (
                                descriptor: JsonPrimitiveReportDescriptor
                            ) => {
                                reports.push(descriptor);
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

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            messageId: "preferJsonPrimitive",
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
                            ).toBe("JsonPrimitive");
                        } else {
                            expect(reports[0]?.fix).toBeTypeOf("function");
                        }

                        const fixedCode = `${generatedCode.slice(0, unionType.range[0])}JsonPrimitive${generatedCode.slice(unionType.range[1])}`;

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

ruleTester.run("prefer-type-fest-json-primitive", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferJsonPrimitive",
                },
                {
                    messageId: "preferJsonPrimitive",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonPrimitive-like unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports JSON primitive keyword union without offering a fix when import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonPrimitive" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes JSON primitive keyword union when JsonPrimitive import is in scope",
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
            code: readTypedFixture(partialValidFixtureName),
            filename: typedFixturePath(partialValidFixtureName),
            name: "accepts partial primitive union fixture",
        },
        {
            code: nonKeywordUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union containing non-json primitive keyword",
        },
        {
            code: duplicatePrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores duplicate member primitive union",
        },
        {
            code: duplicateBooleanPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing boolean even when it has four primitive members",
        },
        {
            code: duplicateNullPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing null even when it has four primitive members",
        },
        {
            code: duplicateNumberPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing number even when it has four primitive members",
        },
        {
            code: duplicateStringPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores union missing string even when it has four primitive members",
        },
        {
            code: fiveMemberPrimitiveUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores five-member primitive union even when it contains all json primitive families",
        },
    ],
});
