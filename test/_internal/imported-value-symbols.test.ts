/**
 * @packageDocumentation
 * Unit tests for imported-value helper discovery and import-aware replacement
 * fixers.
 */
import type { UnknownArray } from "type-fest";

import parser from "@typescript-eslint/parser";
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    collectDirectNamedValueImportsFromSource,
    createMemberToFunctionCallFix,
    createMethodToFunctionCallFix,
    createSafeValueArgumentFunctionCallFix,
    createSafeValueReferenceReplacementFix,
    getSafeLocalNameForImportedValue,
} from "../../src/_internal/imported-value-symbols";
import { fastCheckRunConfig } from "./fast-check";

type ImportInsertionMode =
    | "after-directive"
    | "after-existing-import"
    | "before-first-statement";

type ImportInsertionPrologueCase = Readonly<{
    expectedInsertionMode: ImportInsertionMode;
    prefixLines: readonly string[];
}>;

/** Rule context shape required by value-fixer helper tests. */
type RuleContext = Parameters<
    typeof createMethodToFunctionCallFix
>[0]["context"];

type TargetIdentifierName = "candidate" | "needle" | "result" | "候補値";

type TextEdit = Readonly<{
    end: number;
    start: number;
    text: string;
}>;

/** Build a minimal SourceCode-like fixture from an AST body list. */
const createSourceCode = (
    body: Readonly<UnknownArray>
): Parameters<typeof collectDirectNamedValueImportsFromSource>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<
        typeof collectDirectNamedValueImportsFromSource
    >[0];

/** Create an import specifier test node with configurable import kind. */
const createImportSpecifier = (
    importedName: string,
    localName: string,
    importKind: "type" | "value" = "value"
): unknown => ({
    imported: {
        name: importedName,
        type: "Identifier",
    },
    importKind,
    local: {
        name: localName,
        type: "Identifier",
    },
    type: "ImportSpecifier",
});

/** Create an import declaration test node for a given module source. */
const createImportDeclaration = (
    sourceValue: string,
    specifiers: Readonly<UnknownArray>,
    importKind: "type" | "value" = "value"
): unknown => ({
    importKind,
    source: {
        value: sourceValue,
    },
    specifiers,
    type: "ImportDeclaration",
});

const createImportBindingDefinition = (
    importedName: string,
    localName: string,
    sourceModuleName: string,
    options: Readonly<{
        parentImportKind?: "type" | "value";
        specifierImportKind?: "type" | "value";
        specifierType?: string;
    }> = {}
): unknown => ({
    node: {
        imported: {
            name: importedName,
            type: "Identifier",
        },
        importKind: options.specifierImportKind ?? "value",
        local: {
            name: localName,
            type: "Identifier",
        },
        parent: {
            importKind: options.parentImportKind ?? "value",
            source: {
                value: sourceModuleName,
            },
            type: "ImportDeclaration",
        },
        type: options.specifierType ?? "ImportSpecifier",
    },
    type: "ImportBinding",
});

const getNodeTextFromSyntheticNode = (node: unknown): string => {
    if (
        typeof node === "object" &&
        node !== null &&
        "_text" in node &&
        typeof (node as { _text: unknown })._text === "string"
    ) {
        return (node as { _text: string })._text;
    }

    return "";
};

const getNodeTextFromSourceRange = ({
    node,
    sourceText,
}: Readonly<{
    node: unknown;
    sourceText: string;
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

    return sourceText.slice(nodeRange[0], nodeRange[1]);
};

/** Create a single-scope rule context fixture with supplied bindings. */
const createRuleContextWithVariables = (
    variablesByName: Readonly<ReadonlyMap<string, unknown>>
): RuleContext => {
    const scope = {
        set: new Map(variablesByName),
        upper: null,
    };

    return {
        sourceCode: {
            getScope: () => scope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText: getNodeTextFromSyntheticNode,
        },
    } as unknown as RuleContext;
};

/** Create a nested-scope context fixture for shadowing tests. */
const createRuleContextWithNestedScopes = (
    innerVariablesByName: Readonly<ReadonlyMap<string, unknown>>,
    outerVariablesByName: Readonly<ReadonlyMap<string, unknown>>
): RuleContext => {
    const outerScope = {
        set: new Map(outerVariablesByName),
        upper: null,
    };

    const innerScope = {
        set: new Map(innerVariablesByName),
        upper: outerScope,
    };

    return {
        sourceCode: {
            getScope: () =>
                innerScope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText: getNodeTextFromSyntheticNode,
        },
    } as unknown as RuleContext;
};

/** Create a context fixture that declares one imported value binding. */
const createRuleContext = (
    importedName: string,
    sourceModuleName: string
): RuleContext => {
    const variable = {
        defs: [
            createImportBindingDefinition(
                importedName,
                importedName,
                sourceModuleName
            ),
        ],
    };

    return createRuleContextWithVariables(new Map([[importedName, variable]]));
};

/** Build a map of imported symbol to local alias set. */
const createImportsMap = (
    importedName: string,
    ...localNames: readonly string[]
): ReadonlyMap<string, ReadonlySet<string>> =>
    new Map([[importedName, new Set(localNames)]]);

/** Execute a report-fix callback and collect emitted replacement text values. */
const invokeFix = (
    fix: null | TSESLint.ReportFixFunction
): readonly string[] => {
    const replacements: string[] = [];
    fix?.({
        replaceText: (_node: unknown, text: string) => {
            replacements.push(text);
            return text;
        },
    } as unknown as TSESLint.RuleFixer);

    return replacements;
};

const isTextEdit = (value: unknown): value is TextEdit =>
    typeof value === "object" &&
    value !== null &&
    "end" in value &&
    typeof (value as { end: unknown }).end === "number" &&
    "start" in value &&
    typeof (value as { start: unknown }).start === "number" &&
    "text" in value &&
    typeof (value as { text: unknown }).text === "string";

const isRuleFixIterable = (
    value: unknown
): value is Iterable<TSESLint.RuleFix> =>
    typeof value === "object" &&
    value !== null &&
    Symbol.iterator in value &&
    !Array.isArray(value);

const invokeFixToTextEdits = (
    fix: null | TSESLint.ReportFixFunction
): readonly Readonly<TextEdit>[] => {
    if (!fix) {
        return [];
    }

    const fixes = fix({
        insertTextAfter(target: unknown, text: string): TextEdit {
            if (
                typeof target !== "object" ||
                target === null ||
                !("range" in target)
            ) {
                throw new TypeError("insertTextAfter target is missing range");
            }

            const targetRange = (
                target as Readonly<{ range?: readonly [number, number] }>
            ).range;

            if (targetRange === undefined) {
                throw new TypeError(
                    "insertTextAfter target range is undefined"
                );
            }

            return {
                end: targetRange[1],
                start: targetRange[1],
                text,
            };
        },
        insertTextBeforeRange(
            range: readonly [number, number],
            text: string
        ): TextEdit {
            return {
                end: range[1],
                start: range[0],
                text,
            };
        },
        replaceText(target: unknown, text: string): TextEdit {
            if (
                typeof target !== "object" ||
                target === null ||
                !("range" in target)
            ) {
                throw new TypeError("replaceText target is missing range");
            }

            const targetRange = (
                target as Readonly<{ range?: readonly [number, number] }>
            ).range;

            if (targetRange === undefined) {
                throw new TypeError("replaceText target range is undefined");
            }

            return {
                end: targetRange[1],
                start: targetRange[0],
                text,
            };
        },
    } as unknown as TSESLint.RuleFixer);

    const normalizedFixes: unknown[] = [];

    if (Array.isArray(fixes)) {
        for (const arrayFix of fixes) {
            normalizedFixes.push(arrayFix);
        }
    } else if (isRuleFixIterable(fixes)) {
        for (const iterableFix of fixes) {
            normalizedFixes.push(iterableFix);
        }
    } else if (fixes) {
        normalizedFixes.push(fixes);
    }

    const textEdits: TextEdit[] = [];

    for (const candidateFix of normalizedFixes) {
        if (!isTextEdit(candidateFix)) {
            throw new TypeError(
                "Expected all fix entries to be text edits in this synthetic test harness"
            );
        }

        textEdits.push(candidateFix);
    }

    return textEdits;
};

const applyTextEdits = ({
    sourceText,
    textEdits,
}: Readonly<{
    sourceText: string;
    textEdits: readonly Readonly<TextEdit>[];
}>): string => {
    const sortedDescendingEdits = textEdits.toSorted(
        (left, right) => right.start - left.start
    );

    let updatedSourceText = sourceText;

    for (const textEdit of sortedDescendingEdits) {
        updatedSourceText = `${updatedSourceText.slice(0, textEdit.start)}${textEdit.text}${updatedSourceText.slice(textEdit.end)}`;
    }

    return updatedSourceText;
};

const assertTextEditsDoNotOverlap = (
    textEdits: readonly Readonly<TextEdit>[]
): void => {
    const sortedAscendingEdits = textEdits.toSorted(
        (left, right) => left.start - right.start
    );

    for (let index = 1; index < sortedAscendingEdits.length; index += 1) {
        const previousEdit = sortedAscendingEdits[index - 1];
        const currentEdit = sortedAscendingEdits[index];

        if (previousEdit === undefined || currentEdit === undefined) {
            throw new Error(
                "Expected adjacent text edits while checking overlap"
            );
        }

        expect(previousEdit.end).toBeLessThanOrEqual(currentEdit.start);
    }
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseSingleCallExpressionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    return {
                        ast: parsed.ast,
                        callExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from a call expression"
    );
};

const parseSingleMemberExpressionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    memberExpression: TSESTree.MemberExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.MemberExpression
                ) {
                    return {
                        ast: parsed.ast,
                        memberExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from a member expression"
    );
};

const parseSingleBinaryExpressionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    binaryExpression: TSESTree.BinaryExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.BinaryExpression
                ) {
                    return {
                        ast: parsed.ast,
                        binaryExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from a binary expression"
    );
};

const parseSingleVariableInitializerExpressionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    initializer: TSESTree.Expression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init !== null) {
                    return {
                        ast: parsed.ast,
                        initializer: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable declarator initializer"
    );
};

const parseSingleIdentifierInitializerFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    identifierNode: TSESTree.Identifier;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.Identifier) {
                    return {
                        ast: parsed.ast,
                        identifierNode: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include an identifier initializer"
    );
};

const createRuleContextFromParsedSource = ({
    ast,
    sourceText,
    variablesByName,
}: Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    sourceText: string;
    variablesByName: Readonly<ReadonlyMap<string, unknown>>;
}>): RuleContext => {
    const scope = {
        set: new Map(variablesByName),
        upper: null,
    };

    return {
        sourceCode: {
            ast,
            getScope: () => scope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText(node: unknown): string {
                return getNodeTextFromSourceRange({
                    node,
                    sourceText,
                });
            },
        },
    } as unknown as RuleContext;
};

const countNamedImportSpecifiersInSource = ({
    importedName,
    sourceModuleName,
    sourceText,
}: Readonly<{
    importedName: string;
    sourceModuleName: string;
    sourceText: string;
}>): number => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    let importSpecifierCount = 0;

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.ImportDeclaration &&
            statement.source.value === sourceModuleName
        ) {
            for (const specifier of statement.specifiers) {
                if (
                    specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                    specifier.imported.type === AST_NODE_TYPES.Identifier &&
                    specifier.imported.name === importedName
                ) {
                    importSpecifierCount += 1;
                }
            }
        }
    }

    return importSpecifierCount;
};

const assertIsPresentInitializerShape = ({
    initializer,
    negated,
}: Readonly<{
    initializer: TSESTree.Expression;
    negated: boolean;
}>): void => {
    if (negated) {
        expect(initializer.type).toBe(AST_NODE_TYPES.UnaryExpression);

        if (initializer.type !== AST_NODE_TYPES.UnaryExpression) {
            return;
        }

        expect(initializer.operator).toBe("!");
        expect(initializer.argument.type).toBe(AST_NODE_TYPES.CallExpression);

        if (initializer.argument.type !== AST_NODE_TYPES.CallExpression) {
            return;
        }

        expect(initializer.argument.callee.type).toBe(
            AST_NODE_TYPES.Identifier
        );

        if (initializer.argument.callee.type === AST_NODE_TYPES.Identifier) {
            expect(initializer.argument.callee.name).toBe("isPresent");
        }

        return;
    }

    expect(initializer.type).toBe(AST_NODE_TYPES.CallExpression);

    if (initializer.type !== AST_NODE_TYPES.CallExpression) {
        return;
    }

    expect(initializer.callee.type).toBe(AST_NODE_TYPES.Identifier);

    if (initializer.callee.type === AST_NODE_TYPES.Identifier) {
        expect(initializer.callee.name).toBe("isPresent");
    }
};

const extractIsPresentCallFromInitializer = (
    initializer: Readonly<TSESTree.Expression>
): null | TSESTree.CallExpression => {
    if (
        initializer.type === AST_NODE_TYPES.UnaryExpression &&
        initializer.operator === "!" &&
        initializer.argument.type === AST_NODE_TYPES.CallExpression
    ) {
        return initializer.argument;
    }

    if (initializer.type === AST_NODE_TYPES.CallExpression) {
        return initializer;
    }

    return null;
};

const assertIsPresentImportInsertionOrdering = ({
    fixedCode,
    insertionMode,
}: Readonly<{
    fixedCode: string;
    insertionMode: ImportInsertionMode;
}>): void => {
    assertValueImportInsertionOrdering({
        fixedCode,
        importedName: "isPresent",
        insertionMode,
    });
};

const findValueImportDeclarationStatementIndex = ({
    ast,
    importedName,
}: Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    importedName: string;
}>): null | number => {
    for (let index = 0; index < ast.body.length; index += 1) {
        const statement = ast.body[index];

        if (
            statement?.type === AST_NODE_TYPES.ImportDeclaration &&
            statement.source.value === "ts-extras"
        ) {
            for (const specifier of statement.specifiers) {
                if (
                    specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                    specifier.imported.type === AST_NODE_TYPES.Identifier &&
                    specifier.imported.name === importedName
                ) {
                    return index;
                }
            }
        }
    }

    return null;
};

const findLastDirectiveStatementIndex = (
    ast: Readonly<ReturnType<typeof parser.parseForESLint>["ast"]>
): null | number => {
    let lastDirectiveStatementIndex: null | number = null;

    for (let index = 0; index < ast.body.length; index += 1) {
        const statement = ast.body[index];

        if (
            statement?.type === AST_NODE_TYPES.ExpressionStatement &&
            typeof statement.directive === "string"
        ) {
            lastDirectiveStatementIndex = index;
        }
    }

    return lastDirectiveStatementIndex;
};

const findFirstRuntimeStatementIndex = (
    ast: Readonly<ReturnType<typeof parser.parseForESLint>["ast"]>
): null | number => {
    for (let index = 0; index < ast.body.length; index += 1) {
        const statement = ast.body[index];
        const isDirectiveStatement =
            statement?.type === AST_NODE_TYPES.ExpressionStatement &&
            typeof statement.directive === "string";
        const isImportDeclaration =
            statement?.type === AST_NODE_TYPES.ImportDeclaration;

        if (!isDirectiveStatement && !isImportDeclaration) {
            return index;
        }
    }

    return null;
};

const assertValueImportInsertionOrdering = ({
    fixedCode,
    importedName,
    insertionMode,
}: Readonly<{
    fixedCode: string;
    importedName: string;
    insertionMode: ImportInsertionMode;
}>): void => {
    const ast = parser.parseForESLint(fixedCode, parserOptions).ast;
    const importStatementIndex = findValueImportDeclarationStatementIndex({
        ast,
        importedName,
    });

    expect(importStatementIndex).not.toBeNull();

    if (importStatementIndex === null) {
        throw new Error(
            `Expected ${importedName} import declaration in fixed code`
        );
    }

    switch (insertionMode) {
        case "after-directive": {
            const lastDirectiveStatementIndex =
                findLastDirectiveStatementIndex(ast);

            expect(lastDirectiveStatementIndex).not.toBeNull();

            if (lastDirectiveStatementIndex === null) {
                throw new Error(
                    "Expected directive statement for after-directive insertion mode"
                );
            }

            expect(lastDirectiveStatementIndex).toBeLessThan(
                importStatementIndex
            );

            break;
        }

        case "after-existing-import": {
            const existingImportStatementIndex =
                findValueImportDeclarationStatementIndex({
                    ast,
                    importedName: "identity",
                });

            expect(existingImportStatementIndex).not.toBeNull();

            if (existingImportStatementIndex === null) {
                throw new Error(
                    "Expected identity import declaration for after-existing-import insertion mode"
                );
            }

            expect(existingImportStatementIndex).toBeLessThan(
                importStatementIndex
            );

            break;
        }

        case "before-first-statement": {
            const firstRuntimeStatementIndex =
                findFirstRuntimeStatementIndex(ast);

            expect(firstRuntimeStatementIndex).not.toBeNull();

            if (firstRuntimeStatementIndex === null) {
                throw new Error(
                    "Expected runtime statement for before-first-statement insertion mode"
                );
            }

            expect(importStatementIndex).toBeLessThan(
                firstRuntimeStatementIndex
            );

            break;
        }
    }
};

const methodReceiverExpressionArbitrary = fc.constantFrom(
    "values",
    "getValues()",
    "matrix[index]",
    "values ?? fallbackValues",
    "(left, right)",
    "({ value: 1 })"
);

const methodArgumentExpressionArbitrary = fc.constantFrom(
    "needle",
    "startIndex",
    "undefined",
    "候補値",
    "computeNeedle()",
    "{ key: 'value' }",
    "(left, right)"
);

