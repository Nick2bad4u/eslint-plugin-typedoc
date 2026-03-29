/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-iterable-element.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import {
    fastCheckRunConfig,
    isSafeGeneratedIdentifier,
} from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-iterable-element";
const docsDescription =
    "require TypeFest IterableElement over imported aliases such as SetElement/SetEntry/SetValues.";
const preferIterableElementMessage =
    "Prefer `{{replacement}}` from type-fest to extract element types from iterable containers instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-iterable-element.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-iterable-element.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-iterable-element.invalid.ts";
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
            `Expected prefer-type-fest-iterable-element fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "IterableElement<",
    sourceText: replaceOrThrow({
        replacement:
            'from "type-aliases";\nimport type { IterableElement } from "type-fest";\r\n',
        sourceText: invalidFixtureCode,
        target: 'from "type-aliases";\r\n',
    }),
    target: "SetElement<",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "IterableElement<",
    sourceText: replaceOrThrow({
        replacement: "IterableElement<",
        sourceText: fixtureFixableOutputCode,
        target: "SetEntry<",
    }),
    target: "SetValues<",
});
const inlineFixableInvalidCode = [
    'import type { SetElement } from "type-aliases";',
    'import type { IterableElement } from "type-fest";',
    "",
    "type Input = SetElement<Set<string>>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Input = IterableElement<Set<string>>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = SetElement<Set<string>>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { SetElement } from "type-aliases";',
    "",
    "type Wrapper<IterableElement> = SetElement<Set<string>>;",
].join("\n");

type IterableElementAlias = "SetElement" | "SetEntry" | "SetValues";

type IterableElementReportDescriptor = Readonly<{
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

const iterableAliasArbitrary = fc.constantFrom<IterableElementAlias>(
    "SetElement",
    "SetEntry",
    "SetValues"
);

const iterableTypeNameArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate))
    .filter((candidate) => candidate !== "IterableElement");

const iterableContainerArbitrary = fc.constantFrom(
    "Set<string>",
    "ReadonlySet<number>",
    "Map<string, number>",
    "Array<{ readonly id: string }>"
);

const parseTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an iterable alias type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferIterableElement: preferIterableElementMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-iterable-element source assertions", () => {
    it("fast-check: IterableElement replacement remains parseable", async () => {
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
                                "SetElement",
                                {
                                    importedName: "SetElement",
                                    replacementName: "IterableElement",
                                },
                            ],
                            [
                                "SetEntry",
                                {
                                    importedName: "SetEntry",
                                    replacementName: "IterableElement",
                                },
                            ],
                            [
                                "SetValues",
                                {
                                    importedName: "SetValues",
                                    replacementName: "IterableElement",
                                },
                            ],
                        ]),
                    createSafeTypeReferenceReplacementFix:
                        createSafeTypeReferenceReplacementFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-iterable-element")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    iterableAliasArbitrary,
                    iterableTypeNameArbitrary,
                    iterableContainerArbitrary,
                    (aliasName, valueTypeName, containerTypeText) => {
                        createSafeTypeReferenceReplacementFixMock.mockClear();

                        const code = [
                            `import type { ${aliasName} } from "type-aliases";`,
                            `type ${valueTypeName} = ${aliasName}<${containerTypeText}>;`,
                        ].join("\n");

                        const { ast, tsReference } =
                            parseTypeReferenceFromCode(code);
                        const reportCalls: IterableElementReportDescriptor[] =
                            [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-iterable-element.invalid.ts",
                            report: (
                                descriptor: IterableElementReportDescriptor
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                            },
                        });

                        listeners.TSTypeReference?.(tsReference);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            data: {
                                alias: aliasName,
                                replacement: "IterableElement",
                            },
                            fix: "FIX",
                            messageId: "preferIterableElement",
                        });

                        expect(
                            createSafeTypeReferenceReplacementFixMock
                        ).toHaveBeenCalledTimes(1);
                        expect(
                            createSafeTypeReferenceReplacementFixMock.mock
                                .calls[0]?.[1]
                        ).toBe("IterableElement");

                        const fixedCode = `${code.slice(0, tsReference.range[0])}IterableElement<${containerTypeText}>${code.slice(tsReference.range[1])}`;

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
                        alias: "SetElement",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
                {
                    data: {
                        alias: "SetEntry",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
                {
                    data: {
                        alias: "SetValues",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Set* alias usage",
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
                        alias: "SetElement",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline SetElement alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "SetElement",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports SetElement alias when replacement identifier is shadowed",
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
            name: "accepts namespace-qualified IterableElement references",
        },
    ],
});
