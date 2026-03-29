/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-constructor.test` behavior.
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
const ruleId = "prefer-type-fest-constructor";
const docsDescription =
    "require TypeFest Constructor over explicit `new (...) => ...` constructor signatures.";
const preferConstructorSignatureMessage =
    "Prefer `Constructor<...>` from type-fest over explicit `new (...) => ...` constructor signatures.";

const validFixtureName = "prefer-type-fest-constructor.valid.ts";
const invalidFixtureName = "prefer-type-fest-constructor.invalid.ts";
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
            `Expected prefer-type-fest-constructor fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const createFixtureFixableOutputCode = (sourceText: string): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";
    const constructorSignatureText = [
        "new (",
        "    queueName: string,",
        "    retryCount: number",
        ") => QueueClient",
    ].join(sourceLineEnding);

    const replacedText = replaceOrThrow({
        replacement:
            "Constructor<QueueClient, [queueName: string, retryCount: number]>",
        sourceText,
        target: constructorSignatureText,
    });

    return `import type { Constructor } from "type-fest";\n${replacedText}`;
};

const fixtureFixableOutputCode =
    createFixtureFixableOutputCode(invalidFixtureCode);
const inlineInvalidNoFilenameCode =
    "type Ctor = new (...args: readonly unknown[]) => object;";
const inlineInvalidNoFilenameOutput = [
    'import type { Constructor } from "type-fest";',
    "type Ctor = Constructor<object, [...args: readonly unknown[]]>;",
].join("\n");
const inlineFixableCode = [
    'import type { Constructor } from "type-fest";',
    "",
    "type Ctor = new (name: string, retryCount: number) => object;",
].join("\n");
const inlineFixableOutput = [
    'import type { Constructor } from "type-fest";',
    "",
    "type Ctor = Constructor<object, [name: string, retryCount: number]>;",
].join("\n");
const inlineNoFixGenericCtorCode = [
    'import type { Constructor } from "type-fest";',
    "",
    "type GenericCtor = new <T>(value: T) => T;",
].join("\n");

type ConstructorReportDescriptor = Readonly<{
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

const parseConstructorTypeFromCode = (
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
        "Expected generated source text to include a type alias assigned from a constructor type"
    );
};

describe("prefer-type-fest-constructor source assertions", () => {
    it("fast-check: constructor autofix replacement text remains parseable", async () => {
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
                (await import("../src/rules/prefer-type-fest-constructor")) as {
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
                            `type Candidate = new (${parameterListText}) => ${returnTypeText};`,
                            "void seed;",
                        ].join("\n");

                        const { ast, constructorType } =
                            parseConstructorTypeFromCode(code);
                        const reportCalls: ConstructorReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: ConstructorReportDescriptor
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
                            messageId: "preferConstructorSignature",
                        });
                        expect(
                            createSafeTypeNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const replacementText =
                            createSafeTypeNodeTextReplacementFixMock.mock
                                .calls[0]?.[2];

                        if (typeof replacementText !== "string") {
                            throw new TypeError(
                                "Expected constructor replacement text to be a string"
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
        preferConstructorSignature: preferConstructorSignatureMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture constructor signatures",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineInvalidNoFilenameCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            name: "reports inline constructor signature without filename",
            output: inlineInvalidNoFilenameOutput,
        },
        {
            code: inlineFixableCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes constructor signature when Constructor import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixGenericCtorCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic constructor signature without autofix",
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
