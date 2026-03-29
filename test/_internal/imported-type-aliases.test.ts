import type { UnknownArray } from "type-fest";

import parser from "@typescript-eslint/parser";
/**
 * @packageDocumentation
 * Unit tests for imported-type-alias helper discovery and safe replacement
 * fixers.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeReplacementFixPreservingReadonly,
    createSafeTypeNodeTextReplacementFix,
    createSafeTypeNodeTextReplacementFixPreservingReadonly,
    createSafeTypeReferenceReplacementFix,
} from "../../src/_internal/imported-type-aliases";
import { fastCheckRunConfig } from "./fast-check";

/** Imported names covered by alias replacement tests. */
type ImportedName = "Branded" | "Expand" | "HomomorphicOmit" | "Opaque";

/** Canonical replacement names expected for deprecated imported aliases. */
const replacementsByImportedName: Readonly<Record<ImportedName, string>> = {
    Branded: "Tagged",
    Expand: "Simplify",
    HomomorphicOmit: "Except",
    Opaque: "Tagged",
};

/** Build a minimal SourceCode-like test fixture containing only AST body. */
const createSourceCode = (
    body: Readonly<UnknownArray>
): Parameters<typeof collectImportedTypeAliasMatches>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<typeof collectImportedTypeAliasMatches>[0];

/** Convert map output to a plain object for stable assertions. */
const mapToRecord = <TValue>(
    map: Readonly<ReadonlyMap<string, TValue>>
): Readonly<Record<string, TValue>> => Object.fromEntries(map);

/** Create an identifier-based import specifier test node. */
const createIdentifierImportSpecifier = (
    importedName: string,
    localName: string
): unknown => ({
    imported: {
        name: importedName,
        type: "Identifier",
    },
    local: {
        name: localName,
        type: "Identifier",
    },
    type: "ImportSpecifier",
});

/** Create a non-identifier import specifier for negative-path tests. */
const createNonIdentifierImportSpecifier = (localName: string): unknown => ({
    imported: {
        type: "Literal",
        value: "Opaque",
    },
    local: {
        name: localName,
        type: "Identifier",
    },
    type: "ImportSpecifier",
});

/** Create an import declaration targeting the fixture source module. */
const createImportDeclaration = (
    specifiers: Readonly<UnknownArray>
): unknown => ({
    source: {
        value: "type-aliases",
    },
    specifiers,
    type: "ImportDeclaration",
});

const createNamespaceImportSpecifier = (localName: string): unknown => ({
    local: {
        name: localName,
    },
    type: "ImportNamespaceSpecifier",
});

const createTypeReferenceNode = (
    referenceName: string,
    parent?: unknown
): Parameters<typeof createSafeTypeReferenceReplacementFix>[0] =>
    ({
        type: "TSTypeReference",
        typeName: {
            name: referenceName,
            type: "Identifier",
        },
        ...(parent === undefined ? {} : { parent }),
    }) as unknown as Parameters<
        typeof createSafeTypeReferenceReplacementFix
    >[0];

const createQualifiedTypeReferenceNode = (
    leftName: string,
    rightName: string
): Parameters<typeof createSafeTypeReferenceReplacementFix>[0] =>
    ({
        type: "TSTypeReference",
        typeName: {
            left: {
                name: leftName,
                type: "Identifier",
            },
            right: {
                name: rightName,
                type: "Identifier",
            },
            type: "TSQualifiedName",
        },
    }) as unknown as Parameters<
        typeof createSafeTypeReferenceReplacementFix
    >[0];

const collectDirectNamedImportsFromSourceFn: (
    sourceCode: Readonly<Parameters<typeof collectImportedTypeAliasMatches>[0]>,
    expectedSourceValue: string
) => ReadonlySet<string> = collectDirectNamedImportsFromSource;

const collectNamedImportLocalNamesFromSourceFn: (
    sourceCode: Readonly<Parameters<typeof collectImportedTypeAliasMatches>[0]>,
    expectedSourceValue: string,
    expectedImportedName: string
) => ReadonlySet<string> = collectNamedImportLocalNamesFromSource;

const collectNamespaceImportLocalNamesFromSourceFn: (
    sourceCode: Readonly<Parameters<typeof collectImportedTypeAliasMatches>[0]>,
    expectedSourceValue: string
) => ReadonlySet<string> = collectNamespaceImportLocalNamesFromSource;

