/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-as-writable.test` behavior.
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

const validFixtureName = "prefer-ts-extras-as-writable.valid.ts";
const namespaceValidFixtureName =
    "prefer-ts-extras-as-writable.namespace.valid.ts";
const invalidFixtureName = "prefer-ts-extras-as-writable.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const inlineInvalidTypeAssertionCode = [
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = <Writable<ReadonlyRecord>>readonlyRecord;",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineInvalidTypeAssertionOutput = [
    'import type { Writable } from "type-fest";',
    'import { asWritable } from "ts-extras";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = asWritable(readonlyRecord);",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineValidTypeLiteralAssertionCode = [
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as { readonly id: number };",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidNonTypeFestNamespaceCode = [
    'import type * as Aliases from "type-aliases";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as Aliases.Writable<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidDefaultImportAliasCode = [
    'import type WritableDefault from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as WritableDefault<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidNamedImportUsedAsQualifiedNamespaceCode = [
    'import type { Writable as MutableAlias } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as MutableAlias.Writable<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidTypeFestNamespaceNonWritableMemberCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as TypeFest.ReadonlyDeep<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");
const inlineFixableCode = [
    'import { asWritable } from "ts-extras";',
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = readonlyRecord as Writable<ReadonlyRecord>;",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineFixableOutput = [
    'import { asWritable } from "ts-extras";',
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = asWritable(readonlyRecord);",
    "",
    "String(mutableRecord);",
].join("\n");
const fixtureInvalidOutput = [
    'import { asWritable } from "ts-extras";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "    readonly name: string;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableByNamedImport = asWritable(readonlyRecord);",
    "const mutableByAliasedImport = readonlyRecord as MutableAlias<ReadonlyRecord>;",
    "const mutableByNamespace = readonlyRecord as TypeFest.Writable<ReadonlyRecord>;",
    "",
    "String(mutableByNamedImport);",
    "String(mutableByAliasedImport);",
    "String(mutableByNamespace);",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings =
    'import type { Writable, Writable as MutableAlias } from "type-fest";\r\n' +
    'import type * as TypeFest from "type-fest";\n' +
    `${fixtureInvalidOutput}\r\n`;
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
            `Expected prefer-ts-extras-as-writable fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureInvalidSecondPassOutputWithMixedLineEndings = replaceOrThrow({
    replacement: "const mutableByNamespace = asWritable(readonlyRecord);\r\n",
    sourceText: replaceOrThrow({
        replacement:
            "const mutableByAliasedImport = asWritable(readonlyRecord);\r\n",
        sourceText: fixtureInvalidOutputWithMixedLineEndings,
        target: "const mutableByAliasedImport = readonlyRecord as MutableAlias<ReadonlyRecord>;\r\n",
    }),
    target: "const mutableByNamespace = readonlyRecord as TypeFest.Writable<ReadonlyRecord>;\r\n",
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type AssertionSyntax = "angleBracket" | "as";

type WritableExpressionTemplate = Readonly<{
    declarations: readonly string[];
    expressionText: string;
}>;

type WritableExpressionTemplateId =
    | "identifier"
    | "memberExpression"
    | "parenthesizedCall"
    | "plainCall";

type WritableFixFactoryArguments = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
    targetNode: unknown;
}>;

type WritableReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

type WritableTypeReferenceKind = "namedImport" | "namespaceImport";

const assertionSyntaxArbitrary = fc.constantFrom<AssertionSyntax>(
    "as",
    "angleBracket"
);
const writableTypeReferenceKindArbitrary =
    fc.constantFrom<WritableTypeReferenceKind>(
        "namedImport",
        "namespaceImport"
    );
const writableExpressionTemplateIdArbitrary =
    fc.constantFrom<WritableExpressionTemplateId>(
        "identifier",
        "memberExpression",
        "plainCall",
        "parenthesizedCall"
    );

const buildWritableExpressionTemplate = (
    templateId: WritableExpressionTemplateId
): WritableExpressionTemplate => {
    if (templateId === "identifier") {
        return {
            declarations: [],
            expressionText: "readonlyRecord",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "const holder = { readonlyRecord } as const satisfies Readonly<{ readonly readonlyRecord: ReadonlyRecord }>;",
            ],
            expressionText: "holder.readonlyRecord",
        };
    }

    if (templateId === "plainCall") {
        return {
            declarations: [
                "const getReadonlyRecord = (): ReadonlyRecord => readonlyRecord;",
            ],
            expressionText: "getReadonlyRecord()",
        };
    }

    return {
        declarations: [
            "const getReadonlyRecord = (): ReadonlyRecord => readonlyRecord;",
        ],
        expressionText: "(getReadonlyRecord())",
    };
};

