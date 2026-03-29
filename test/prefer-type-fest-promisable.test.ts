/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-promisable.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    additionalValidRuleTesterCases,
    inlineFixableInvalidCode,
    inlineFixableOutputCode,
    inlineInvalidWithoutFixCode,
    inlineInvalidWithoutFixOutputCode,
    invalidFixtureName,
    promiseFirstInvalidCode,
    promiseSecondInvalidCode,
    validFixtureName,
} from "./_internal/prefer-type-fest-promisable-cases";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import { getSourceTextForNode } from "./_internal/source-text-for-node";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const invalidFixturePath = typedFixturePath(invalidFixtureName);
const validFixturePath = typedFixturePath(validFixtureName);
const defaultOptions = [
    {
        enforceLegacyAliases: true,
        enforcePromiseUnions: true,
    },
] as const;
const legacyAliasesOnlyOptions = [
    {
        enforceLegacyAliases: true,
        enforcePromiseUnions: false,
    },
] as const;
const promiseUnionsOnlyOptions = [
    {
        enforceLegacyAliases: false,
        enforcePromiseUnions: true,
    },
] as const;

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-promisable", {
    defaultOptions,
    docsDescription:
        "require TypeFest Promisable over legacy MaybePromise aliases and Promise<T> | T unions for sync-or-async contracts.",
    messages: {
        preferPromisable:
            "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
    },
    name: "prefer-type-fest-promisable",
});

describe("prefer-type-fest-promisable source assertions", () => {
    it("tSUnionType visitor reports only strict Promise<T> | T pairs", async () => {
        const code = [
            'import type { Promisable } from "type-fest";',
            "type ShouldReportPromiseFirst = Promise<string> | string;",
            "type ShouldReportPromiseSecond = string | Promise<string>;",
            "type ShouldReportCommentDecorated = Promise</* promise */ string> | /* sync */ string;",
            "type ShouldSkipPromisable = Promise<Promisable<string>> | Promisable<string>;",
            "type ShouldSkipNull = Promise<null> | null;",
            "type ShouldSkipUndefined = Promise<undefined> | undefined;",
            "type ShouldSkipNever = Promise<never> | never;",
        ].join("\n");

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-promisable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(code, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-promisable.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                    getText: (node: unknown): string =>
                        getSourceTextForNode({ code, node }),
                },
            });

            const unionTypeNodes: unknown[] = [];

            for (const statement of parsedResult.ast.body) {
                if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
                    const aliasAnnotation = statement.typeAnnotation;

                    if (aliasAnnotation.type === AST_NODE_TYPES.TSUnionType) {
                        unionTypeNodes.push(aliasAnnotation);
                    }
                }
            }

            expect(unionTypeNodes).toHaveLength(7);

            for (const unionTypeNode of unionTypeNodes) {
                listenerMap.TSUnionType?.(unionTypeNode);
            }

            expect(report).toHaveBeenCalledTimes(3);
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-type-fest-promisable internal listener guards", () => {
    it("handles missing alias fixes and malformed two-member unions", async () => {
        const reportCalls: Readonly<{ messageId?: string }>[] = [];

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
                    collectImportedTypeAliasMatches: () =>
                        new Map([
                            ["MaybePromise", { replacementName: "Promisable" }],
                        ]),
                    createSafeTypeReferenceReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-promisable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "string",
                },
            });

            const referenceListener = getSelectorAwareNodeListener(
                listeners,
                "TSTypeReference"
            );

            referenceListener?.({
                type: "TSTypeReference",
                typeArguments: {
                    params: [{ type: "TSStringKeyword" }],
                },
                typeName: {
                    name: "MaybePromise",
                    type: "Identifier",
                },
            });

            listeners.TSUnionType?.({
                type: "TSUnionType",
                types: [{ type: "TSStringKeyword" }, undefined],
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferPromisable",
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
});

type PromisableReportDescriptor = Readonly<{
    fix?: TSESLint.ReportFixFunction;
    messageId?: string;
}>;