const createSafeTypeReferenceReplacementFixFn: (
    node: Readonly<Parameters<typeof createSafeTypeReferenceReplacementFix>[0]>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeReferenceReplacementFix> =
    createSafeTypeReferenceReplacementFix;

const createSafeTypeNodeReplacementFixFn: (
    node: Readonly<Parameters<typeof createSafeTypeNodeTextReplacementFix>[0]>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFix> = (
    node,
    replacementName,
    availableReplacementNames
) =>
    createSafeTypeNodeTextReplacementFix(
        node,
        replacementName,
        replacementName,
        availableReplacementNames
    );

const createSafeTypeNodeTextReplacementFixFn: (
    node: Readonly<Parameters<typeof createSafeTypeNodeTextReplacementFix>[0]>,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFix> =
    createSafeTypeNodeTextReplacementFix;

const createSafeTypeNodeReplacementFixPreservingReadonlyFn: (
    node: Readonly<
        Parameters<typeof createSafeTypeNodeReplacementFixPreservingReadonly>[0]
    >,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeReplacementFixPreservingReadonly> =
    createSafeTypeNodeReplacementFixPreservingReadonly;

const createSafeTypeNodeTextReplacementFixPreservingReadonlyFn: (
    node: Readonly<
        Parameters<
            typeof createSafeTypeNodeTextReplacementFixPreservingReadonly
        >[0]
    >,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFixPreservingReadonly> =
    createSafeTypeNodeTextReplacementFixPreservingReadonly;

const createTypeParameterDeclarationWithNames = (
    ...parameterNames: readonly string[]
): {
    params: {
        name: {
            name: string;
        };
    }[];
    type: "TSTypeParameterDeclaration";
} => ({
    params: parameterNames.map((parameterName) => ({
        name: {
            name: parameterName,
        },
    })),
    type: "TSTypeParameterDeclaration",
});

const createTypeNode = (
    parent?: unknown
): Parameters<typeof createSafeTypeNodeTextReplacementFix>[0] =>
    ({
        type: "TSStringKeyword",
        ...(parent === undefined ? {} : { parent }),
    }) as unknown as Parameters<typeof createSafeTypeNodeTextReplacementFix>[0];

const createReadonlyContainerTypeReferenceNode = (
    readonlyContainerTypeName: string
): Parameters<typeof createSafeTypeNodeTextReplacementFix>[0] =>
    ({
        type: "TSTypeReference",
        typeName: {
            name: readonlyContainerTypeName,
            type: "Identifier",
        },
    }) as unknown as Parameters<typeof createSafeTypeNodeTextReplacementFix>[0];

const createReadonlyTypeOperatorNode = (): Parameters<
    typeof createSafeTypeNodeTextReplacementFix
>[0] =>
    ({
        operator: "readonly",
        type: "TSTypeOperator",
        typeAnnotation: {
            elementType: {
                type: "TSUnknownKeyword",
            },
            type: "TSArrayType",
        },
    }) as unknown as Parameters<typeof createSafeTypeNodeTextReplacementFix>[0];

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ReplacementInsertionMode =
    | "after-directive"
    | "after-existing-import"
    | "before-first-statement";

type ReplacementPrologueCase = Readonly<{
    expectedInsertionMode: ReplacementInsertionMode;
    prefixLines: readonly string[];
}>;

type TextEdit = Readonly<{
    end: number;
    start: number;
    text: string;
}>;

const replacementPrologueArbitrary = fc.constantFrom<ReplacementPrologueCase>(
    {
        expectedInsertionMode: "after-directive",
        prefixLines: ['"use client";', '"use strict";'],
    },
    {
        expectedInsertionMode: "after-existing-import",
        prefixLines: ['import type { ExistingAlias } from "type-fest";'],
    },
    {
        expectedInsertionMode: "after-existing-import",
        prefixLines: [
            '"use client";',
            'import type { ExistingAlias } from "type-fest";',
        ],
    },
    {
        expectedInsertionMode: "before-first-statement",
        prefixLines: [],
    }
);

const referenceArgumentTextArbitrary = fc.constantFrom(
    "string",
    "number",
    "ReadonlyArray<string>",
    "{ readonly id: number }",
    "Tagged<'Brand'>"
);

type ReplacementSpec = Readonly<{
    replacementName: string;
    replacementText: string;
}>;

const replacementSpecArbitrary = fc.constantFrom<ReplacementSpec>(
    {
        replacementName: "UnknownArray",
        replacementText: "UnknownArray",
    },
    {
        replacementName: "UnknownMap",
        replacementText: "UnknownMap<string, number>",
    },
    {
        replacementName: "Tagged",
        replacementText: "Tagged<'Brand'>",
    },
    {
        replacementName: "UnknownArray",
        replacementText: "Readonly<UnknownArray>",
    },
    {
        replacementName: "UnknownArray",
        replacementText: "Promise<UnknownArray>",
    }
);

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

const parseSingleTypeReferenceFromTypeAliasCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    referenceNode: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            const annotation = statement.typeAnnotation;

            if (annotation.type === AST_NODE_TYPES.TSTypeReference) {
                return {
                    ast: parsed.ast,
                    referenceNode: annotation,
                };
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias with a TSTypeReference annotation"
    );
};

const parseTypeReferencesFromTypeAliasCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    referenceNodes: readonly TSESTree.TSTypeReference[];
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    const referenceNodes: TSESTree.TSTypeReference[] = [];

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            const annotation = statement.typeAnnotation;
            if (annotation.type === AST_NODE_TYPES.TSTypeReference) {
                referenceNodes.push(annotation);
            }
        }
    }

    if (referenceNodes.length === 0) {
        throw new Error(
            "Expected generated source text to include type aliases with TSTypeReference annotations"
        );
    }

    return {
        ast: parsed.ast,
        referenceNodes,
    };
};

const parseSingleTypeAliasAnnotationNodeFromCode = (
    sourceText: string
): Readonly<{
    annotationNode: TSESTree.TypeNode;
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            return {
                annotationNode: statement.typeAnnotation,
                ast: parsed.ast,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias declaration"
    );
};

const countNamedTypeImportSpecifiersInSource = ({
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

const readonlyContainerAnnotationByName = {
    ReadonlyArray: "ReadonlyArray<Expand<string>>",
    ReadonlyMap: "ReadonlyMap<string, Expand<number>>",
    ReadonlySet: "ReadonlySet<Expand<string>>",
} as const;

const getTypeImportDeclarationText = (replacementName: string): string =>
    `import type { ${replacementName} } from "type-fest";`;

const getReadonlyVariantAnnotationText = ({
    containerTypeName,
    readonlyNodeVariant,
}: Readonly<{
    containerTypeName: string;
    readonlyNodeVariant: string;
}>): string => {
    if (readonlyNodeVariant === "readonly-container") {
        const annotationText =
            readonlyContainerAnnotationByName[
                containerTypeName as keyof typeof readonlyContainerAnnotationByName
            ];

        if (annotationText === undefined) {
            throw new Error(
                `Unsupported readonly container type: ${containerTypeName}`
            );
        }

        return annotationText;
    }

    if (readonlyNodeVariant === "readonly-operator") {
        return "readonly Expand<string>[]";
    }

    return "Expand<string>";
};

const findImportDeclarationStatementIndex = ({
    ast,
    importedName,
    sourceModuleName,
}: Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    importedName: string;
    sourceModuleName: string;
}>): null | number => {
    for (let index = 0; index < ast.body.length; index += 1) {
        const statement = ast.body[index];
        if (
            statement?.type === AST_NODE_TYPES.ImportDeclaration &&
            statement.source.value === sourceModuleName
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

const findTypeAliasStatementIndex = ({
    aliasName,
    ast,
}: Readonly<{
    aliasName: string;
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
}>): null | number => {
    for (let index = 0; index < ast.body.length; index += 1) {
        const statement = ast.body[index];

        if (
            statement?.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === aliasName
        ) {
            return index;
        }
    }

    return null;
};

const assertTypeReplacementImportOrdering = ({
    fixedCode,
    insertionMode,
    replacementName,
}: Readonly<{
    fixedCode: string;
    insertionMode: ReplacementInsertionMode;
    replacementName: string;
}>): void => {
    const ast = parser.parseForESLint(fixedCode, parserOptions).ast;
    const replacementImportStatementIndex = findImportDeclarationStatementIndex(
        {
            ast,
            importedName: replacementName,
            sourceModuleName: "type-fest",
        }
    );

    expect(replacementImportStatementIndex).not.toBeNull();

    if (replacementImportStatementIndex === null) {
        throw new Error(
            `Expected replacement import for ${replacementName} to exist in fixed source`
        );
    }

    switch (insertionMode) {
        case "after-directive": {
            const lastDirectiveStatementIndex =
                findLastDirectiveStatementIndex(ast);

            expect(lastDirectiveStatementIndex).not.toBeNull();

            if (lastDirectiveStatementIndex === null) {
                throw new Error(
                    "Expected directive prologue statement for after-directive insertion mode"
                );
            }

            expect(lastDirectiveStatementIndex).toBeLessThan(
                replacementImportStatementIndex
            );

            break;
        }

        case "after-existing-import": {
            const existingImportStatementIndex =
                findImportDeclarationStatementIndex({
                    ast,
                    importedName: "ExistingAlias",
                    sourceModuleName: "type-fest",
                });

            expect(existingImportStatementIndex).not.toBeNull();

            if (existingImportStatementIndex === null) {
                throw new Error(
                    "Expected ExistingAlias import statement for after-existing-import insertion mode"
                );
            }

            expect(existingImportStatementIndex).toBeLessThan(
                replacementImportStatementIndex
            );

            break;
        }

        case "before-first-statement": {
            const candidateTypeAliasStatementIndex =
                findTypeAliasStatementIndex({
                    aliasName: "Candidate",
                    ast,
                });

            expect(candidateTypeAliasStatementIndex).not.toBeNull();

            if (candidateTypeAliasStatementIndex === null) {
                throw new Error(
                    "Expected Candidate type-alias statement for before-first-statement insertion mode"
                );
            }

            expect(replacementImportStatementIndex).toBeLessThan(
                candidateTypeAliasStatementIndex
            );

            break;
        }
    }
};

const readonlyNodeVariantArbitrary = fc.constantFrom(
    "plain",
    "readonly-container",
    "readonly-operator"
);

const readonlyContainerTypeNameArbitrary = fc.constantFrom(
    "ReadonlyArray",
    "ReadonlyMap",
    "ReadonlySet"
);

const replacementTypeTextArbitrary = fc.constantFrom(
    "UnknownArray",
    "UnknownMap<string, number>",
    "Tagged<'Brand'>",
    "Readonly<UnknownArray>",
    " Readonly<UnknownSet<string>>",
    "Promise<UnknownArray>"
);

describe(collectImportedTypeAliasMatches, () => {
    it("collects canonical named imports that are not renamed", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                createImportDeclaration([
                    createIdentifierImportSpecifier("Opaque", "Opaque"),
                    createIdentifierImportSpecifier("Expand", "Expand"),
                ]),
            ]),
            replacementsByImportedName
        );

        expect(mapToRecord(result)).toStrictEqual({
            Expand: {
                importedName: "Expand",
                replacementName: "Simplify",
                sourceValue: "type-aliases",
            },
            Opaque: {
                importedName: "Opaque",
                replacementName: "Tagged",
                sourceValue: "type-aliases",
            },
        });
    });

    it("ignores renamed imports to enforce canonical names", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                createImportDeclaration([
                    createIdentifierImportSpecifier("Opaque", "OpaqueAlias"),
                    createIdentifierImportSpecifier("Branded", "Branded"),
                ]),
            ]),
            replacementsByImportedName
        );

        expect(mapToRecord(result)).toStrictEqual({
            Branded: {
                importedName: "Branded",
                replacementName: "Tagged",
                sourceValue: "type-aliases",
            },
        });
    });

    it("returns an empty map for files without matching import declarations", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                {
                    type: "ExpressionStatement",
                },
            ]),
            replacementsByImportedName
        );

        expect(result.size).toBe(0);
    });

    it("ignores non-identifier imported specifiers and supports non-string import source values", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                {
                    source: {
                        value: 42,
                    },
                    specifiers: [
                        createNonIdentifierImportSpecifier("Opaque"),
                        createIdentifierImportSpecifier("Opaque", "Opaque"),
                    ],
                    type: "ImportDeclaration",
                },
            ]),
            replacementsByImportedName
        );

        expect(mapToRecord(result)).toStrictEqual({
            Opaque: {
                importedName: "Opaque",
                replacementName: "Tagged",
                sourceValue: "",
            },
        });
    });
});

