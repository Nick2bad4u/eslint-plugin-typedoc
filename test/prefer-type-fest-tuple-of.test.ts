/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-tuple-of.test` behavior.
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

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-tuple-of";
const docsDescription =
    "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.";
const preferTupleOfMessage =
    "Prefer `{{replacement}}` from type-fest to model fixed-length homogeneous tuples instead of legacy alias `{{alias}}`.";
const defaultOptions = [
    {
        enforcedAliasNames: ["ReadonlyTuple", "Tuple"],
    },
] as const;
const tupleOnlyOptions = [
    {
        enforcedAliasNames: ["Tuple"],
    },
] as const;

const validFixtureName = "prefer-type-fest-tuple-of.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-tuple-of.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-tuple-of.invalid.ts";
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
            `Expected prefer-type-fest-tuple-of fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const createFixtureFixableOutputCode = (sourceText: string): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";

    // The fixer currently emits an LF between the existing import and inserted import,
    // then keeps native source newlines for the rest of the file. Mirror that output here.
    const withTypeFestImport = replaceOrThrow({
        replacement: `import type { ReadonlyTuple } from "type-aliases";\nimport type { TupleOf } from "type-fest";${sourceLineEnding}`,
        sourceText,
        target: `import type { ReadonlyTuple } from "type-aliases";${sourceLineEnding}`,
    });

    return replaceOrThrow({
        replacement: "type MonitorTuple = Readonly<TupleOf<3, string>>;",
        sourceText: withTypeFestImport,
        target: "type MonitorTuple = ReadonlyTuple<string, 3>;",
    });
};

const fixtureFixableOutputCode =
    createFixtureFixableOutputCode(invalidFixtureCode);
const inlineFixableReadonlyTupleInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineFixableReadonlyTupleOutputCode = replaceOrThrow({
    replacement: "type Values = Readonly<TupleOf<3, string>>;",
    sourceText: inlineFixableReadonlyTupleInvalidCode,
    target: "type Values = ReadonlyTuple<string, 3>;",
});

const inlineFixableTupleInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = Tuple<string, 3>;",
].join("\n");

const inlineFixableTupleOutputCode = replaceOrThrow({
    replacement: "type Values = TupleOf<3, string>;",
    sourceText: inlineFixableTupleInvalidCode,
    target: "type Values = Tuple<string, 3>;",
});

const inlineNoFixShadowedTupleOfInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<TupleOf> = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineNoFixTupleAliasShadowedTupleOfInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<TupleOf> = Tuple<string, 3>;",
].join("\n");

const inlineNoFixShadowedReadonlyInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineFixTupleWhenReadonlyShadowedInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = Tuple<string, 3>;",
].join("\n");

const inlineFixTupleWhenReadonlyShadowedOutputCode = replaceOrThrow({
    replacement: "type Box<Readonly> = TupleOf<3, string>;",
    sourceText: inlineFixTupleWhenReadonlyShadowedInvalidCode,
    target: "type Box<Readonly> = Tuple<string, 3>;",
});
const readonlyTupleIgnoredByOptionsValidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    "",
    "type Values = ReadonlyTuple<string, 3>;",
].join("\n");

type TupleOfReportDescriptor = Readonly<{
    data?: {
        alias?: string;
        replacement?: string;
    };
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const aliasNameArbitrary = fc.constantFrom("Tuple", "ReadonlyTuple");

const elementTypeTextArbitrary = fc.constantFrom(
    "string",
    "{ readonly id: string }",
    "Promise<number>",
    "readonly string[]"
);

const lengthTypeTextArbitrary = fc.constantFrom(
    "3",
    "Length",
    "1 | 2",
    "number"
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

const parseTupleAliasTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a tuple alias reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions,
    docsDescription,
    messages: {
        preferTupleOf: preferTupleOfMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-tuple-of source assertions", () => {
    it("fast-check: Tuple/TupleOf replacement text remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeTextReplacementFixMock = vi.fn(
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
                    collectImportedTypeAliasMatches: () =>
                        new Map([
                            [
                                "ReadonlyTuple",
                                {
                                    importedName: "ReadonlyTuple",
                                    replacementName:
                                        "Readonly<TupleOf<Length, Element>>",
                                    sourceValue: "type-aliases",
                                },
                            ],
                            [
                                "Tuple",
                                {
                                    importedName: "Tuple",
                                    replacementName: "TupleOf<Length, Element>",
                                    sourceValue: "type-aliases",
                                },
                            ],
                        ]),
                    createSafeTypeNodeTextReplacementFix:
                        createSafeTypeNodeTextReplacementFixMock,
                    isTypeParameterNameShadowed: () => false,
                })
            );

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-tuple-of")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                            'TSTypeReference[typeName.type="Identifier"]'?: (
                                node: unknown
                            ) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    aliasNameArbitrary,
                    elementTypeTextArbitrary,
                    lengthTypeTextArbitrary,
                    (aliasName, elementTypeText, lengthTypeText) => {
                        createSafeTypeNodeTextReplacementFixMock.mockClear();

                        const code = [
                            "declare const marker: unique symbol;",
                            `type Candidate = ${aliasName}<${elementTypeText}, ${lengthTypeText}>;`,
                            "void marker;",
                        ].join("\n");

                        const { ast, tsReference } =
                            parseTupleAliasTypeReferenceFromCode(code);
                        const reportCalls: TupleOfReportDescriptor[] = [];

                        const listeners = undecoratedRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-tuple-of.invalid.ts",
                            report: (descriptor: TupleOfReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        const referenceListener =
                            listeners.TSTypeReference ??
                            listeners[
                                'TSTypeReference[typeName.type="Identifier"]'
                            ];

                        referenceListener?.(tsReference);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTupleOf",
                        });
                        expect(
                            createSafeTypeNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const replacementText =
                            createSafeTypeNodeTextReplacementFixMock.mock
                                .calls[0]?.[2];

                        if (typeof replacementText !== "string") {
                            throw new TypeError(
                                "Expected TupleOf replacement text to be a string"
                            );
                        }

                        const fixedCode = `${code.slice(0, tsReference.range[0])}${replacementText}${code.slice(tsReference.range[1])}`;

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

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture ReadonlyTuple and Tuple aliases",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableReadonlyTupleInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline ReadonlyTuple alias import",
            output: inlineFixableReadonlyTupleOutputCode,
        },
        {
            code: inlineFixableTupleInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline Tuple alias import",
            output: inlineFixableTupleOutputCode,
        },
        {
            code: inlineNoFixShadowedTupleOfInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyTuple alias when TupleOf identifier is shadowed",
            output: null,
        },
        {
            code: inlineNoFixTupleAliasShadowedTupleOfInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Tuple alias when TupleOf identifier is shadowed",
            output: null,
        },
        {
            code: inlineNoFixShadowedReadonlyInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyTuple alias when Readonly identifier is shadowed",
            output: null,
        },
        {
            code: inlineFixTupleWhenReadonlyShadowedInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Tuple alias even when Readonly identifier is shadowed",
            output: inlineFixTupleWhenReadonlyShadowedOutputCode,
        },
        {
            code: inlineFixableTupleInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports only configured aliases via enforcedAliasNames option",
            options: tupleOnlyOptions,
            output: inlineFixableTupleOutputCode,
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
            name: "accepts namespace-qualified TupleOf references",
        },
        {
            code: readonlyTupleIgnoredByOptionsValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores aliases that are excluded by enforcedAliasNames option",
            options: tupleOnlyOptions,
        },
    ],
});