type PromisableRuleModule = Readonly<{
    create: (context: unknown) => {
        TSTypeReference?: (node: TSESTree.TSTypeReference) => void;
    };
}>;

type PromisableTypeReferenceParseResult = Readonly<{
    ast: TSESTree.Program;
    sourceText: string;
    targetTypeReferenceNode: TSESTree.TSTypeReference;
}>;

type TextEdit = Readonly<{
    range: readonly [number, number];
    text: string;
}>;

const promisableRule = getPluginRule(
    "prefer-type-fest-promisable"
) as PromisableRuleModule;

const promisableTypeArgumentArbitrary = fc.constantFrom(
    "string",
    "number",
    "boolean",
    "string | number",
    "Array<string>",
    "ReadonlyArray<number>",
    "Promise<string>",
    "Record<'key', number>",
    "{ readonly id: string }",
    "readonly [string, number]"
);

const isRangeNode = (
    value: unknown
): value is Readonly<{
    range: readonly [number, number];
}> => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const maybeRange = (value as { range?: unknown }).range;

    return (
        Array.isArray(maybeRange) &&
        maybeRange.length === 2 &&
        typeof maybeRange[0] === "number" &&
        typeof maybeRange[1] === "number"
    );
};

const assertIsFixFunction: (
    value: unknown
) => asserts value is TSESLint.ReportFixFunction = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected fixer to be a function");
    }
};

const parsePromisableTypeReferenceFromCode = (
    sourceText: string
): PromisableTypeReferenceParseResult => {
    const parsedResult = parser.parseForESLint(sourceText, {
        ecmaVersion: "latest",
        loc: true,
        range: true,
        sourceType: "module",
    });

    let targetTypeReferenceNode: null | TSESTree.TSTypeReference = null;
    let targetAliasNode: null | TSESTree.TSTypeAliasDeclaration = null;

    for (const statement of parsedResult.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "JobResult"
        ) {
            const aliasAnnotation = statement.typeAnnotation;

            if (
                aliasAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
                aliasAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
                aliasAnnotation.typeName.name === "MaybePromise"
            ) {
                targetAliasNode = statement;
                targetTypeReferenceNode = aliasAnnotation;
                break;
            }
        }
    }

    if (targetTypeReferenceNode === null || targetAliasNode === null) {
        throw new TypeError(
            "Expected a JobResult alias with MaybePromise<T> type reference"
        );
    }

    const targetTypeReferenceNodeWithParent =
        targetTypeReferenceNode as TSESTree.TSTypeReference & {
            parent?: TSESTree.Node;
        };
    targetTypeReferenceNodeWithParent.parent ??= targetAliasNode;

    const targetAliasNodeWithParent =
        targetAliasNode as TSESTree.TSTypeAliasDeclaration & {
            parent?: TSESTree.Node;
        };
    targetAliasNodeWithParent.parent ??= parsedResult.ast;

    return {
        ast: parsedResult.ast,
        sourceText,
        targetTypeReferenceNode,
    };
};

const collectTextEditsFromFix = (
    fix: TSESLint.ReportFixFunction
): readonly TextEdit[] => {
    const textEdits: TextEdit[] = [];

    const fakeFixer = {
        insertTextAfter(target: unknown, text: string): TextEdit {
            if (!isRangeNode(target)) {
                throw new TypeError("insertTextAfter target is missing range");
            }

            const [, end] = target.range;
            const textEdit: TextEdit = {
                range: [end, end],
                text,
            };

            textEdits.push(textEdit);
            return textEdit;
        },
        insertTextBeforeRange(
            range: readonly [number, number],
            text: string
        ): TextEdit {
            const [start, end] = range;
            const textEdit: TextEdit = {
                range: [start, end],
                text,
            };

            textEdits.push(textEdit);
            return textEdit;
        },
        replaceText(target: unknown, text: string): TextEdit {
            if (!isRangeNode(target)) {
                throw new TypeError("replaceText target is missing range");
            }

            const [start, end] = target.range;
            const textEdit: TextEdit = {
                range: [start, end],
                text,
            };

            textEdits.push(textEdit);
            return textEdit;
        },
    } as unknown as TSESLint.RuleFixer;

    const fixResult = fix(fakeFixer);

    expect(fixResult).not.toBeNull();

    return textEdits;
};