function collectDirectNamedImportsFromSourceGroup(): void {
    // no-op
}

describe(collectDirectNamedImportsFromSourceGroup, () => {
    it("collects only direct named imports from the selected source", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Simplify", "Simplify"),
                createIdentifierImportSpecifier("Expand", "ExpandAlias"),
            ]),
            {
                source: {
                    value: "other-source",
                },
                specifiers: [
                    createIdentifierImportSpecifier(
                        "ConditionalPick",
                        "ConditionalPick"
                    ),
                ],
                type: "ImportDeclaration",
            },
        ]);

        const namedImports = collectDirectNamedImportsFromSourceFn(
            sourceCode,
            "type-aliases"
        );

        expect(namedImports.has("Simplify")).toBeTruthy();
        expect(namedImports.size).toBe(1);
    });

    it("ignores non-Identifier import specifiers for the selected source", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createNonIdentifierImportSpecifier("Tagged"),
                createIdentifierImportSpecifier("Tagged", "Tagged"),
            ]),
        ]);

        const namedImports = collectDirectNamedImportsFromSourceFn(
            sourceCode,
            "type-aliases"
        );

        expect(namedImports.has("Tagged")).toBeTruthy();
        expect(namedImports.size).toBe(1);
    });
});

function collectNamedImportLocalNamesFromSourceGroup(): void {
    // no-op
}