const binaryNullishOperatorArbitrary = fc.constantFrom(
    "!=",
    "!==",
    "==",
    "==="
);

const binaryComparedExpressionArbitrary = fc.constantFrom(
    "candidate",
    "candidate?.value",
    "getValues()",
    "候補値",
    "(left, right)",
    "({ value: 1 })"
);

const targetIdentifierNameArbitrary = fc.constantFrom<TargetIdentifierName>(
    "candidate",
    "needle",
    "result",
    "候補値"
);

const importInsertionPrologueArbitrary =
    fc.constantFrom<ImportInsertionPrologueCase>(
        {
            expectedInsertionMode: "after-directive",
            prefixLines: ['"use client";', '"use strict";'],
        },
        {
            expectedInsertionMode: "after-existing-import",
            prefixLines: ['import { identity } from "ts-extras";'],
        },
        {
            expectedInsertionMode: "after-existing-import",
            prefixLines: [
                '"use client";',
                'import { identity } from "ts-extras";',
            ],
        },
        {
            expectedInsertionMode: "before-first-statement",
            prefixLines: [],
        }
    );

describe(collectDirectNamedValueImportsFromSource, () => {
    it("ignores type-only import declarations and type-only import specifiers", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration(
                    "ts-extras",
                    [createImportSpecifier("arrayAt", "arrayAt")],
                    "type"
                ),
                createImportDeclaration("ts-extras", [
                    createImportSpecifier("arrayAt", "arrayAt", "type"),
                    createImportSpecifier("arrayIncludes", "arrayIncludes"),
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(1);
        expect(collected.has("arrayAt")).toBeFalsy();

        const includesAliases = collected.get("arrayIncludes");

        expect(includesAliases).toBeDefined();
        expect(includesAliases?.has("arrayIncludes")).toBeTruthy();
    });

    it("ignores imports from different source modules", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("other-lib", [
                    createImportSpecifier("arrayAt", "arrayAt"),
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(0);
    });

    it("collects multiple local aliases for a single imported symbol", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("ts-extras", [
                    createImportSpecifier("arrayAt", "arrayAt"),
                ]),
                createImportDeclaration("ts-extras", [
                    createImportSpecifier("arrayAt", "arrayAtAlias"),
                ]),
            ]),
            "ts-extras"
        );

        const aliases = collected.get("arrayAt");

        expect(aliases?.size).toBe(2);
        expect(aliases?.has("arrayAt")).toBeTruthy();
        expect(aliases?.has("arrayAtAlias")).toBeTruthy();
    });

    it("ignores specifiers whose imported or local nodes are not identifiers", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("ts-extras", [
                    {
                        imported: {
                            type: "Literal",
                            value: "arrayAt",
                        },
                        importKind: "value",
                        local: {
                            name: "arrayAt",
                            type: "Identifier",
                        },
                        type: "ImportSpecifier",
                    },
                    {
                        imported: {
                            name: "arrayAt",
                            type: "Identifier",
                        },
                        importKind: "value",
                        local: {
                            name: "arrayAtAlias",
                            type: "Literal",
                        },
                        type: "ImportSpecifier",
                    },
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(0);
    });

    it("ignores non-ImportSpecifier entries in import declarations", () => {
        expect.hasAssertions();

        const collected = collectDirectNamedValueImportsFromSource(
            createSourceCode([
                createImportDeclaration("ts-extras", [
                    {
                        local: {
                            name: "arrayAt",
                            type: "Identifier",
                        },
                        type: "ImportDefaultSpecifier",
                    },
                ]),
            ]),
            "ts-extras"
        );

        expect(collected.size).toBe(0);
    });
});

describe(getSafeLocalNameForImportedValue, () => {
    it("returns a candidate name when scope binding points to the expected import", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBe("arrayIncludes");
    });

    it("returns null when no alias candidates are registered for the imported name", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: new Map([["arrayIncludes", new Set<string>()]]),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("resolves all candidate aliases from a single scope lookup", () => {
        expect.hasAssertions();

        let getScopeCallCount = 0;

        const context = {
            sourceCode: {
                getScope: () => {
                    getScopeCallCount += 1;

                    return {
                        set: new Map([
                            [
                                "arrayIncludesAlias",
                                {
                                    defs: [
                                        createImportBindingDefinition(
                                            "arrayIncludes",
                                            "arrayIncludesAlias",
                                            "ts-extras"
                                        ),
                                    ],
                                },
                            ],
                        ]),
                        upper: null,
                    } as unknown as Readonly<TSESLint.Scope.Scope>;
                },
                getText: getNodeTextFromSyntheticNode,
            },
        } as unknown as RuleContext;

        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap(
                "arrayIncludes",
                "arrayIncludesShadow",
                "arrayIncludesAlias"
            ),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBe("arrayIncludesAlias");
        expect(getScopeCallCount).toBe(1);
    });

    it("returns null when candidate local name is not bound in the scope chain", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(new Map());
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when candidate variable has no import-binding definitions", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            {
                                type: "Variable",
                            },
                        ],
                    },
                ],
            ])
        );

        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when import-binding definition node is not an import specifier", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            {
                                node: {
                                    type: "Identifier",
                                },
                                type: "ImportBinding",
                            },
                        ],
                    },
                ],
            ])
        );

        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("returns null when import binding resolves to a different source module", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "other-library");
        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBeNull();
    });

    it("resolves candidate aliases from parent scope when not found in current scope", () => {
        expect.hasAssertions();

        const outerVariable = {
            defs: [
                createImportBindingDefinition(
                    "arrayIncludes",
                    "arrayIncludes",
                    "ts-extras"
                ),
            ],
        };

        const context = createRuleContextWithNestedScopes(
            new Map(),
            new Map([["arrayIncludes", outerVariable]])
        );

        const safeName = getSafeLocalNameForImportedValue({
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            referenceNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof getSafeLocalNameForImportedValue
            >[0]["referenceNode"],
            sourceModuleName: "ts-extras",
        });

        expect(safeName).toBe("arrayIncludes");
    });
});

