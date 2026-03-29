/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-simplify.test` behavior.
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

const validFixtureName = "prefer-type-fest-simplify.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-simplify.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-simplify.invalid.ts";
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
            `Expected prefer-type-fest-simplify fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "Simplify<",
    sourceText: replaceOrThrow({
        replacement:
            'import type { Expand, Prettify } from "type-fest";\nimport type { Simplify } from "type-fest";\r\n',
        sourceText: invalidFixtureCode,
        target: 'import type { Expand, Prettify } from "type-fest";\r\n',
    }),
    target: "Expand<",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "Simplify<",
    sourceText: fixtureFixableOutputCode,
    target: "Prettify<",
});
const inlineFixableInvalidCode = [
    'import type { Expand, Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Expand<Payload>;",
    "",
    "String({} as Flattened);",
].join("\n");
const inlineInvalidWithoutFixCode = [
    'import type { Expand } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Expand<Payload>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = [
    'import type { Expand } from "type-fest";',
    'import type { Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Simplify<Payload>;",
].join("\n");
const inlineFixablePrettifyCode = [
    'import type { Prettify, Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Prettify<Payload>;",
].join("\n");
const inlineFixablePrettifyOutput = replaceOrThrow({
    replacement: "type Flattened = Simplify<Payload>;",
    sourceText: inlineFixablePrettifyCode,
    target: "type Flattened = Prettify<Payload>;",
});
const inlineNoFixShadowedReplacementCode = [
    'import type { Expand } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Wrapper<Simplify> = Expand<Payload>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Flattened = Simplify<Payload>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Flattened = Expand<Payload>;",
});

type SimplifyReportDescriptor = Readonly<{
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

const simplifyAliasArbitrary = fc.constantFrom("Expand", "Prettify");

const simplifyOperandArbitrary = fc.constantFrom(
    "{ readonly id: string }",
    "{ alpha: string; beta: number } & { gamma?: boolean }",
    "ReadonlyArray<{ id: string }>",
    "Promise<{ readonly done: true }>"
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

const parseSimplifyTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a simplify candidate type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-simplify", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest Simplify over imported alias types like Prettify/Expand.",
    enforceRuleShape: true,
    messages: {
        preferSimplify:
            "Prefer `{{replacement}}` from type-fest to flatten resolved object and intersection types instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-simplify",
});

describe("prefer-type-fest-simplify source assertions", () => {
    it("fast-check: Simplify replacement text remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeReferenceReplacementFixMock = vi.fn(
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
                                "Expand",
                                {
                                    importedName: "Expand",
                                    replacementName: "Simplify",
                                },
                            ],
                            [
                                "Prettify",
                                {
                                    importedName: "Prettify",
                                    replacementName: "Simplify",
                                },
                            ],
                        ]),
                    createSafeTypeReferenceReplacementFix:
                        createSafeTypeReferenceReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-simplify")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    simplifyAliasArbitrary,
                    simplifyOperandArbitrary,
                    (aliasName, operandTypeText) => {
                        createSafeTypeReferenceReplacementFixMock.mockClear();

                        const code = [
                            "declare const seed: unique symbol;",
                            `type Candidate = ${aliasName}<${operandTypeText}>;`,
                            "void seed;",
                        ].join("\n");

                        const { ast, tsReference } =
                            parseSimplifyTypeReferenceFromCode(code);
                        const reportCalls: SimplifyReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-simplify.invalid.ts",
                            report: (descriptor: SimplifyReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.TSTypeReference?.(tsReference);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            data: {
                                alias: aliasName,
                                replacement: "Simplify",
                            },
                            fix: "FIX",
                            messageId: "preferSimplify",
                        });

                        expect(
                            createSafeTypeReferenceReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const calledReplacementName =
                            createSafeTypeReferenceReplacementFixMock.mock
                                .calls[0]?.[1];

                        expect(calledReplacementName).toBe("Simplify");

                        const fixedCode = `${code.slice(0, tsReference.range[0])}Simplify<${operandTypeText}>${code.slice(tsReference.range[1])}`;

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

ruleTester.run(
    "prefer-type-fest-simplify",
    getPluginRule("prefer-type-fest-simplify"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                    {
                        data: {
                            alias: "Prettify",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Id and Prettify aliases",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline Id alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports Expand alias without fix when Simplify import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
            {
                code: inlineFixablePrettifyCode,
                errors: [
                    {
                        data: {
                            alias: "Prettify",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline Prettify alias import",
                output: inlineFixablePrettifyOutput,
            },
            {
                code: inlineNoFixShadowedReplacementCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports Expand alias when replacement identifier is shadowed",
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
                name: "accepts namespace-qualified Simplify references",
            },
        ],
    }
);