describe(collectNamedImportLocalNamesFromSourceGroup, () => {
    it("collects local names for matching named imports including aliases", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Writable", "Writable"),
                createIdentifierImportSpecifier("Writable", "MutableAlias"),
                createIdentifierImportSpecifier("Other", "Other"),
            ]),
        ]);

        const localNames = collectNamedImportLocalNamesFromSourceFn(
            sourceCode,
            "type-aliases",
            "Writable"
        );

        expect(localNames).toStrictEqual(new Set(["MutableAlias", "Writable"]));
    });

    it("returns an empty set when no matching named imports exist", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Other", "Other"),
            ]),
        ]);

        const localNames = collectNamedImportLocalNamesFromSourceFn(
            sourceCode,
            "type-aliases",
            "Writable"
        );

        expect(localNames.size).toBe(0);
    });
});

function collectNamespaceImportLocalNamesFromSourceGroup(): void {
    // no-op
}

describe(collectNamespaceImportLocalNamesFromSourceGroup, () => {
    it("collects namespace import local names for the selected source", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createNamespaceImportSpecifier("TypeFest"),
            ]),
            {
                source: {
                    value: "other-source",
                },
                specifiers: [createNamespaceImportSpecifier("OtherNamespace")],
                type: "ImportDeclaration",
            },
        ]);

        const localNames = collectNamespaceImportLocalNamesFromSourceFn(
            sourceCode,
            "type-aliases"
        );

        expect(localNames).toStrictEqual(new Set(["TypeFest"]));
    });
});

function createSafeTypeReferenceReplacementFixGroup(): void {
    // no-op
}

