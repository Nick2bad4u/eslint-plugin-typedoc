import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-if.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-if.valid.ts";
const namespaceValidFixtureName = "prefer-type-fest-if.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-if.invalid.ts";
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
            `Expected prefer-type-fest-if fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: "IsAny<",
    sourceText: replaceOrThrow({
        replacement:
            '} from "type-aliases";\nimport type { IsAny } from "type-fest";\r\n',
        sourceText: invalidFixtureCode,
        target: '} from "type-aliases";\r\n',
    }),
    target: "IfAny<",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "IsEmptyObject<",
    sourceText: replaceOrThrow({
        replacement:
            'import type { IsAny } from "type-fest";\nimport type { IsEmptyObject } from "type-fest";\r\n',
        sourceText: fixtureFixableOutputCode,
        target: 'import type { IsAny } from "type-fest";\r\n',
    }),
    target: "IfEmptyObject<",
});
const fixtureFixableThirdPassOutputCode = replaceOrThrow({
    replacement: "IsNever<",
    sourceText: replaceOrThrow({
        replacement:
            'import type { IsEmptyObject } from "type-fest";\nimport type { IsNever } from "type-fest";\r\n',
        sourceText: fixtureFixableSecondPassOutputCode,
        target: 'import type { IsEmptyObject } from "type-fest";\r\n',
    }),
    target: "IfNever<",
});
const fixtureFixableFourthPassOutputCode = replaceOrThrow({
    replacement: "IsNull<",
    sourceText: replaceOrThrow({
        replacement:
            'import type { IsNever } from "type-fest";\nimport type { IsNull } from "type-fest";\r\n',
        sourceText: fixtureFixableThirdPassOutputCode,
        target: 'import type { IsNever } from "type-fest";\r\n',
    }),
    target: "IfNull<",
});
const fixtureFixableFifthPassOutputCode = replaceOrThrow({
    replacement: "IsUnknown<",
    sourceText: replaceOrThrow({
        replacement:
            'import type { IsNull } from "type-fest";\nimport type { IsUnknown } from "type-fest";\r\n',
        sourceText: fixtureFixableFourthPassOutputCode,
        target: 'import type { IsNull } from "type-fest";\r\n',
    }),
    target: "IfUnknown<",
});
const inlineFixableInvalidCode = [
    'import type { IfAny } from "type-aliases";',
    'import type { IsAny } from "type-fest";',
    "",
    "type Input = IfAny<string, true, false>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Input = IsAny<string, true, false>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = IfAny<string, true, false>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { IfAny } from "type-aliases";',
    "",
    "type Wrapper<IsAny> = IfAny<string, true, false>;",
].join("\n");

type IfReportDescriptor = Readonly<{
    data?: {
        alias?: string;
        replacement?: string;
    };
    fix?: unknown;
    messageId?: string;
}>;

interface IfRuleMetadataSnapshot {
    create: (context: unknown) => unknown;
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        messages?: Record<string, string>;
    };
    name?: string;
}

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const ifAliasToReplacement = {
    IfAny: "IsAny",
    IfEmptyObject: "IsEmptyObject",
    IfNever: "IsNever",
    IfNull: "IsNull",
    IfUnknown: "IsUnknown",
} as const;

const ifAliasArbitrary = fc.constantFrom(...Object.keys(ifAliasToReplacement));

const conditionalTypeOperandArbitrary = fc.constantFrom(
    "unknown",
    "never",
    "string | number",
    "{ readonly id: string }"
);

const conditionalTypeBranchArbitrary = fc.constantFrom(
    "true",
    "false",
    "'ok'",
    "ReadonlyArray<number>"
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

const parseIfTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from an If* type reference"
    );
};

const loadIfRuleMetadata = async (): Promise<IfRuleMetadataSnapshot> => {
    vi.resetModules();

    const moduleUnderTest = await import("../src/rules/prefer-type-fest-if");

    return moduleUnderTest.default as IfRuleMetadataSnapshot;
};

describe("prefer-type-fest-if metadata", () => {
    it("exports expected metadata", async () => {
        const metadataRule = await loadIfRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-type-fest-if");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest If + Is* utilities over deprecated If* aliases."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-if"
        );
        expect(metadataRule.meta?.messages?.["preferTypeFestIf"]).toBe(
            "`{{alias}}` is deprecated in type-fest. Prefer `If` combined with `{{replacement}}`."
        );
    });
});

describe("prefer-type-fest-if source assertions", () => {
    it("fast-check: If* replacement text remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeReferenceReplacementFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectDirectNamedImportsFromSource: () =>
                        new Set<string>(),
                    collectImportedTypeAliasMatches: () =>
                        new Map(
                            Object.entries(ifAliasToReplacement).map(
                                ([importedName, replacementName]) => [
                                    importedName,
                                    { importedName, replacementName },
                                ]
                            )
                        ),
                    createSafeTypeReferenceReplacementFix:
                        createSafeTypeReferenceReplacementFixMock,
                })
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-if")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    ifAliasArbitrary,
                    conditionalTypeOperandArbitrary,
                    conditionalTypeBranchArbitrary,
                    conditionalTypeBranchArbitrary,
                    (
                        aliasName,
                        conditionTypeText,
                        truthyBranchTypeText,
                        falsyBranchTypeText
                    ) => {
                        createSafeTypeReferenceReplacementFixMock.mockClear();

                        const replacementName =
                            ifAliasToReplacement[
                                aliasName as keyof typeof ifAliasToReplacement
                            ];
                        const code = [
                            "declare const seed: unique symbol;",
                            `type Candidate = ${aliasName}<${conditionTypeText}, ${truthyBranchTypeText}, ${falsyBranchTypeText}>;`,
                            "void seed;",
                        ].join("\n");

                        const { ast, tsReference } =
                            parseIfTypeReferenceFromCode(code);
                        const reportCalls: IfReportDescriptor[] = [];

                        const listeners = undecoratedRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-if.invalid.ts",
                            report: (descriptor: IfReportDescriptor) => {
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
                                replacement: replacementName,
                            },
                            fix: "FIX",
                            messageId: "preferTypeFestIf",
                        });
                        expect(
                            createSafeTypeReferenceReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const calledReplacementName =
                            createSafeTypeReferenceReplacementFixMock.mock
                                .calls[0]?.[1];

                        expect(calledReplacementName).toBe(replacementName);

                        const fixedCode = `${code.slice(0, tsReference.range[0])}${replacementName}<${conditionTypeText}, ${truthyBranchTypeText}, ${falsyBranchTypeText}>${code.slice(tsReference.range[1])}`;

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

ruleTester.run("prefer-type-fest-if", getPluginRule("prefer-type-fest-if"), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfEmptyObject",
                        replacement: "IsEmptyObject",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfNever",
                        replacement: "IsNever",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfNull",
                        replacement: "IsNull",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfUnknown",
                        replacement: "IsUnknown",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture If* alias usage",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
                fixtureFixableThirdPassOutputCode,
                fixtureFixableFourthPassOutputCode,
                fixtureFixableFifthPassOutputCode,
            ],
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline IfAny alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports IfAny alias when replacement identifier is shadowed by a type parameter",
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
            name: "accepts namespace-qualified Is* references",
        },
    ],
});