describe(createMethodToFunctionCallFix, () => {
    it("returns null for non-member call expressions", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    name: "includes",
                    type: "Identifier",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });

    it("returns null for optional member access calls", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    object: {
                        _text: "values",
                        type: "Identifier",
                    },
                    optional: true,
                    property: {
                        name: "includes",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: new Map([["arrayIncludes", new Set(["arrayIncludes"])]]),
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });

    it("returns null when method receiver is super", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    object: {
                        type: "Super",
                    },
                    optional: false,
                    property: {
                        name: "includes",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });

    it("builds replacement text with comma-separated receiver and arguments", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const callNode = {
            arguments: [
                {
                    _text: "needle",
                    type: "Identifier",
                },
                {
                    _text: "fromIndex",
                    type: "Identifier",
                },
            ],
            callee: {
                object: {
                    _text: "values",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "includes",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as Parameters<
            typeof createMethodToFunctionCallFix
        >[0]["callNode"];

        const fix = createMethodToFunctionCallFix({
            callNode,
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual([
            "arrayIncludes(values, needle, fromIndex)",
        ]);
    });

    it("builds replacement text without a trailing comma when there are no arguments", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [],
                callee: {
                    object: {
                        _text: "values",
                        type: "Identifier",
                    },
                    optional: false,
                    property: {
                        name: "includes",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual(["arrayIncludes(values)"]);
    });

    it("wraps sequence-expression arguments to preserve argument boundaries", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayIncludes", "ts-extras");
        const fix = createMethodToFunctionCallFix({
            callNode: {
                arguments: [
                    {
                        _text: "left, right",
                        type: "SequenceExpression",
                    },
                ],
                callee: {
                    object: {
                        _text: "values",
                        type: "Identifier",
                    },
                    optional: false,
                    property: {
                        name: "includes",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                optional: false,
                type: "CallExpression",
            } as unknown as Parameters<
                typeof createMethodToFunctionCallFix
            >[0]["callNode"],
            context,
            importedName: "arrayIncludes",
            imports: createImportsMap("arrayIncludes", "arrayIncludes"),
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual([
            "arrayIncludes(values, (left, right))",
        ]);
    });

    it("fast-check: emits parseable replacements across diverse receiver and argument expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                methodReceiverExpressionArbitrary,
                fc.array(methodArgumentExpressionArbitrary, {
                    maxLength: 3,
                }),
                (receiverExpression, argumentExpressions) => {
                    const argumentListText = argumentExpressions.join(", ");
                    const callText =
                        argumentListText.length > 0
                            ? `(${receiverExpression}).includes(${argumentListText})`
                            : `(${receiverExpression}).includes()`;
                    const code = [
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const needle: unknown;",
                        "declare const startIndex: number;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        "declare function computeNeedle(): unknown;",
                        `const result = ${callText};`,
                        "void result;",
                    ].join("\n");

                    const { ast, callExpression } =
                        parseSingleCallExpressionFromCode(code);

                    const variable = {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras"
                            ),
                        ],
                    };
                    const scope = {
                        set: new Map([["arrayIncludes", variable]]),
                        upper: null,
                    };

                    const context = {
                        sourceCode: {
                            ast,
                            getScope: () =>
                                scope as unknown as Readonly<TSESLint.Scope.Scope>,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
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
                            },
                        },
                    } as unknown as RuleContext;

                    const fix = createMethodToFunctionCallFix({
                        callNode: callExpression,
                        context,
                        importedName: "arrayIncludes",
                        imports: createImportsMap(
                            "arrayIncludes",
                            "arrayIncludes"
                        ),
                        sourceModuleName: "ts-extras",
                    });

                    expect(fix).not.toBeNull();

                    const replacementTexts = invokeFix(fix);

                    expect(replacementTexts).toHaveLength(1);

                    const replacementText = replacementTexts[0];

                    expect(replacementText).toBeTruthy();

                    const callRange = callExpression.range;
                    const fixedCode = `${code.slice(0, callRange[0])}${replacementText}${code.slice(callRange[1])}`;

                    const fixedParseResult = parser.parseForESLint(
                        fixedCode,
                        parserOptions
                    );

                    expect(fixedParseResult).toBeTruthy();

                    const { callExpression: fixedCallExpression } =
                        parseSingleCallExpressionFromCode(fixedCode);

                    expect(fixedCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        fixedCallExpression.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(fixedCallExpression.callee.name).toBe(
                            "arrayIncludes"
                        );
                    }

                    expect(fixedCallExpression.arguments).toHaveLength(
                        callExpression.arguments.length + 1
                    );
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: applies import insertion + method-call replacement as parseable combined edits", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                methodReceiverExpressionArbitrary,
                fc.array(methodArgumentExpressionArbitrary, {
                    maxLength: 3,
                }),
                (prologueCase, receiverExpression, argumentExpressions) => {
                    const argumentListText = argumentExpressions.join(", ");
                    const callText =
                        argumentListText.length > 0
                            ? `(${receiverExpression}).includes(${argumentListText})`
                            : `(${receiverExpression}).includes()`;
                    const code = [
                        ...prologueCase.prefixLines,
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const needle: unknown;",
                        "declare const startIndex: number;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        "declare function computeNeedle(): unknown;",
                        `const result = ${callText};`,
                        "void result;",
                    ].join("\n");

                    const { ast, callExpression } =
                        parseSingleCallExpressionFromCode(code);
                    (callExpression as { parent?: TSESTree.Program }).parent =
                        ast;

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map(),
                    });

                    const fix = createMethodToFunctionCallFix({
                        callNode: callExpression,
                        context,
                        importedName: "arrayIncludes",
                        imports: new Map(),
                        sourceModuleName: "ts-extras",
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(textEdits);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        'import { arrayIncludes } from "ts-extras";'
                    );
                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayIncludes",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    assertValueImportInsertionOrdering({
                        fixedCode,
                        importedName: "arrayIncludes",
                        insertionMode: prologueCase.expectedInsertionMode,
                    });

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();

                    const { callExpression: fixedCallExpression } =
                        parseSingleCallExpressionFromCode(fixedCode);

                    expect(fixedCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        fixedCallExpression.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(fixedCallExpression.callee.name).toBe(
                            "arrayIncludes"
                        );
                    }

                    expect(fixedCallExpression.arguments).toHaveLength(
                        argumentExpressions.length + 1
                    );
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate imports when method-call helper is already in scope", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                methodReceiverExpressionArbitrary,
                fc.array(methodArgumentExpressionArbitrary, {
                    maxLength: 3,
                }),
                (prologueCase, receiverExpression, argumentExpressions) => {
                    const argumentListText = argumentExpressions.join(", ");
                    const callText =
                        argumentListText.length > 0
                            ? `(${receiverExpression}).includes(${argumentListText})`
                            : `(${receiverExpression}).includes()`;
                    const code = [
                        ...prologueCase.prefixLines,
                        'import { arrayIncludes } from "ts-extras";',
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const needle: unknown;",
                        "declare const startIndex: number;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        "declare function computeNeedle(): unknown;",
                        `const result = ${callText};`,
                        "void result;",
                    ].join("\n");

                    const { ast, callExpression } =
                        parseSingleCallExpressionFromCode(code);
                    (callExpression as { parent?: TSESTree.Program }).parent =
                        ast;

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map([
                            [
                                "arrayIncludes",
                                {
                                    defs: [
                                        createImportBindingDefinition(
                                            "arrayIncludes",
                                            "arrayIncludes",
                                            "ts-extras"
                                        ),
                                    ],
                                },
                            ],
                        ]),
                    });

                    const fix = createMethodToFunctionCallFix({
                        callNode: callExpression,
                        context,
                        importedName: "arrayIncludes",
                        imports: createImportsMap(
                            "arrayIncludes",
                            "arrayIncludes"
                        ),
                        sourceModuleName: "ts-extras",
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(1);

                    const onlyTextEdit = textEdits[0];
                    if (onlyTextEdit === undefined) {
                        throw new Error(
                            "Expected exactly one replacement edit"
                        );
                    }

                    expect(onlyTextEdit.start).toBeLessThan(onlyTextEdit.end);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayIncludes",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();

                    const { callExpression: fixedCallExpression } =
                        parseSingleCallExpressionFromCode(fixedCode);

                    expect(fixedCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        fixedCallExpression.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(fixedCallExpression.callee.name).toBe(
                            "arrayIncludes"
                        );
                    }

                    expect(fixedCallExpression.arguments).toHaveLength(
                        argumentExpressions.length + 1
                    );
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: second pass remains stable after method-call replacement and does not emit another fix", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                methodReceiverExpressionArbitrary,
                fc.array(methodArgumentExpressionArbitrary, {
                    maxLength: 3,
                }),
                (prologueCase, receiverExpression, argumentExpressions) => {
                    const argumentListText = argumentExpressions.join(", ");
                    const callText =
                        argumentListText.length > 0
                            ? `(${receiverExpression}).includes(${argumentListText})`
                            : `(${receiverExpression}).includes()`;
                    const sourceText = [
                        ...prologueCase.prefixLines,
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const needle: unknown;",
                        "declare const startIndex: number;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        "declare function computeNeedle(): unknown;",
                        `const result = ${callText};`,
                        "void result;",
                    ].join("\n");

                    const {
                        ast: firstAst,
                        callExpression: firstCallExpression,
                    } = parseSingleCallExpressionFromCode(sourceText);
                    (
                        firstCallExpression as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = firstAst;

                    const firstPassContext = createRuleContextFromParsedSource({
                        ast: firstAst,
                        sourceText,
                        variablesByName: new Map(),
                    });

                    const firstPassFix = createMethodToFunctionCallFix({
                        callNode: firstCallExpression,
                        context: firstPassContext,
                        importedName: "arrayIncludes",
                        imports: new Map(),
                        sourceModuleName: "ts-extras",
                    });

                    expect(firstPassFix).toBeTypeOf("function");

                    const firstPassTextEdits =
                        invokeFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    const {
                        ast: secondAst,
                        callExpression: secondCallExpression,
                    } = parseSingleCallExpressionFromCode(firstPassFixedCode);
                    (
                        secondCallExpression as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = secondAst;

                    const secondPassContext = createRuleContextFromParsedSource(
                        {
                            ast: secondAst,
                            sourceText: firstPassFixedCode,
                            variablesByName: new Map([
                                [
                                    "arrayIncludes",
                                    {
                                        defs: [
                                            createImportBindingDefinition(
                                                "arrayIncludes",
                                                "arrayIncludes",
                                                "ts-extras"
                                            ),
                                        ],
                                    },
                                ],
                            ]),
                        }
                    );

                    const secondPassFix = createMethodToFunctionCallFix({
                        callNode: secondCallExpression,
                        context: secondPassContext,
                        importedName: "arrayIncludes",
                        imports: createImportsMap(
                            "arrayIncludes",
                            "arrayIncludes"
                        ),
                        sourceModuleName: "ts-extras",
                    });

                    expect(secondPassFix).toBeNull();

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayIncludes",
                            sourceModuleName: "ts-extras",
                            sourceText: firstPassFixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe(createMemberToFunctionCallFix, () => {
    it("returns null for optional member expressions", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayFirst", "ts-extras");
        const fix = createMemberToFunctionCallFix({
            context,
            importedName: "arrayFirst",
            imports: createImportsMap("arrayFirst", "arrayFirst"),
            memberNode: {
                object: {
                    _text: "values",
                    type: "Identifier",
                },
                optional: true,
                property: {
                    name: "0",
                    type: "Literal",
                    value: 0,
                },
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createMemberToFunctionCallFix
            >[0]["memberNode"],
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });

    it("returns null when member receiver is super", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayFirst", "ts-extras");
        const fix = createMemberToFunctionCallFix({
            context,
            importedName: "arrayFirst",
            imports: createImportsMap("arrayFirst", "arrayFirst"),
            memberNode: {
                computed: true,
                object: {
                    type: "Super",
                },
                optional: false,
                property: {
                    type: "Literal",
                    value: 0,
                },
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createMemberToFunctionCallFix
            >[0]["memberNode"],
            sourceModuleName: "ts-extras",
        });

        expect(fix).toBeNull();
    });

    it("rewrites member expressions to helper calls", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayFirst", "ts-extras");
        const fix = createMemberToFunctionCallFix({
            context,
            importedName: "arrayFirst",
            imports: createImportsMap("arrayFirst", "arrayFirst"),
            memberNode: {
                computed: true,
                object: {
                    _text: "values",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    type: "Literal",
                    value: 0,
                },
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createMemberToFunctionCallFix
            >[0]["memberNode"],
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual(["arrayFirst(values)"]);
    });

    it("wraps sequence-expression receivers to preserve single-argument semantics", () => {
        expect.hasAssertions();

        const context = createRuleContext("arrayFirst", "ts-extras");
        const fix = createMemberToFunctionCallFix({
            context,
            importedName: "arrayFirst",
            imports: createImportsMap("arrayFirst", "arrayFirst"),
            memberNode: {
                computed: true,
                object: {
                    _text: "left, right",
                    type: "SequenceExpression",
                },
                optional: false,
                property: {
                    type: "Literal",
                    value: 0,
                },
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createMemberToFunctionCallFix
            >[0]["memberNode"],
            sourceModuleName: "ts-extras",
        });

        expect(invokeFix(fix)).toStrictEqual(["arrayFirst((left, right))"]);
    });

    it("fast-check: emits parseable replacements across diverse member receivers", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                methodReceiverExpressionArbitrary,
                (receiverExpression) => {
                    const code = [
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        `const result = (${receiverExpression})[0];`,
                        "void result;",
                    ].join("\n");

                    const { ast, memberExpression } =
                        parseSingleMemberExpressionFromCode(code);

                    const variable = {
                        defs: [
                            createImportBindingDefinition(
                                "arrayFirst",
                                "arrayFirst",
                                "ts-extras"
                            ),
                        ],
                    };
                    const scope = {
                        set: new Map([["arrayFirst", variable]]),
                        upper: null,
                    };

                    const context = {
                        sourceCode: {
                            ast,
                            getScope: () =>
                                scope as unknown as Readonly<TSESLint.Scope.Scope>,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
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
                            },
                        },
                    } as unknown as RuleContext;

                    const fix = createMemberToFunctionCallFix({
                        context,
                        importedName: "arrayFirst",
                        imports: createImportsMap("arrayFirst", "arrayFirst"),
                        memberNode: memberExpression,
                        sourceModuleName: "ts-extras",
                    });

                    expect(fix).not.toBeNull();

                    const replacementTexts = invokeFix(fix);

                    expect(replacementTexts).toHaveLength(1);

                    const replacementText = replacementTexts[0];
                    if (replacementText === undefined) {
                        throw new Error(
                            "Expected exactly one replacement text"
                        );
                    }

                    expect(
                        replacementText.startsWith("arrayFirst(")
                    ).toBeTruthy();

                    const memberRange = memberExpression.range;
                    const fixedCode = `${code.slice(0, memberRange[0])}${replacementText}${code.slice(memberRange[1])}`;

                    const fixedParseResult = parser.parseForESLint(
                        fixedCode,
                        parserOptions
                    );

                    expect(fixedParseResult).toBeTruthy();

                    const { callExpression: fixedCallExpression } =
                        parseSingleCallExpressionFromCode(fixedCode);

                    expect(fixedCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        fixedCallExpression.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(fixedCallExpression.callee.name).toBe(
                            "arrayFirst"
                        );
                    }

                    expect(fixedCallExpression.arguments).toHaveLength(1);
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: applies import insertion + member-expression replacement as parseable combined edits", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                methodReceiverExpressionArbitrary,
                (prologueCase, receiverExpression) => {
                    const code = [
                        ...prologueCase.prefixLines,
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        `const result = (${receiverExpression})[0];`,
                        "void result;",
                    ].join("\n");

                    const { ast, memberExpression } =
                        parseSingleMemberExpressionFromCode(code);
                    (memberExpression as { parent?: TSESTree.Program }).parent =
                        ast;

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map(),
                    });

                    const fix = createMemberToFunctionCallFix({
                        context,
                        importedName: "arrayFirst",
                        imports: new Map(),
                        memberNode: memberExpression,
                        sourceModuleName: "ts-extras",
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(textEdits);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        'import { arrayFirst } from "ts-extras";'
                    );
                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayFirst",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    assertValueImportInsertionOrdering({
                        fixedCode,
                        importedName: "arrayFirst",
                        insertionMode: prologueCase.expectedInsertionMode,
                    });

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();

                    const { callExpression: fixedCallExpression } =
                        parseSingleCallExpressionFromCode(fixedCode);

                    expect(fixedCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        fixedCallExpression.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(fixedCallExpression.callee.name).toBe(
                            "arrayFirst"
                        );
                    }

                    expect(fixedCallExpression.arguments).toHaveLength(1);
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate imports when member-rewrite helper is already in scope", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                methodReceiverExpressionArbitrary,
                (prologueCase, receiverExpression) => {
                    const code = [
                        ...prologueCase.prefixLines,
                        'import { arrayFirst } from "ts-extras";',
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        `const result = (${receiverExpression})[0];`,
                        "void result;",
                    ].join("\n");

                    const { ast, memberExpression } =
                        parseSingleMemberExpressionFromCode(code);
                    (memberExpression as { parent?: TSESTree.Program }).parent =
                        ast;

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map([
                            [
                                "arrayFirst",
                                {
                                    defs: [
                                        createImportBindingDefinition(
                                            "arrayFirst",
                                            "arrayFirst",
                                            "ts-extras"
                                        ),
                                    ],
                                },
                            ],
                        ]),
                    });

                    const fix = createMemberToFunctionCallFix({
                        context,
                        importedName: "arrayFirst",
                        imports: createImportsMap("arrayFirst", "arrayFirst"),
                        memberNode: memberExpression,
                        sourceModuleName: "ts-extras",
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(1);

                    const onlyTextEdit = textEdits[0];
                    if (onlyTextEdit === undefined) {
                        throw new Error(
                            "Expected exactly one replacement edit"
                        );
                    }

                    expect(onlyTextEdit.start).toBeLessThan(onlyTextEdit.end);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayFirst",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();

                    const { callExpression: fixedCallExpression } =
                        parseSingleCallExpressionFromCode(fixedCode);

                    expect(fixedCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        fixedCallExpression.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(fixedCallExpression.callee.name).toBe(
                            "arrayFirst"
                        );
                    }

                    expect(fixedCallExpression.arguments).toHaveLength(1);
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: second pass remains stable after member-expression replacement and does not add duplicate imports", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                methodReceiverExpressionArbitrary,
                (prologueCase, receiverExpression) => {
                    const sourceText = [
                        ...prologueCase.prefixLines,
                        "declare const values: readonly unknown[];",
                        "declare const fallbackValues: readonly unknown[];",
                        "declare const matrix: readonly (readonly unknown[])[];",
                        "declare const index: number;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): readonly unknown[];",
                        `const result = (${receiverExpression})[0];`,
                        "void result;",
                    ].join("\n");

                    const {
                        ast: firstAst,
                        memberExpression: firstMemberExpression,
                    } = parseSingleMemberExpressionFromCode(sourceText);
                    (
                        firstMemberExpression as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = firstAst;

                    const firstPassContext = createRuleContextFromParsedSource({
                        ast: firstAst,
                        sourceText,
                        variablesByName: new Map(),
                    });

                    const firstPassFix = createMemberToFunctionCallFix({
                        context: firstPassContext,
                        importedName: "arrayFirst",
                        imports: new Map(),
                        memberNode: firstMemberExpression,
                        sourceModuleName: "ts-extras",
                    });

                    expect(firstPassFix).toBeTypeOf("function");

                    const firstPassTextEdits =
                        invokeFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    const { initializer: secondInitializer } =
                        parseSingleVariableInitializerExpressionFromCode(
                            firstPassFixedCode
                        );

                    expect(secondInitializer.type).toBe(
                        AST_NODE_TYPES.CallExpression
                    );

                    if (
                        secondInitializer.type !== AST_NODE_TYPES.CallExpression
                    ) {
                        throw new Error(
                            "Expected second-pass initializer to be rewritten to a call expression"
                        );
                    }

                    expect(secondInitializer.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        secondInitializer.callee.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(secondInitializer.callee.name).toBe(
                            "arrayFirst"
                        );
                    }

                    expect(() => {
                        parseSingleMemberExpressionFromCode(firstPassFixedCode);
                    }).toThrow(
                        "Expected generated source text to include a variable initialized from a member expression"
                    );

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayFirst",
                            sourceModuleName: "ts-extras",
                            sourceText: firstPassFixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe(createSafeValueArgumentFunctionCallFix, () => {
    it("returns null when argument text is whitespace-only after trimming", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "   ",
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "candidate",
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("emits negated helper call text when negated is true", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "candidate",
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            negated: true,
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "!candidate",
                type: "UnaryExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["!isPresent(candidate)"]);
    });

    it("wraps sequence-expression arguments to preserve single-argument semantics", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "left, right",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "left, right",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["isPresent((left, right))"]);
    });

    it("keeps already-parenthesized sequence-expression arguments unchanged", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "(left, right)",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "(left, right)",
                type: "SequenceExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["isPresent((left, right))"]);
    });

    it("preserves unicode, emoji, and nerd-font glyphs in argument text", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: '候補?.["emoji_🧪___値"]',
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: '候補?.["emoji_🧪___値"]',
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual([
            'isPresent(候補?.["emoji_🧪___値"])',
        ]);
    });

    it("trims unicode spacing around argument text before replacement", () => {
        expect.hasAssertions();

        const context = createRuleContext("isPresent", "ts-extras");
        const fix = createSafeValueArgumentFunctionCallFix({
            argumentNode: {
                _text: "\u00A0\u2003候補?.name\u00A0",
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["argumentNode"],
            context,
            importedName: "isPresent",
            imports: createImportsMap("isPresent", "isPresent"),
            sourceModuleName: "ts-extras",
            targetNode: {
                _text: "候補?.name",
                type: "MemberExpression",
            } as unknown as Parameters<
                typeof createSafeValueArgumentFunctionCallFix
            >[0]["targetNode"],
        });

        expect(invokeFix(fix)).toStrictEqual(["isPresent(候補?.name)"]);
    });

    it("deduplicates helper import insertion across multiple same-pass replacements", () => {
        expect.hasAssertions();

        const sourceText = [
            '"use strict";',
            "declare const left: unknown;",
            "declare const right: unknown;",
            "const first = left !== undefined;",
            "const second = right !== undefined;",
            "void first;",
            "void second;",
        ].join("\n");

        const { ast } = parser.parseForESLint(sourceText, parserOptions);
        const binaryExpressions: TSESTree.BinaryExpression[] = [];

        for (const statement of ast.body) {
            if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
                for (const declaration of statement.declarations) {
                    if (
                        declaration.init?.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        binaryExpressions.push(declaration.init);
                    }
                }
            }
        }

        expect(binaryExpressions).toHaveLength(2);

        const [firstBinaryExpression, secondBinaryExpression] =
            binaryExpressions;

        expect(firstBinaryExpression).toBeDefined();
        expect(secondBinaryExpression).toBeDefined();

        const firstBinaryExpressionNode = firstBinaryExpression!;
        const secondBinaryExpressionNode = secondBinaryExpression!;

        (firstBinaryExpressionNode as { parent?: TSESTree.Program }).parent =
            ast;
        (secondBinaryExpressionNode as { parent?: TSESTree.Program }).parent =
            ast;

        const context = createRuleContextFromParsedSource({
            ast,
            sourceText,
            variablesByName: new Map(),
        });

        const firstFix = createSafeValueArgumentFunctionCallFix({
            argumentNode: firstBinaryExpressionNode.left,
            context,
            importedName: "isDefined",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: firstBinaryExpressionNode,
        });

        const secondFix = createSafeValueArgumentFunctionCallFix({
            argumentNode: secondBinaryExpressionNode.left,
            context,
            importedName: "isDefined",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: secondBinaryExpressionNode,
        });

        expect(firstFix).toBeTypeOf("function");
        expect(secondFix).toBeTypeOf("function");

        const firstTextEdits = invokeFixToTextEdits(firstFix);
        const secondTextEdits = invokeFixToTextEdits(secondFix);

        expect(firstTextEdits).toHaveLength(2);
        expect(secondTextEdits).toHaveLength(0);

        const mergedTextEdits = [...firstTextEdits, ...secondTextEdits];
        assertTextEditsDoNotOverlap(mergedTextEdits);

        const fixedCode = applyTextEdits({
            sourceText,
            textEdits: mergedTextEdits,
        });

        expect(fixedCode).toContain("const first = isDefined(left);");
        expect(fixedCode).toContain("const second = right !== undefined;");

        expect(
            countNamedImportSpecifiersInSource({
                importedName: "isDefined",
                sourceModuleName: "ts-extras",
                sourceText: fixedCode,
            })
        ).toBe(1);

        expect(() => {
            parser.parseForESLint(fixedCode, parserOptions);
        }).not.toThrow();
    });

    it("keeps suggestion-intent fixes self-contained with helper import insertion", () => {
        expect.hasAssertions();

        const sourceText = [
            '"use strict";',
            "declare const left: unknown;",
            "declare const right: unknown;",
            "const first = left !== undefined;",
            "const second = right !== undefined;",
            "void first;",
            "void second;",
        ].join("\n");

        const { ast } = parser.parseForESLint(sourceText, parserOptions);
        const binaryExpressions: TSESTree.BinaryExpression[] = [];

        for (const statement of ast.body) {
            if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
                for (const declaration of statement.declarations) {
                    if (
                        declaration.init?.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        binaryExpressions.push(declaration.init);
                    }
                }
            }
        }

        expect(binaryExpressions).toHaveLength(2);

        const [firstBinaryExpression, secondBinaryExpression] =
            binaryExpressions;

        expect(firstBinaryExpression).toBeDefined();
        expect(secondBinaryExpression).toBeDefined();

        const firstBinaryExpressionNode = firstBinaryExpression!;
        const secondBinaryExpressionNode = secondBinaryExpression!;

        (firstBinaryExpressionNode as { parent?: TSESTree.Program }).parent =
            ast;
        (secondBinaryExpressionNode as { parent?: TSESTree.Program }).parent =
            ast;

        const context = createRuleContextFromParsedSource({
            ast,
            sourceText,
            variablesByName: new Map(),
        });

        const firstSuggestionFix = createSafeValueArgumentFunctionCallFix({
            argumentNode: firstBinaryExpressionNode.left,
            context,
            importedName: "isDefined",
            imports: new Map(),
            reportFixIntent: "suggestion",
            sourceModuleName: "ts-extras",
            targetNode: firstBinaryExpressionNode,
        });

        const secondSuggestionFix = createSafeValueArgumentFunctionCallFix({
            argumentNode: secondBinaryExpressionNode.left,
            context,
            importedName: "isDefined",
            imports: new Map(),
            reportFixIntent: "suggestion",
            sourceModuleName: "ts-extras",
            targetNode: secondBinaryExpressionNode,
        });

        expect(firstSuggestionFix).toBeTypeOf("function");
        expect(secondSuggestionFix).toBeTypeOf("function");

        const firstSuggestionTextEdits =
            invokeFixToTextEdits(firstSuggestionFix);
        const secondSuggestionTextEdits =
            invokeFixToTextEdits(secondSuggestionFix);

        expect(firstSuggestionTextEdits).toHaveLength(2);
        expect(secondSuggestionTextEdits).toHaveLength(2);

        const firstSuggestionAppliedCode = applyTextEdits({
            sourceText,
            textEdits: firstSuggestionTextEdits,
        });
        const secondSuggestionAppliedCode = applyTextEdits({
            sourceText,
            textEdits: secondSuggestionTextEdits,
        });

        expect(firstSuggestionAppliedCode).toContain(
            "const first = isDefined(left);"
        );
        expect(secondSuggestionAppliedCode).toContain(
            "const second = isDefined(right);"
        );

        expect(
            countNamedImportSpecifiersInSource({
                importedName: "isDefined",
                sourceModuleName: "ts-extras",
                sourceText: firstSuggestionAppliedCode,
            })
        ).toBe(1);
        expect(
            countNamedImportSpecifiersInSource({
                importedName: "isDefined",
                sourceModuleName: "ts-extras",
                sourceText: secondSuggestionAppliedCode,
            })
        ).toBe(1);

        expect(() => {
            parser.parseForESLint(firstSuggestionAppliedCode, parserOptions);
            parser.parseForESLint(secondSuggestionAppliedCode, parserOptions);
        }).not.toThrow();
    });

    it("fast-check: emits parseable replacements across argument and negation variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                binaryComparedExpressionArbitrary,
                binaryNullishOperatorArbitrary,
                fc.boolean(),
                (comparedExpression, operator, negated) => {
                    const code = [
                        "declare const candidate: unknown;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): unknown;",
                        `const check = ${comparedExpression} ${operator} null;`,
                        "void check;",
                    ].join("\n");

                    const { ast, binaryExpression } =
                        parseSingleBinaryExpressionFromCode(code);

                    const comparedNode = binaryExpression.left;
                    if (
                        comparedNode.type === AST_NODE_TYPES.PrivateIdentifier
                    ) {
                        throw new Error(
                            "Expected compared node to be a standard expression"
                        );
                    }

                    const variable = {
                        defs: [
                            createImportBindingDefinition(
                                "isPresent",
                                "isPresent",
                                "ts-extras"
                            ),
                        ],
                    };
                    const scope = {
                        set: new Map([["isPresent", variable]]),
                        upper: null,
                    };

                    const context = {
                        sourceCode: {
                            ast,
                            getScope: () =>
                                scope as unknown as Readonly<TSESLint.Scope.Scope>,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
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
                            },
                        },
                    } as unknown as RuleContext;

                    const fix = createSafeValueArgumentFunctionCallFix({
                        argumentNode: comparedNode,
                        context,
                        importedName: "isPresent",
                        imports: createImportsMap("isPresent", "isPresent"),
                        negated,
                        sourceModuleName: "ts-extras",
                        targetNode: binaryExpression,
                    });

                    expect(fix).not.toBeNull();

                    const replacementTexts = invokeFix(fix);

                    expect(replacementTexts).toHaveLength(1);

                    const replacementText = replacementTexts[0];
                    if (replacementText === undefined) {
                        throw new Error(
                            "Expected exactly one replacement text"
                        );
                    }
                    const expectedPrefix = negated
                        ? "!isPresent("
                        : "isPresent(";

                    expect(
                        replacementText.startsWith(expectedPrefix)
                    ).toBeTruthy();

                    const binaryRange = binaryExpression.range;
                    const fixedCode = `${code.slice(0, binaryRange[0])}${replacementText}${code.slice(binaryRange[1])}`;

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: applies import insertion + argument-call replacement as parseable combined edits", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                binaryComparedExpressionArbitrary,
                binaryNullishOperatorArbitrary,
                fc.boolean(),
                (prologueCase, comparedExpression, operator, negated) => {
                    const code = [
                        ...prologueCase.prefixLines,
                        "declare const candidate: unknown;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): unknown;",
                        `const check = ${comparedExpression} ${operator} null;`,
                        "void check;",
                    ].join("\n");

                    const { ast, binaryExpression } =
                        parseSingleBinaryExpressionFromCode(code);
                    (binaryExpression as { parent?: TSESTree.Program }).parent =
                        ast;

                    const comparedNode = binaryExpression.left;
                    if (
                        comparedNode.type === AST_NODE_TYPES.PrivateIdentifier
                    ) {
                        throw new Error(
                            "Expected compared node to be a standard expression"
                        );
                    }

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map(),
                    });

                    const fix = createSafeValueArgumentFunctionCallFix({
                        argumentNode: comparedNode,
                        context,
                        importedName: "isPresent",
                        imports: new Map(),
                        negated,
                        sourceModuleName: "ts-extras",
                        targetNode: binaryExpression,
                    });

                    expect(fix).not.toBeNull();

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(textEdits);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        'import { isPresent } from "ts-extras";'
                    );
                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();

                    const { initializer } =
                        parseSingleVariableInitializerExpressionFromCode(
                            fixedCode
                        );

                    assertIsPresentInitializerShape({
                        initializer,
                        negated,
                    });

                    assertIsPresentImportInsertionOrdering({
                        fixedCode,
                        insertionMode: prologueCase.expectedInsertionMode,
                    });
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate imports when argument-call helper is already in scope", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                binaryComparedExpressionArbitrary,
                binaryNullishOperatorArbitrary,
                fc.boolean(),
                (prologueCase, comparedExpression, operator, negated) => {
                    const code = [
                        ...prologueCase.prefixLines,
                        'import { isPresent } from "ts-extras";',
                        "declare const candidate: unknown;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): unknown;",
                        `const check = ${comparedExpression} ${operator} null;`,
                        "void check;",
                    ].join("\n");

                    const { ast, binaryExpression } =
                        parseSingleBinaryExpressionFromCode(code);
                    (binaryExpression as { parent?: TSESTree.Program }).parent =
                        ast;

                    const comparedNode = binaryExpression.left;
                    if (
                        comparedNode.type === AST_NODE_TYPES.PrivateIdentifier
                    ) {
                        throw new Error(
                            "Expected compared node to be a standard expression"
                        );
                    }

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map([
                            [
                                "isPresent",
                                {
                                    defs: [
                                        createImportBindingDefinition(
                                            "isPresent",
                                            "isPresent",
                                            "ts-extras"
                                        ),
                                    ],
                                },
                            ],
                        ]),
                    });

                    const fix = createSafeValueArgumentFunctionCallFix({
                        argumentNode: comparedNode,
                        context,
                        importedName: "isPresent",
                        imports: createImportsMap("isPresent", "isPresent"),
                        negated,
                        sourceModuleName: "ts-extras",
                        targetNode: binaryExpression,
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(1);

                    const onlyTextEdit = textEdits[0];
                    if (onlyTextEdit === undefined) {
                        throw new Error(
                            "Expected exactly one replacement edit"
                        );
                    }

                    expect(onlyTextEdit.start).toBeLessThan(onlyTextEdit.end);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();

                    const { initializer } =
                        parseSingleVariableInitializerExpressionFromCode(
                            fixedCode
                        );

                    assertIsPresentInitializerShape({
                        initializer,
                        negated,
                    });
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: second pass remains stable after argument-call replacement and does not add duplicate imports", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                binaryComparedExpressionArbitrary,
                binaryNullishOperatorArbitrary,
                fc.boolean(),
                (prologueCase, comparedExpression, operator, negated) => {
                    const sourceText = [
                        ...prologueCase.prefixLines,
                        "declare const candidate: unknown;",
                        "declare const left: unknown;",
                        "declare const right: unknown;",
                        "declare const 候補値: unknown;",
                        "declare function getValues(): unknown;",
                        `const check = ${comparedExpression} ${operator} null;`,
                        "void check;",
                    ].join("\n");

                    const {
                        ast: firstAst,
                        binaryExpression: firstBinaryExpression,
                    } = parseSingleBinaryExpressionFromCode(sourceText);
                    (
                        firstBinaryExpression as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = firstAst;

                    const firstComparedNode = firstBinaryExpression.left;
                    if (
                        firstComparedNode.type ===
                        AST_NODE_TYPES.PrivateIdentifier
                    ) {
                        throw new Error(
                            "Expected compared node to be a standard expression"
                        );
                    }

                    const firstPassContext = createRuleContextFromParsedSource({
                        ast: firstAst,
                        sourceText,
                        variablesByName: new Map(),
                    });

                    const firstPassFix = createSafeValueArgumentFunctionCallFix(
                        {
                            argumentNode: firstComparedNode,
                            context: firstPassContext,
                            importedName: "isPresent",
                            imports: new Map(),
                            negated,
                            sourceModuleName: "ts-extras",
                            targetNode: firstBinaryExpression,
                        }
                    );

                    expect(firstPassFix).toBeTypeOf("function");

                    const firstPassTextEdits =
                        invokeFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    const { ast: secondAst, initializer: secondInitializer } =
                        parseSingleVariableInitializerExpressionFromCode(
                            firstPassFixedCode
                        );
                    (
                        secondInitializer as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = secondAst;

                    const secondCallExpression =
                        extractIsPresentCallFromInitializer(secondInitializer);
                    if (secondCallExpression === null) {
                        throw new Error(
                            "Expected second-pass initializer to contain an isPresent call"
                        );
                    }

                    const secondArgumentNode =
                        secondCallExpression.arguments[0];
                    if (secondArgumentNode === undefined) {
                        throw new Error(
                            "Expected second-pass isPresent call to include one argument"
                        );
                    }

                    const secondPassContext = createRuleContextFromParsedSource(
                        {
                            ast: secondAst,
                            sourceText: firstPassFixedCode,
                            variablesByName: new Map([
                                [
                                    "isPresent",
                                    {
                                        defs: [
                                            createImportBindingDefinition(
                                                "isPresent",
                                                "isPresent",
                                                "ts-extras"
                                            ),
                                        ],
                                    },
                                ],
                            ]),
                        }
                    );

                    const secondPassFix =
                        createSafeValueArgumentFunctionCallFix({
                            argumentNode: secondArgumentNode,
                            context: secondPassContext,
                            importedName: "isPresent",
                            imports: createImportsMap("isPresent", "isPresent"),
                            negated,
                            sourceModuleName: "ts-extras",
                            targetNode: secondInitializer,
                        });

                    expect(secondPassFix).toBeTypeOf("function");

                    const secondPassTextEdits =
                        invokeFixToTextEdits(secondPassFix);

                    expect(secondPassTextEdits).toHaveLength(1);

                    const secondPassFixedCode = applyTextEdits({
                        sourceText: firstPassFixedCode,
                        textEdits: secondPassTextEdits,
                    });

                    expect(secondPassFixedCode).toBe(firstPassFixedCode);

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: secondPassFixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(
                            secondPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe(createSafeValueReferenceReplacementFix, () => {
    it("returns null when the imported identifier is shadowed by a non-import binding", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            {
                                type: "Variable",
                            },
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when the in-scope import binding is type-only", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras",
                                {
                                    parentImportKind: "type",
                                    specifierImportKind: "type",
                                }
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when import specifier importKind is type even with value import declaration", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras",
                                {
                                    parentImportKind: "value",
                                    specifierImportKind: "type",
                                }
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when import binding node is not an import specifier", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludes",
                                "ts-extras",
                                {
                                    specifierType: "ImportDefaultSpecifier",
                                }
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("returns null when in-scope import local name does not match the imported name", () => {
        expect.hasAssertions();

        const context = createRuleContextWithVariables(
            new Map([
                [
                    "arrayIncludes",
                    {
                        defs: [
                            createImportBindingDefinition(
                                "arrayIncludes",
                                "arrayIncludesAlias",
                                "ts-extras"
                            ),
                        ],
                    },
                ],
            ])
        );

        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode: {
                type: "Identifier",
            } as unknown as Parameters<
                typeof createSafeValueReferenceReplacementFix
            >[0]["targetNode"],
        });

        expect(fix).toBeNull();
    });

    it("inserts missing value import after directive prologue", () => {
        expect.hasAssertions();

        const directiveStatement = {
            directive: "use client",
            expression: {
                type: "Literal",
                value: "use client",
            },
            range: [0, 12],
            type: "ExpressionStatement",
        };
        const firstStatement = {
            range: [13, 30],
            type: "VariableDeclaration",
        };
        const programNode = {
            body: [directiveStatement, firstStatement],
            range: [0, 30],
            type: "Program",
        };

        const targetNode = {
            parent: programNode,
            type: "Identifier",
        } as unknown as Parameters<
            typeof createSafeValueReferenceReplacementFix
        >[0]["targetNode"];

        const context = createRuleContextWithVariables(new Map());
        const fix = createSafeValueReferenceReplacementFix({
            context,
            importedName: "arrayIncludes",
            imports: new Map(),
            sourceModuleName: "ts-extras",
            targetNode,
        });

        expect(fix).toBeTypeOf("function");

        const insertAfterCalls: { target: unknown; text: string }[] = [];
        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fakeFixer = {
            insertTextAfter(target: unknown, text: string): string {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange(
                range: readonly [number, number],
                text: string
            ): string {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
            replaceText: (): string => "arrayIncludes",
        } as unknown as TSESLint.RuleFixer;

        fix?.(fakeFixer);

        expect(insertAfterCalls).toStrictEqual([
            {
                target: directiveStatement,
                text: '\nimport { arrayIncludes } from "ts-extras";',
            },
        ]);
        expect(insertBeforeRangeCalls).toStrictEqual([]);
    });

    it("fast-check: applies import insertion + identifier replacement as parseable combined edits", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                targetIdentifierNameArbitrary,
                (prologueCase, targetIdentifierName) => {
                    const code = [
                        ...prologueCase.prefixLines,
                        "declare const candidate: unknown;",
                        "declare const needle: unknown;",
                        "declare const result: unknown;",
                        "declare const 候補値: unknown;",
                        `const check = ${targetIdentifierName};`,
                        "void check;",
                    ].join("\n");

                    const { ast, identifierNode } =
                        parseSingleIdentifierInitializerFromCode(code);
                    (identifierNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map(),
                    });

                    const fix = createSafeValueReferenceReplacementFix({
                        context,
                        importedName: "arrayIncludes",
                        imports: new Map(),
                        sourceModuleName: "ts-extras",
                        targetNode: identifierNode,
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(textEdits);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        'import { arrayIncludes } from "ts-extras";'
                    );
                    expect(fixedCode).toContain("const check = arrayIncludes;");
                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayIncludes",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    assertValueImportInsertionOrdering({
                        fixedCode,
                        importedName: "arrayIncludes",
                        insertionMode: prologueCase.expectedInsertionMode,
                    });

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate imports when value replacement helper is already in scope", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                targetIdentifierNameArbitrary,
                (prologueCase, targetIdentifierName) => {
                    const code = [
                        ...prologueCase.prefixLines,
                        'import { arrayIncludes } from "ts-extras";',
                        "declare const candidate: unknown;",
                        "declare const needle: unknown;",
                        "declare const result: unknown;",
                        "declare const 候補値: unknown;",
                        `const check = ${targetIdentifierName};`,
                        "void check;",
                    ].join("\n");

                    const { ast, identifierNode } =
                        parseSingleIdentifierInitializerFromCode(code);
                    (identifierNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const context = createRuleContextFromParsedSource({
                        ast,
                        sourceText: code,
                        variablesByName: new Map([
                            [
                                "arrayIncludes",
                                {
                                    defs: [
                                        createImportBindingDefinition(
                                            "arrayIncludes",
                                            "arrayIncludes",
                                            "ts-extras"
                                        ),
                                    ],
                                },
                            ],
                        ]),
                    });

                    const fix = createSafeValueReferenceReplacementFix({
                        context,
                        importedName: "arrayIncludes",
                        imports: createImportsMap(
                            "arrayIncludes",
                            "arrayIncludes"
                        ),
                        sourceModuleName: "ts-extras",
                        targetNode: identifierNode,
                    });

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(1);

                    const onlyTextEdit = textEdits[0];
                    if (onlyTextEdit === undefined) {
                        throw new Error(
                            "Expected exactly one replacement edit"
                        );
                    }

                    expect(onlyTextEdit.start).toBeLessThan(onlyTextEdit.end);

                    const fixedCode = applyTextEdits({
                        sourceText: code,
                        textEdits,
                    });

                    expect(fixedCode).toContain("const check = arrayIncludes;");
                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayIncludes",
                            sourceModuleName: "ts-extras",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: second pass remains stable after value replacement and does not add duplicate imports", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                importInsertionPrologueArbitrary,
                targetIdentifierNameArbitrary,
                (prologueCase, targetIdentifierName) => {
                    const sourceText = [
                        ...prologueCase.prefixLines,
                        "declare const candidate: unknown;",
                        "declare const needle: unknown;",
                        "declare const result: unknown;",
                        "declare const 候補値: unknown;",
                        `const check = ${targetIdentifierName};`,
                        "void check;",
                    ].join("\n");

                    const {
                        ast: firstAst,
                        identifierNode: firstIdentifierNode,
                    } = parseSingleIdentifierInitializerFromCode(sourceText);
                    (
                        firstIdentifierNode as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = firstAst;

                    const firstPassContext = createRuleContextFromParsedSource({
                        ast: firstAst,
                        sourceText,
                        variablesByName: new Map(),
                    });

                    const firstPassFix = createSafeValueReferenceReplacementFix(
                        {
                            context: firstPassContext,
                            importedName: "arrayIncludes",
                            imports: new Map(),
                            sourceModuleName: "ts-extras",
                            targetNode: firstIdentifierNode,
                        }
                    );

                    expect(firstPassFix).toBeTypeOf("function");

                    const firstPassTextEdits =
                        invokeFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    const {
                        ast: secondAst,
                        identifierNode: secondIdentifierNode,
                    } =
                        parseSingleIdentifierInitializerFromCode(
                            firstPassFixedCode
                        );
                    (
                        secondIdentifierNode as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = secondAst;

                    const secondPassContext = createRuleContextFromParsedSource(
                        {
                            ast: secondAst,
                            sourceText: firstPassFixedCode,
                            variablesByName: new Map([
                                [
                                    "arrayIncludes",
                                    {
                                        defs: [
                                            createImportBindingDefinition(
                                                "arrayIncludes",
                                                "arrayIncludes",
                                                "ts-extras"
                                            ),
                                        ],
                                    },
                                ],
                            ]),
                        }
                    );

                    const secondPassFix =
                        createSafeValueReferenceReplacementFix({
                            context: secondPassContext,
                            importedName: "arrayIncludes",
                            imports: createImportsMap(
                                "arrayIncludes",
                                "arrayIncludes"
                            ),
                            sourceModuleName: "ts-extras",
                            targetNode: secondIdentifierNode,
                        });

                    expect(secondPassFix).toBeTypeOf("function");

                    const secondPassTextEdits =
                        invokeFixToTextEdits(secondPassFix);

                    expect(secondPassTextEdits).toHaveLength(1);

                    const secondPassOnlyEdit = secondPassTextEdits[0];
                    if (secondPassOnlyEdit === undefined) {
                        throw new Error(
                            "Expected exactly one replacement edit on second pass"
                        );
                    }

                    expect(secondPassOnlyEdit.start).toBeLessThan(
                        secondPassOnlyEdit.end
                    );

                    const secondPassFixedCode = applyTextEdits({
                        sourceText: firstPassFixedCode,
                        textEdits: secondPassTextEdits,
                    });

                    expect(secondPassFixedCode).toBe(firstPassFixedCode);
                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "arrayIncludes",
                            sourceModuleName: "ts-extras",
                            sourceText: secondPassFixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(
                            secondPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});