describe(createSafeTypeReferenceReplacementFixGroup, () => {
    it("returns fixer when replacement name is directly imported and not shadowed", () => {
        expect.hasAssertions();

        const node = createTypeReferenceNode("Expand");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });

    it("returns fixer when replacement name is not imported", () => {
        expect.hasAssertions();

        const node = createTypeReferenceNode("Expand");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set<string>()
        );

        expect(fixer).toBeTypeOf("function");
    });

    it("returns null when replacement is shadowed by a type parameter", () => {
        expect.hasAssertions();

        const parameterDeclaration =
            createTypeParameterDeclarationWithNames("Simplify");

        const parent = {
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        };

        const node = createTypeReferenceNode("Expand", parent);
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });

    it("returns null when replacement is shadowed by one of multiple type parameters", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Other",
            "Simplify",
            "Tail"
        );

        const parent = {
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        };

        const node = createTypeReferenceNode("Expand", parent);
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });

    it("returns fixer when type parameters exist but replacement name is not shadowed", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Other",
            "Tail"
        );

        const parent = {
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        };

        const node = createTypeReferenceNode("Expand", parent);
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });

    it("returns fixer when parent traversal encounters a cycle without a matching shadowed name", () => {
        expect.hasAssertions();

        const firstParent = {
            type: "TSTypeAliasDeclaration",
            typeParameters: createTypeParameterDeclarationWithNames("Other"),
        } as unknown as TSESTree.TSTypeAliasDeclaration;
        const secondParent = {
            type: "TSInterfaceDeclaration",
            typeParameters: createTypeParameterDeclarationWithNames("Tail"),
        } as unknown as TSESTree.TSInterfaceDeclaration;

        (
            firstParent as {
                parent?: Readonly<TSESTree.Node>;
            }
        ).parent = secondParent;
        (
            secondParent as {
                parent?: Readonly<TSESTree.Node>;
            }
        ).parent = firstParent;

        const node = createTypeReferenceNode("Expand", firstParent);
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });

    it("returns null for qualified type references", () => {
        expect.hasAssertions();

        const node = createQualifiedTypeReferenceNode("TypeFest", "Opaque");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Tagged",
            new Set(["Tagged"])
        );

        expect(fixer).toBeNull();
    });

    it("fast-check: applies combined import insertion and type-reference replacement with parseable output", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                referenceArgumentTextArbitrary,
                ({ expectedInsertionMode, prefixLines }, argumentText) => {
                    const sourceLines = [
                        ...prefixLines,
                        `type Candidate = Expand<${argumentText}>;`,
                    ];
                    const sourceText = sourceLines.join("\n");

                    const { ast, referenceNode } =
                        parseSingleTypeReferenceFromTypeAliasCode(sourceText);
                    (referenceNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const fix = createSafeTypeReferenceReplacementFixFn(
                        referenceNode,
                        "Simplify",
                        new Set<string>()
                    );

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(textEdits);

                    const fixedCode = applyTextEdits({ sourceText, textEdits });

                    expect(fixedCode).toContain(
                        'import type { Simplify } from "type-fest";'
                    );
                    expect(fixedCode).toContain(
                        `type Candidate = Simplify<${argumentText}>;`
                    );

                    assertTypeReplacementImportOrdering({
                        fixedCode,
                        insertionMode: expectedInsertionMode,
                        replacementName: "Simplify",
                    });

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate replacement imports when replacement type is already in scope", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                referenceArgumentTextArbitrary,
                ({ prefixLines }, argumentText) => {
                    const sourceLines = [
                        ...prefixLines,
                        'import type { Simplify } from "type-fest";',
                        `type Candidate = Expand<${argumentText}>;`,
                    ];
                    const sourceText = sourceLines.join("\n");

                    const { ast, referenceNode } =
                        parseSingleTypeReferenceFromTypeAliasCode(sourceText);
                    (referenceNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const fix = createSafeTypeReferenceReplacementFixFn(
                        referenceNode,
                        "Simplify",
                        new Set(["Simplify"])
                    );

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(1);

                    const onlyTextEdit = textEdits[0];
                    if (onlyTextEdit === undefined) {
                        throw new Error(
                            "Expected a single replacement text edit"
                        );
                    }

                    expect(onlyTextEdit.start).toBeLessThan(onlyTextEdit.end);

                    const fixedCode = applyTextEdits({
                        sourceText,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        `type Candidate = Simplify<${argumentText}>;`
                    );

                    expect(
                        countNamedTypeImportSpecifiersInSource({
                            importedName: "Simplify",
                            sourceModuleName: "type-fest",
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

    it("fast-check: second pass remains stable after type-reference replacement and does not add duplicate imports", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                referenceArgumentTextArbitrary,
                ({ prefixLines }, argumentText) => {
                    const sourceText = [
                        ...prefixLines,
                        `type Candidate = Expand<${argumentText}>;`,
                    ].join("\n");

                    const { ast: firstAst, referenceNode: firstReferenceNode } =
                        parseSingleTypeReferenceFromTypeAliasCode(sourceText);
                    (
                        firstReferenceNode as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = firstAst;

                    const firstPassFix =
                        createSafeTypeReferenceReplacementFixFn(
                            firstReferenceNode,
                            "Simplify",
                            new Set<string>()
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
                        referenceNode: secondReferenceNode,
                    } =
                        parseSingleTypeReferenceFromTypeAliasCode(
                            firstPassFixedCode
                        );
                    (
                        secondReferenceNode as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = secondAst;

                    const secondPassFix =
                        createSafeTypeReferenceReplacementFixFn(
                            secondReferenceNode,
                            "Simplify",
                            new Set(["Simplify"])
                        );

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
                        countNamedTypeImportSpecifiersInSource({
                            importedName: "Simplify",
                            sourceModuleName: "type-fest",
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

    it("dedupes same-pass missing replacement type import insertion across multiple reports", () => {
        expect.hasAssertions();

        const sourceText = [
            '"use strict";',
            "type First = Expand<string>;",
            "type Second = Expand<number>;",
        ].join("\n");

        const { ast, referenceNodes } =
            parseTypeReferencesFromTypeAliasCode(sourceText);

        expect(referenceNodes).toHaveLength(2);

        const [firstReferenceNode, secondReferenceNode] =
            referenceNodes as readonly [
                TSESTree.TSTypeReference,
                TSESTree.TSTypeReference,
            ];

        (firstReferenceNode as { parent?: TSESTree.Program }).parent = ast;
        (secondReferenceNode as { parent?: TSESTree.Program }).parent = ast;

        const firstFix = createSafeTypeReferenceReplacementFixFn(
            firstReferenceNode,
            "Simplify",
            new Set<string>()
        );
        const secondFix = createSafeTypeReferenceReplacementFixFn(
            secondReferenceNode,
            "Simplify",
            new Set<string>()
        );

        expect(firstFix).toBeTypeOf("function");
        expect(secondFix).toBeTypeOf("function");

        const firstTextEdits = invokeFixToTextEdits(firstFix);
        const secondTextEdits = invokeFixToTextEdits(secondFix);

        expect(firstTextEdits).toHaveLength(2);
        expect(secondTextEdits).toHaveLength(0);

        assertTextEditsDoNotOverlap(firstTextEdits);
        assertTextEditsDoNotOverlap(secondTextEdits);

        const fixedCode = applyTextEdits({
            sourceText,
            textEdits: [...firstTextEdits, ...secondTextEdits],
        });

        expect(fixedCode).toContain(
            'import type { Simplify } from "type-fest";'
        );
        expect(fixedCode).toContain("type First = Simplify<string>;");
        expect(fixedCode).toContain("type Second = Expand<number>;");
        expect(
            countNamedTypeImportSpecifiersInSource({
                importedName: "Simplify",
                sourceModuleName: "type-fest",
                sourceText: fixedCode,
            })
        ).toBe(1);

        expect(() => {
            parser.parseForESLint(fixedCode, parserOptions);
        }).not.toThrow();
    });

    it("keeps suggestion-intent type fixes self-contained with replacement import insertion", () => {
        expect.hasAssertions();

        const sourceText = [
            '"use strict";',
            "type First = Expand<string>;",
            "type Second = Expand<number>;",
        ].join("\n");

        const { ast, referenceNodes } =
            parseTypeReferencesFromTypeAliasCode(sourceText);

        expect(referenceNodes).toHaveLength(2);

        const [firstReferenceNode, secondReferenceNode] =
            referenceNodes as readonly [
                TSESTree.TSTypeReference,
                TSESTree.TSTypeReference,
            ];

        (firstReferenceNode as { parent?: TSESTree.Program }).parent = ast;
        (secondReferenceNode as { parent?: TSESTree.Program }).parent = ast;

        const firstSuggestionFix = createSafeTypeReferenceReplacementFix(
            firstReferenceNode,
            "Simplify",
            new Set<string>(),
            "type-fest",
            "suggestion"
        );
        const secondSuggestionFix = createSafeTypeReferenceReplacementFix(
            secondReferenceNode,
            "Simplify",
            new Set<string>(),
            "type-fest",
            "suggestion"
        );

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
            "type First = Simplify<string>;"
        );
        expect(secondSuggestionAppliedCode).toContain(
            "type Second = Simplify<number>;"
        );
        expect(
            countNamedTypeImportSpecifiersInSource({
                importedName: "Simplify",
                sourceModuleName: "type-fest",
                sourceText: firstSuggestionAppliedCode,
            })
        ).toBe(1);
        expect(
            countNamedTypeImportSpecifiersInSource({
                importedName: "Simplify",
                sourceModuleName: "type-fest",
                sourceText: secondSuggestionAppliedCode,
            })
        ).toBe(1);

        expect(() => {
            parser.parseForESLint(firstSuggestionAppliedCode, parserOptions);
            parser.parseForESLint(secondSuggestionAppliedCode, parserOptions);
        }).not.toThrow();
    });
});

function createSafeTypeNodeReplacementFixGroup(): void {
    // no-op
}

describe(createSafeTypeNodeReplacementFixGroup, () => {
    it("returns null when replacement is shadowed for whole-node replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration =
            createTypeParameterDeclarationWithNames("Simplify");
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });

    it("returns fixer when replacement is available and not shadowed for whole-node replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Other",
            "Tail"
        );
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });
});

function createSafeTypeNodeTextReplacementFixGroup(): void {
    // no-op
}

describe(createSafeTypeNodeTextReplacementFixGroup, () => {
    it("returns null when replacement is shadowed for custom text replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration =
            createTypeParameterDeclarationWithNames("Simplify");
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });

    it("returns fixer when replacement is available and not shadowed for custom text replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Head",
            "Tail"
        );
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify<Head>",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });

    it("inserts missing import after directive prologue when no imports are present", () => {
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
            range: [13, 32],
            type: "TSTypeAliasDeclaration",
        };
        const programNode = {
            body: [directiveStatement, firstStatement],
            range: [0, 32],
            type: "Program",
        };

        const node = createTypeNode(programNode);
        const fix = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify<string>",
            new Set<string>()
        );

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
            replaceText: (): string => "Simplify<string>",
        } as unknown as TSESLint.RuleFixer;

        fix?.(fakeFixer);

        expect(insertAfterCalls).toStrictEqual([
            {
                target: directiveStatement,
                text: '\nimport type { Simplify } from "type-fest";',
            },
        ]);
        expect(insertBeforeRangeCalls).toStrictEqual([]);
    });

    it("inserts missing import before first statement when file has no imports or directives", () => {
        expect.hasAssertions();

        const firstStatement = {
            range: [8, 28],
            type: "TSTypeAliasDeclaration",
        };
        const programNode = {
            body: [firstStatement],
            range: [0, 28],
            type: "Program",
        };

        const node = createTypeNode(programNode);
        const fix = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify<string>",
            new Set<string>()
        );

        expect(fix).toBeTypeOf("function");

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fakeFixer = {
            insertTextAfter: (): string => "",
            insertTextBeforeRange(
                range: readonly [number, number],
                text: string
            ): string {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
            replaceText: (): string => "Simplify<string>",
        } as unknown as TSESLint.RuleFixer;

        fix?.(fakeFixer);

        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [8, 8],
                text: 'import type { Simplify } from "type-fest";\n',
            },
        ]);
    });

    it("fast-check: applies combined import insertion + custom type-node replacement with parseable output", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                replacementSpecArbitrary,
                ({ expectedInsertionMode, prefixLines }, replacementSpec) => {
                    const sourceText = [
                        ...prefixLines,
                        "type Candidate = Expand<string>;",
                    ].join("\n");

                    const { annotationNode, ast } =
                        parseSingleTypeAliasAnnotationNodeFromCode(sourceText);
                    (annotationNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const fix = createSafeTypeNodeTextReplacementFixFn(
                        annotationNode,
                        replacementSpec.replacementName,
                        replacementSpec.replacementText,
                        new Set<string>()
                    );

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(textEdits);

                    const fixedCode = applyTextEdits({
                        sourceText,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        getTypeImportDeclarationText(
                            replacementSpec.replacementName
                        )
                    );
                    expect(fixedCode).toContain(
                        `type Candidate = ${replacementSpec.replacementText};`
                    );

                    expect(
                        countNamedTypeImportSpecifiersInSource({
                            importedName: replacementSpec.replacementName,
                            sourceModuleName: "type-fest",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    assertTypeReplacementImportOrdering({
                        fixedCode,
                        insertionMode: expectedInsertionMode,
                        replacementName: replacementSpec.replacementName,
                    });

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate replacement imports for custom type-node replacement when helper import already exists", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                replacementSpecArbitrary,
                ({ prefixLines }, replacementSpec) => {
                    const sourceText = [
                        ...prefixLines,
                        getTypeImportDeclarationText(
                            replacementSpec.replacementName
                        ),
                        "type Candidate = Expand<string>;",
                    ].join("\n");

                    const { annotationNode, ast } =
                        parseSingleTypeAliasAnnotationNodeFromCode(sourceText);
                    (annotationNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const fix = createSafeTypeNodeTextReplacementFixFn(
                        annotationNode,
                        replacementSpec.replacementName,
                        replacementSpec.replacementText,
                        new Set([replacementSpec.replacementName])
                    );

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
                        sourceText,
                        textEdits,
                    });

                    expect(fixedCode).toContain(
                        `type Candidate = ${replacementSpec.replacementText};`
                    );

                    expect(
                        countNamedTypeImportSpecifiersInSource({
                            importedName: replacementSpec.replacementName,
                            sourceModuleName: "type-fest",
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

    it("fast-check: second pass remains stable after custom type-node replacement and does not add duplicate imports", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                replacementSpecArbitrary,
                ({ prefixLines }, replacementSpec) => {
                    const sourceText = [
                        ...prefixLines,
                        "type Candidate = Expand<string>;",
                    ].join("\n");

                    const {
                        annotationNode: firstAnnotationNode,
                        ast: firstAst,
                    } = parseSingleTypeAliasAnnotationNodeFromCode(sourceText);
                    (
                        firstAnnotationNode as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = firstAst;

                    const firstPassFix = createSafeTypeNodeTextReplacementFixFn(
                        firstAnnotationNode,
                        replacementSpec.replacementName,
                        replacementSpec.replacementText,
                        new Set<string>()
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
                        annotationNode: secondAnnotationNode,
                        ast: secondAst,
                    } =
                        parseSingleTypeAliasAnnotationNodeFromCode(
                            firstPassFixedCode
                        );
                    (
                        secondAnnotationNode as {
                            parent?: TSESTree.Program;
                        }
                    ).parent = secondAst;

                    const secondPassFix =
                        createSafeTypeNodeTextReplacementFixFn(
                            secondAnnotationNode,
                            replacementSpec.replacementName,
                            replacementSpec.replacementText,
                            new Set([replacementSpec.replacementName])
                        );

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
                        countNamedTypeImportSpecifiersInSource({
                            importedName: replacementSpec.replacementName,
                            sourceModuleName: "type-fest",
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

function createSafeTypeNodeReplacementFixPreservingReadonlyGroup(): void {
    // no-op
}

describe(createSafeTypeNodeReplacementFixPreservingReadonlyGroup, () => {
    it("wraps replacement text in Readonly<> when the source node is an explicit readonly container reference", () => {
        expect.hasAssertions();

        const node = createReadonlyContainerTypeReferenceNode("ReadonlyMap");
        const fixer = createSafeTypeNodeReplacementFixPreservingReadonlyFn(
            node,
            "UnknownMap",
            new Set(["UnknownMap"])
        );

        expect(fixer).toBeTypeOf("function");

        const replacementTexts: string[] = [];
        const fakeFixer = {
            insertTextAfterRange: (): string => "",
            replaceText: (_targetNode: unknown, text: string): string => {
                replacementTexts.push(text);

                return text;
            },
        };

        const fixOutput = fixer?.(
            fakeFixer as unknown as Parameters<typeof fixer>[0]
        );

        expect(fixOutput).toBe("Readonly<UnknownMap>");
        expect(replacementTexts).toStrictEqual(["Readonly<UnknownMap>"]);
    });

    it("does not add Readonly<> for qualified readonly container references", () => {
        expect.hasAssertions();

        const node = createQualifiedTypeReferenceNode(
            "Collections",
            "ReadonlyMap"
        );
        const fixer = createSafeTypeNodeReplacementFixPreservingReadonlyFn(
            node,
            "UnknownMap",
            new Set(["UnknownMap"])
        );

        expect(fixer).toBeTypeOf("function");

        const replacementTexts: string[] = [];
        const fakeFixer = {
            insertTextAfterRange: (): string => "",
            replaceText: (_targetNode: unknown, text: string): string => {
                replacementTexts.push(text);

                return text;
            },
        };

        const fixOutput = fixer?.(
            fakeFixer as unknown as Parameters<typeof fixer>[0]
        );

        expect(fixOutput).toBe("UnknownMap");
        expect(replacementTexts).toStrictEqual(["UnknownMap"]);
    });
});

function createSafeTypeNodeTextReplacementFixPreservingReadonlyGroup(): void {
    // no-op
}

describe(createSafeTypeNodeTextReplacementFixPreservingReadonlyGroup, () => {
    it("keeps existing Readonly<> wrappers untouched to avoid double wrapping", () => {
        expect.hasAssertions();

        const node = createReadonlyTypeOperatorNode();
        const fixer = createSafeTypeNodeTextReplacementFixPreservingReadonlyFn(
            node,
            "UnknownArray",
            "Readonly<UnknownArray>",
            new Set(["UnknownArray"])
        );

        expect(fixer).toBeTypeOf("function");

        const replacementTexts: string[] = [];
        const fakeFixer = {
            insertTextAfterRange: (): string => "",
            replaceText: (_targetNode: unknown, text: string): string => {
                replacementTexts.push(text);

                return text;
            },
        };

        const fixOutput = fixer?.(
            fakeFixer as unknown as Parameters<typeof fixer>[0]
        );

        expect(fixOutput).toBe("Readonly<UnknownArray>");
        expect(replacementTexts).toStrictEqual(["Readonly<UnknownArray>"]);
    });

    it("fast-check: preserves readonly wrapping semantics while producing parseable replacement text", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                readonlyNodeVariantArbitrary,
                readonlyContainerTypeNameArbitrary,
                replacementTypeTextArbitrary,
                (
                    readonlyNodeVariant,
                    containerTypeName,
                    replacementTypeText
                ) => {
                    let node = createTypeNode();

                    if (readonlyNodeVariant === "readonly-operator") {
                        node = createReadonlyTypeOperatorNode();
                    }

                    if (readonlyNodeVariant === "readonly-container") {
                        node =
                            createReadonlyContainerTypeReferenceNode(
                                containerTypeName
                            );
                    }

                    const fixer =
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyFn(
                            node,
                            "UnknownArray",
                            replacementTypeText,
                            new Set(["UnknownArray"])
                        );

                    expect(fixer).toBeTypeOf("function");

                    const replacementTexts: string[] = [];
                    const fakeFixer = {
                        insertTextAfterRange: (): string => "",
                        replaceText: (
                            _targetNode: unknown,
                            replacementText: string
                        ): string => {
                            replacementTexts.push(replacementText);

                            return replacementText;
                        },
                    };

                    const fixOutput = fixer?.(
                        fakeFixer as unknown as Parameters<typeof fixer>[0]
                    );

                    expect(replacementTexts).toHaveLength(1);
                    expect(fixOutput).toBeTypeOf("string");

                    const replacementOutputText = replacementTexts[0];
                    if (replacementOutputText === undefined) {
                        throw new Error("Expected replacement text output");
                    }

                    const shouldWrapReadonly =
                        readonlyNodeVariant !== "plain" &&
                        !replacementTypeText
                            .trimStart()
                            .startsWith("Readonly<");
                    const expectedReplacementText = shouldWrapReadonly
                        ? `Readonly<${replacementTypeText}>`
                        : replacementTypeText;

                    expect(replacementOutputText).toBe(expectedReplacementText);

                    const fixedCode = `type Candidate = ${replacementOutputText};`;

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: avoids duplicate type imports when preserving readonly semantics with an in-scope replacement import", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                readonlyNodeVariantArbitrary,
                readonlyContainerTypeNameArbitrary,
                replacementSpecArbitrary,
                (
                    prologueCase,
                    readonlyNodeVariant,
                    containerTypeName,
                    replacementSpec
                ) => {
                    const annotationText = getReadonlyVariantAnnotationText({
                        containerTypeName,
                        readonlyNodeVariant,
                    });
                    const sourceText = [
                        ...prologueCase.prefixLines,
                        `import type { ${replacementSpec.replacementName} } from "type-fest";`,
                        `type Candidate = ${annotationText};`,
                    ].join("\n");

                    const { annotationNode, ast } =
                        parseSingleTypeAliasAnnotationNodeFromCode(sourceText);
                    (annotationNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const fix =
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyFn(
                            annotationNode,
                            replacementSpec.replacementName,
                            replacementSpec.replacementText,
                            new Set([replacementSpec.replacementName])
                        );

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(1);

                    const onlyTextEdit = textEdits[0];
                    if (onlyTextEdit === undefined) {
                        throw new Error(
                            "Expected a single replacement text edit"
                        );
                    }

                    expect(onlyTextEdit.start).toBeLessThan(onlyTextEdit.end);

                    const fixedCode = applyTextEdits({
                        sourceText,
                        textEdits,
                    });

                    const shouldWrapReadonly =
                        readonlyNodeVariant !== "plain" &&
                        !replacementSpec.replacementText
                            .trimStart()
                            .startsWith("Readonly<");
                    const expectedReplacementText = shouldWrapReadonly
                        ? `Readonly<${replacementSpec.replacementText}>`
                        : replacementSpec.replacementText;

                    expect(fixedCode).toContain(
                        `type Candidate = ${expectedReplacementText};`
                    );
                    expect(
                        countNamedTypeImportSpecifiersInSource({
                            importedName: replacementSpec.replacementName,
                            sourceModuleName: "type-fest",
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

    it("fast-check: preserves readonly semantics with combined import insertion + node replacement edits", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                replacementPrologueArbitrary,
                readonlyNodeVariantArbitrary,
                readonlyContainerTypeNameArbitrary,
                replacementSpecArbitrary,
                (
                    prologueCase,
                    readonlyNodeVariant,
                    containerTypeName,
                    replacementSpec
                ) => {
                    const annotationText = getReadonlyVariantAnnotationText({
                        containerTypeName,
                        readonlyNodeVariant,
                    });
                    const sourceText = [
                        ...prologueCase.prefixLines,
                        `type Candidate = ${annotationText};`,
                    ].join("\n");

                    const { annotationNode, ast } =
                        parseSingleTypeAliasAnnotationNodeFromCode(sourceText);
                    (annotationNode as { parent?: TSESTree.Program }).parent =
                        ast;

                    const fix =
                        createSafeTypeNodeTextReplacementFixPreservingReadonlyFn(
                            annotationNode,
                            replacementSpec.replacementName,
                            replacementSpec.replacementText,
                            new Set<string>()
                        );

                    expect(fix).toBeTypeOf("function");

                    const textEdits = invokeFixToTextEdits(fix);

                    expect(textEdits).toHaveLength(2);

                    const fixedCode = applyTextEdits({
                        sourceText,
                        textEdits,
                    });

                    const shouldWrapReadonly =
                        readonlyNodeVariant !== "plain" &&
                        !replacementSpec.replacementText
                            .trimStart()
                            .startsWith("Readonly<");
                    const expectedReplacementText = shouldWrapReadonly
                        ? `Readonly<${replacementSpec.replacementText}>`
                        : replacementSpec.replacementText;

                    expect(fixedCode).toContain(
                        `type Candidate = ${expectedReplacementText};`
                    );
                    expect(fixedCode).toContain(
                        `import type { ${replacementSpec.replacementName} } from "type-fest";`
                    );
                    expect(
                        countNamedTypeImportSpecifiersInSource({
                            importedName: replacementSpec.replacementName,
                            sourceModuleName: "type-fest",
                            sourceText: fixedCode,
                        })
                    ).toBe(1);

                    assertTypeReplacementImportOrdering({
                        fixedCode,
                        insertionMode: prologueCase.expectedInsertionMode,
                        replacementName: replacementSpec.replacementName,
                    });

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});