const buildWritableAssertionCode = (options: {
    readonly assertionSyntax: AssertionSyntax;
    readonly includeUnicodeBanner: boolean;
    readonly templateId: WritableExpressionTemplateId;
    readonly writableReferenceKind: WritableTypeReferenceKind;
}): string => {
    const expressionTemplate = buildWritableExpressionTemplate(
        options.templateId
    );
    const writableTypeReference =
        options.writableReferenceKind === "namespaceImport"
            ? "TypeFest.Writable<ReadonlyRecord>"
            : "Writable<ReadonlyRecord>";
    const writableImportLine =
        options.writableReferenceKind === "namespaceImport"
            ? 'import type * as TypeFest from "type-fest";'
            : 'import type { Writable } from "type-fest";';
    const assertionText =
        options.assertionSyntax === "as"
            ? `${expressionTemplate.expressionText} as ${writableTypeReference}`
            : `<${writableTypeReference}>${expressionTemplate.expressionText}`;

    const codeLines = [
        writableImportLine,
        "",
        "type ReadonlyRecord = {",
        "    readonly id: number;",
        "};",
        "",
        "declare const readonlyRecord: ReadonlyRecord;",
        ...expressionTemplate.declarations,
        options.includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
            : "",
        `const mutableRecord = ${assertionText};`,
        "",
        "String(mutableRecord);",
    ];

    return codeLines.filter((line) => line.length > 0).join("\n");
};