const applyTextEdits = (
    sourceText: string,
    textEdits: readonly TextEdit[]
): string => {
    const sortedTextEdits: TextEdit[] = [];

    for (const textEdit of textEdits) {
        let insertIndex = 0;

        while (insertIndex < sortedTextEdits.length) {
            const existingEdit = sortedTextEdits[insertIndex]!;
            const shouldInsertBeforeExisting =
                textEdit.range[0] > existingEdit.range[0] ||
                (textEdit.range[0] === existingEdit.range[0] &&
                    textEdit.range[1] > existingEdit.range[1]);

            if (shouldInsertBeforeExisting) {
                break;
            }

            insertIndex += 1;
        }

        sortedTextEdits.splice(insertIndex, 0, textEdit);
    }

    let nextSourceText = sourceText;

    for (const textEdit of sortedTextEdits) {
        const [start, end] = textEdit.range;
        nextSourceText =
            nextSourceText.slice(0, start) +
            textEdit.text +
            nextSourceText.slice(end);
    }

    return nextSourceText;
};

const runPromisableTypeReferenceReport = (
    sourceText: string
): Readonly<{
    reportDescriptor: PromisableReportDescriptor;
    targetTypeReferenceNode: TSESTree.TSTypeReference;
}> => {
    const parsedCode = parsePromisableTypeReferenceFromCode(sourceText);
    const reportDescriptors: PromisableReportDescriptor[] = [];

    const listenerMap = promisableRule.create({
        filename: "src/example.ts",
        report(descriptor: PromisableReportDescriptor): void {
            reportDescriptors.push(descriptor);
        },
        sourceCode: {
            ast: parsedCode.ast,
            getText(node: unknown): string {
                return getSourceTextForNode({
                    code: parsedCode.sourceText,
                    node,
                });
            },
        },
    });

    const referenceListener = getSelectorAwareNodeListener(
        listenerMap,
        "TSTypeReference"
    );

    referenceListener?.(parsedCode.targetTypeReferenceNode);

    expect(reportDescriptors).toHaveLength(1);

    return {
        reportDescriptor: reportDescriptors[0]!,
        targetTypeReferenceNode: parsedCode.targetTypeReferenceNode,
    };
};

const buildPromisableAliasCode = (
    innerTypeText: string,
    options: Readonly<{
        includeDirective: boolean;
        includePromisableImport: boolean;
        includeValueImport: boolean;
    }>
): string => {
    const codeLines: string[] = [];

    if (options.includeDirective) {
        codeLines.push('"use client";');
    }

    codeLines.push('import type { MaybePromise } from "type-aliases";');

    if (options.includePromisableImport) {
        codeLines.push('import type { Promisable } from "type-fest";');
    }

    if (options.includeValueImport) {
        codeLines.push('import { noop } from "./noop";');
    }

    codeLines.push("", `type JobResult = MaybePromise<${innerTypeText}>;`);

    if (options.includeValueImport) {
        codeLines.push("void noop;");
    }

    return codeLines.join("\n");
};

