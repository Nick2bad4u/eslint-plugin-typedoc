/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-abstract-constructor.test` behavior.
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
const ruleId = "prefer-type-fest-abstract-constructor";
const docsDescription =
    "require TypeFest AbstractConstructor over explicit `abstract new (...) => ...` signatures.";
const preferAbstractConstructorSignatureMessage =
    "Prefer `AbstractConstructor<...>` from type-fest over explicit `abstract new (...) => ...` signatures.";

const validFixtureName = "prefer-type-fest-abstract-constructor.valid.ts";
const invalidFixtureName = "prefer-type-fest-abstract-constructor.invalid.ts";
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
            `Expected prefer-type-fest-abstract-constructor fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const createFixtureFixableOutputCode = (sourceText: string): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";
    const constructorSignatureText = [
        "abstract new (",
        "    queueName: string,",
        "    retryCount: number",
        ") => QueueClient",
    ].join(sourceLineEnding);

    const replacedText = replaceOrThrow({
        replacement:
            "AbstractConstructor<QueueClient, [queueName: string, retryCount: number]>",
        sourceText,
        target: constructorSignatureText,
    });

    return `import type { AbstractConstructor } from "type-fest";\n${replacedText}`;
};

const fixtureFixableOutputCode =
    createFixtureFixableOutputCode(invalidFixtureCode);
const inlineInvalidNoFilenameCode =
    "type AbstractCtor = abstract new (...args: readonly unknown[]) => object;";
const inlineInvalidNoFilenameOutput = [
    'import type { AbstractConstructor } from "type-fest";',
    "type AbstractCtor = AbstractConstructor<object, [...args: readonly unknown[]]>;",
].join("\n");
const inlineFixableCode = [
    'import type { AbstractConstructor } from "type-fest";',
    "",
    "type AbstractCtor = abstract new (name: string, retryCount: number) => object;",
].join("\n");
const inlineFixableOutput = [
    'import type { AbstractConstructor } from "type-fest";',
    "",
    "type AbstractCtor = AbstractConstructor<object, [name: string, retryCount: number]>;",
].join("\n");
const inlineNoFixGenericAbstractCtorCode = [
    'import type { AbstractConstructor } from "type-fest";',
    "",
    "type GenericAbstractCtor = abstract new <T>(value: T) => T;",
].join("\n");

type AbstractConstructorReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const constructorParameterListArbitrary = fc.constantFrom(
    "name: string",
    "name: string, retryCount: number",
    "...args: readonly string[]",
    "id: string | number, options?: { readonly force: boolean }"
);

const constructorReturnTypeArbitrary = fc.constantFrom(
    "object",
    "Promise<string>",
    "ReadonlyArray<number>",
    "{ readonly id: string; readonly retries: number }"
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

const parseAbstractConstructorTypeFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    constructorType: TSESTree.TSConstructorType;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSConstructorType
        ) {
            return {
                ast: parsed.ast,
                constructorType: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from an abstract constructor type"
    );
};

describe("prefer-type-fest-abstract-constructor source assertions", () => {
    it("fast-check: abstract constructor autofix replacement text remains parseable", async () => {
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
                    createSafeTypeNodeTextReplacementFix:
                        createSafeTypeNodeTextReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-abstract-constructor")) as {
                    default: {
                        create: (context: unknown) => {
                            TSConstructorType?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    constructorParameterListArbitrary,
                    constructorReturnTypeArbitrary,
                    (parameterListText, returnTypeText) => {
                        createSafeTypeNodeTextReplacementFixMock.mockClear();

                        const code = [
                            "declare const seed: unique symbol;",
                            `type Candidate = abstract new (${parameterListText}) => ${returnTypeText};`,
                            "void seed;",
                        ].join("\n");

                        const { ast, constructorType } =
                            parseAbstractConstructorTypeFromCode(code);
                        const reportCalls: AbstractConstructorReportDescriptor[] =
                            [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: AbstractConstructorReportDescriptor
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

                        listeners.TSConstructorType?.(constructorType);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferAbstractConstructorSignature",
                        });
                        expect(
                            createSafeTypeNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const replacementText =
                            createSafeTypeNodeTextReplacementFixMock.mock
                                .calls[0]?.[2];

                        if (typeof replacementText !== "string") {
                            throw new TypeError(
                                "Expected abstract constructor replacement text to be a string"
                            );
                        }

                        const fixedCode = `${code.slice(0, constructorType.range[0])}${replacementText}${code.slice(constructorType.range[1])}`;

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

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferAbstractConstructorSignature:
            preferAbstractConstructorSignatureMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferAbstractConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture abstract constructor signatures",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineInvalidNoFilenameCode,
            errors: [
                {
                    messageId: "preferAbstractConstructorSignature",
                },
            ],
            name: "reports inline abstract constructor signature without filename",
            output: inlineInvalidNoFilenameOutput,
        },
        {
            code: inlineFixableCode,
            errors: [
                {
                    messageId: "preferAbstractConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes abstract constructor signature when AbstractConstructor import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixGenericAbstractCtorCode,
            errors: [
                {
                    messageId: "preferAbstractConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic abstract constructor signature without autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
    ],
});