const getSourceTextForNode = (options: {
    readonly code: string;
    readonly node: unknown;
}): string => {
    if (typeof options.node !== "object" || options.node === null) {
        return "";
    }

    const maybeRange = (
        options.node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (!maybeRange) {
        return "";
    }

    const [start, end] = maybeRange;
    return options.code.slice(start, end);
};

const parseMutableAssertionFromCode = (
    code: string
): Readonly<{
    assertionNode: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion;
    ast: TSESTree.Program;
}> => {
    const parsedProgram = parser.parseForESLint(code, parserOptions)
        .ast as TSESTree.Program;

    for (const statement of parsedProgram.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                const initializer = declaration.init;
                const hasExpectedIdentifier =
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.name === "mutableRecord";
                const hasExpectedAssertionType =
                    initializer?.type === AST_NODE_TYPES.TSAsExpression ||
                    initializer?.type === AST_NODE_TYPES.TSTypeAssertion;

                if (hasExpectedIdentifier && hasExpectedAssertionType) {
                    return {
                        assertionNode: initializer,
                        ast: parsedProgram,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected a mutableRecord Writable assertion in test input"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-as-writable", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras asWritable over Writable<T> style assertions from type-fest.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasAsWritable:
            "Prefer `asWritable(value)` from `ts-extras` over `Writable<...>` assertions.",
    },
    name: "prefer-ts-extras-as-writable",
});

describe("prefer-ts-extras-as-writable internal listener guards", () => {
    it("ignores malformed non-qualified Writable type-name nodes", async () => {
        const reportCalls: unknown[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectNamedImportLocalNamesFromSource: () =>
                        new Set<string>(["Writable"]),
                    collectNamespaceImportLocalNamesFromSource: () =>
                        new Set<string>(["TypeFest"]),
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix: () => null,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-as-writable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSAsExpression?: (node: unknown) => void;
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
                    getText: () => "value",
                },
            });

            listeners.TSAsExpression?.({
                expression: {
                    name: "value",
                    type: "Identifier",
                },
                type: "TSAsExpression",
                typeAnnotation: {
                    type: "TSTypeReference",
                    typeName: {
                        type: "TSImportType",
                    },
                },
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-as-writable fast-check fix safety", () => {
    it("fast-check: Writable assertions report and produce parseable asWritable replacements", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: WritableFixFactoryArguments): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            vi.doMock(
                import("../src/_internal/imported-type-aliases.js"),
                () => ({
                    collectNamedImportLocalNamesFromSource: () =>
                        new Set(["Writable"]),
                    collectNamespaceImportLocalNamesFromSource: () =>
                        new Set(["TypeFest"]),
                })
            );

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueNodeTextReplacementFix:
                        createSafeValueNodeTextReplacementFixMock,
                    getFunctionCallArgumentText: ({
                        argumentNode,
                        sourceCode,
                    }: Readonly<{
                        argumentNode: unknown;
                        sourceCode: Readonly<{
                            getText: (node: unknown) => string;
                        }>;
                    }>): string => sourceCode.getText(argumentNode).trim(),
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-as-writable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSAsExpression?: (node: unknown) => void;
                            TSTypeAssertion?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    assertionSyntaxArbitrary,
                    writableTypeReferenceKindArbitrary,
                    writableExpressionTemplateIdArbitrary,
                    fc.boolean(),
                    (
                        assertionSyntax,
                        writableReferenceKind,
                        templateId,
                        includeUnicodeBanner
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const code = buildWritableAssertionCode({
                            assertionSyntax,
                            includeUnicodeBanner,
                            templateId,
                            writableReferenceKind,
                        });

                        const { assertionNode, ast } =
                            parseMutableAssertionFromCode(code);
                        const reportCalls: WritableReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: WritableReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        if (
                            assertionNode.type === AST_NODE_TYPES.TSAsExpression
                        ) {
                            listeners.TSAsExpression?.(assertionNode);
                        } else {
                            listeners.TSTypeAssertion?.(assertionNode);
                        }

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAsWritable",
                        });

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0] ?? null;
                        const expectedExpressionText = getSourceTextForNode({
                            code,
                            node: assertionNode.expression,
                        });

                        if (fixArguments) {
                            expect(
                                createSafeValueNodeTextReplacementFixMock
                            ).toHaveBeenCalledTimes(1);
                        }

                        const replacementText =
                            fixArguments?.replacementTextFactory(
                                "asWritable"
                            ) ?? `asWritable(${expectedExpressionText})`;

                        expect(replacementText).toBe(
                            `asWritable(${expectedExpressionText})`
                        );

                        const assertionRange = assertionNode.range;

                        expect(assertionRange).toBeDefined();

                        if (assertionRange === undefined) {
                            throw new Error(
                                "Expected assertion node to expose source range"
                            );
                        }

                        const fixedCode =
                            code.slice(0, assertionRange[0]) +
                            replacementText +
                            code.slice(assertionRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrow();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-as-writable",
    getPluginRule("prefer-ts-extras-as-writable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture type-fest Writable assertions",
                output: [
                    fixtureInvalidOutputWithMixedLineEndings,
                    fixtureInvalidSecondPassOutputWithMixedLineEndings,
                ],
            },
            {
                code: inlineInvalidTypeAssertionCode,
                errors: [{ messageId: "preferTsExtrasAsWritable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports angle-bracket Writable assertion",
                output: inlineInvalidTypeAssertionOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasAsWritable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes Writable assertion when asWritable import is in scope",
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
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-specific safe fixture patterns",
            },
            {
                code: inlineValidTypeLiteralAssertionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores assertion to plain type literal",
            },
            {
                code: inlineValidNonTypeFestNamespaceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Writable from non-type-fest namespace",
            },
            {
                code: inlineValidDefaultImportAliasCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic default import aliases from type-fest",
            },
            {
                code: inlineValidNamedImportUsedAsQualifiedNamespaceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores named Writable import used as a fake namespace qualifier",
            },
            {
                code: inlineValidTypeFestNamespaceNonWritableMemberCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores type-fest namespace members that are not Writable",
            },
        ],
    }
);