describe("prefer-type-fest-promisable fast-check fix safety", () => {
    it("fast-check: alias autofix preserves parseability when Promisable import already exists", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                promisableTypeArgumentArbitrary,
                fc.boolean(),
                fc.boolean(),
                (innerTypeText, includeDirective, includeValueImport) => {
                    const sourceText = buildPromisableAliasCode(innerTypeText, {
                        includeDirective,
                        includePromisableImport: true,
                        includeValueImport,
                    });

                    const { reportDescriptor, targetTypeReferenceNode } =
                        runPromisableTypeReferenceReport(sourceText);

                    expect(reportDescriptor.messageId).toBe("preferPromisable");

                    const maybeFix: unknown = reportDescriptor.fix;
                    assertIsFixFunction(maybeFix);
                    const textEdits = collectTextEditsFromFix(maybeFix);

                    expect(textEdits).toHaveLength(1);

                    const fixedCode = applyTextEdits(sourceText, textEdits);
                    const innerTypeTextFromNode =
                        targetTypeReferenceNode.typeArguments?.params[0] ===
                        undefined
                            ? "unknown"
                            : getSourceTextForNode({
                                  code: sourceText,
                                  node: targetTypeReferenceNode.typeArguments
                                      .params[0],
                              });

                    expect(fixedCode).toContain(
                        `type JobResult = Promisable<${innerTypeTextFromNode}>;`
                    );

                    expect(() =>
                        parser.parseForESLint(fixedCode, {
                            ecmaVersion: "latest",
                            loc: true,
                            range: true,
                            sourceType: "module",
                        })
                    ).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: alias autofix inserts missing Promisable import and keeps output parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                promisableTypeArgumentArbitrary,
                fc.boolean(),
                fc.boolean(),
                (innerTypeText, includeDirective, includeValueImport) => {
                    const sourceText = buildPromisableAliasCode(innerTypeText, {
                        includeDirective,
                        includePromisableImport: false,
                        includeValueImport,
                    });

                    const { reportDescriptor, targetTypeReferenceNode } =
                        runPromisableTypeReferenceReport(sourceText);

                    expect(reportDescriptor.messageId).toBe("preferPromisable");

                    const maybeFix: unknown = reportDescriptor.fix;
                    assertIsFixFunction(maybeFix);
                    const textEdits = collectTextEditsFromFix(maybeFix);

                    expect(textEdits.length).toBeGreaterThanOrEqual(2);

                    const fixedCode = applyTextEdits(sourceText, textEdits);
                    const innerTypeTextFromNode =
                        targetTypeReferenceNode.typeArguments?.params[0] ===
                        undefined
                            ? "unknown"
                            : getSourceTextForNode({
                                  code: sourceText,
                                  node: targetTypeReferenceNode.typeArguments
                                      .params[0],
                              });

                    expect(fixedCode).toContain(
                        'import type { Promisable } from "type-fest";'
                    );
                    expect(fixedCode).toContain(
                        `type JobResult = Promisable<${innerTypeTextFromNode}>;`
                    );

                    expect(() =>
                        parser.parseForESLint(fixedCode, {
                            ecmaVersion: "latest",
                            loc: true,
                            range: true,
                            sourceType: "module",
                        })
                    ).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-promisable",
    getPluginRule("prefer-type-fest-promisable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                ],
                filename: invalidFixturePath,
                name: "reports fixture Promise<T> | T unions",
                output: null,
            },
            {
                code: promiseFirstInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: invalidFixturePath,
                name: "reports union with Promise first and value second",
                output: null,
            },
            {
                code: promiseSecondInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: invalidFixturePath,
                name: "reports union with value first and Promise second",
                output: null,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: invalidFixturePath,
                name: "reports and autofixes imported MaybePromise alias",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: invalidFixturePath,
                name: "reports alias usage when Promisable import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
            {
                code: promiseFirstInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: invalidFixturePath,
                name: "reports Promise union when only union enforcement is enabled",
                options: promiseUnionsOnlyOptions,
                output: null,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: invalidFixturePath,
                name: "reports MaybePromise alias when only alias enforcement is enabled",
                options: legacyAliasesOnlyOptions,
                output: inlineFixableOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: validFixturePath,
                name: "accepts fixture-safe patterns",
            },
            {
                code: promiseFirstInvalidCode,
                filename: validFixturePath,
                name: "ignores Promise union when enforcePromiseUnions is disabled",
                options: legacyAliasesOnlyOptions,
            },
            {
                code: inlineFixableInvalidCode,
                filename: validFixturePath,
                name: "ignores MaybePromise alias when enforceLegacyAliases is disabled",
                options: promiseUnionsOnlyOptions,
            },
            ...additionalValidRuleTesterCases.map(({ code, name }) => ({
                code,
                filename: validFixturePath,
                name,
            })),
        ],
    }
);
