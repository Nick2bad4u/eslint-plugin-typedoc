/**
 * @packageDocumentation
 * Unit tests for `@typescript-eslint` node-expression skip-checker fallbacks.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";
import type ts from "typescript";

import { describe, expect, it, vi } from "vitest";

import {
    createTypeScriptEslintNodeExpressionSkipChecker,
    isTypeScriptEslintAstType,
} from "../../src/_internal/typescript-eslint-node-autofix";

type RuleContext = TSESLint.RuleContext<string, UnknownArray>;

const createImportDeclarationFromTypeScriptEslintUtils = (
    specifiers: readonly unknown[]
): TSESTree.ImportDeclaration =>
    ({
        attributes: [],
        importKind: "value",
        source: {
            raw: '"@typescript-eslint/utils"',
            type: "Literal",
            value: "@typescript-eslint/utils",
        },
        specifiers,
        type: "ImportDeclaration",
    }) as unknown as TSESTree.ImportDeclaration;

const createTSESTreeImportSpecifier = (
    localName: string
): TSESTree.ImportSpecifier =>
    ({
        imported: {
            name: "TSESTree",
            type: "Identifier",
        },
        importKind: "value",
        local: {
            name: localName,
            type: "Identifier",
        },
        type: "ImportSpecifier",
    }) as unknown as TSESTree.ImportSpecifier;

const createImportNamespaceSpecifier = (
    localName: string
): TSESTree.ImportNamespaceSpecifier =>
    ({
        local: {
            name: localName,
            type: "Identifier",
        },
        type: "ImportNamespaceSpecifier",
    }) as unknown as TSESTree.ImportNamespaceSpecifier;

const createScopeWithVariable = (
    variableName: string,
    definitionNode: Readonly<TSESTree.Node>
): Readonly<TSESLint.Scope.Scope> =>
    ({
        set: new Map([
            [
                variableName,
                {
                    defs: [
                        {
                            node: definitionNode,
                        },
                    ],
                },
            ],
        ]),
        upper: null,
    }) as unknown as Readonly<TSESLint.Scope.Scope>;

const createRuleContext = ({
    definitionNode,
    definitionText,
    importStatements,
    variableName,
}: Readonly<{
    definitionNode: Readonly<TSESTree.Node>;
    definitionText: string;
    importStatements: readonly TSESTree.ProgramStatement[];
    variableName: string;
}>): Readonly<RuleContext> => {
    const textByNode = new Map<Readonly<TSESTree.Node>, string>([
        [definitionNode, definitionText],
    ]);

    return {
        sourceCode: {
            ast: {
                body: importStatements,
            },
            getScope: () =>
                createScopeWithVariable(variableName, definitionNode),
            getText: (node: Readonly<TSESTree.Node>) =>
                textByNode.get(node) ?? "",
        },
    } as unknown as Readonly<RuleContext>;
};

const createTypeCheckerForAstTypeTests = (): Readonly<ts.TypeChecker> =>
    ({
        typeToString: () => "NodeLikeType",
    }) as unknown as Readonly<ts.TypeChecker>;

const createTypeCheckerWithRenderedType = (
    renderedTypeText: string
): Readonly<ts.TypeChecker> =>
    ({
        typeToString: () => renderedTypeText,
    }) as unknown as Readonly<ts.TypeChecker>;

const createTypeWithDeclarationPath = (fileName: string): Readonly<ts.Type> =>
    ({
        aliasSymbol: undefined,
        getSymbol: () => ({
            getDeclarations: () => [
                {
                    getSourceFile: () => ({
                        fileName,
                    }),
                },
            ],
        }),
        isUnionOrIntersection: () => false,
        types: [],
    }) as unknown as Readonly<ts.Type>;

describe(createTypeScriptEslintNodeExpressionSkipChecker, () => {
    it("returns true for definition nodes containing qualified TSESTree type references", () => {
        const definitionNode = {
            id: {
                name: "nodeLike",
                type: "Identifier",
                typeAnnotation: {
                    type: "TSTypeAnnotation",
                    typeAnnotation: {
                        type: "TSTypeReference",
                        typeName: {
                            left: {
                                name: "TSESTree",
                                type: "Identifier",
                            },
                            right: {
                                name: "Node",
                                type: "Identifier",
                            },
                            type: "TSQualifiedName",
                        },
                    },
                },
            },
            init: null,
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("TSESTree"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeTruthy();
    });

    it("returns false when no @typescript-eslint namespace import exists even if text contains TSESTree.", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: TSESTree.Node = value;",
            importStatements: [],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });

    it("skips scope traversal entirely when no namespace imports are present", () => {
        const context = {
            sourceCode: {
                ast: {
                    body: [],
                },
                getScope: () => {
                    throw new Error("scope should not be consulted");
                },
                getText: () => "const nodeLike: TSESTree.Node = value;",
            },
        } as unknown as Readonly<RuleContext>;

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });

    it("returns true for imported aliases referenced in definition text fallback", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: EST.Node = value;",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("EST"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeTruthy();
    });

    it("returns true for namespace imports referenced in definition text fallback", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: EST.Node = value;",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createImportNamespaceSpecifier("EST"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeTruthy();
    });

    it("uses namespace-boundary matching for text fallback", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: BEST.Node = value;",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("EST"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });

    it("does not match namespace text appearing only inside string literals in parser-backed fallback", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike = 'EST.Node';",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("EST"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });

    it("gracefully handles SourceCode objects without ast/body", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = {
            sourceCode: {
                getScope: () =>
                    createScopeWithVariable("nodeLike", definitionNode),
                getText: () => "const nodeLike: TSESTree.Node = value;",
            },
        } as unknown as Readonly<RuleContext>;

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });

    it("memoizes fallback skip-check decisions per expression node", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const getScope = vi.fn(() =>
            createScopeWithVariable("nodeLike", definitionNode)
        );
        const expressionNode = {
            name: "nodeLike",
            type: "Identifier",
        } as TSESTree.Identifier;

        const context = {
            sourceCode: {
                ast: {
                    body: [
                        createImportDeclarationFromTypeScriptEslintUtils([
                            createTSESTreeImportSpecifier("EST"),
                        ]),
                    ],
                },
                getScope,
                getText: () => "const nodeLike: EST.Node = value;",
            },
        } as unknown as Readonly<RuleContext>;

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(shouldSkipExpression(expressionNode)).toBeTruthy();
        expect(shouldSkipExpression(expressionNode)).toBeTruthy();
        expect(getScope).toHaveBeenCalledTimes(1);
    });
});

describe(isTypeScriptEslintAstType, () => {
    it("matches declaration paths containing an @typescript-eslint path segment", () => {
        const utils = createTypeCheckerForAstTypeTests();
        const type = createTypeWithDeclarationPath(
            String.raw`C:\repo\node_modules\@typescript-eslint\utils\dist\index.d.ts`
        );

        expect(isTypeScriptEslintAstType(utils, type)).toBeTruthy();
    });

    it("does not match package-like names when @typescript-eslint is not a full path segment", () => {
        const utils = createTypeCheckerForAstTypeTests();
        const type = createTypeWithDeclarationPath(
            String.raw`C:\repo\node_modules\@typescript-eslint-tools\utils\dist\index.d.ts`
        );

        expect(isTypeScriptEslintAstType(utils, type)).toBeFalsy();
    });

    it("ignores lexical typeToString text when declaration metadata is absent", () => {
        const utils = createTypeCheckerWithRenderedType("TSESTree.Node");
        const astTypeWithoutDeclarations = {
            aliasSymbol: undefined,
            getSymbol: () => ({
                getDeclarations: () => [],
            }),
            isUnionOrIntersection: () => false,
            types: [],
        } as unknown as Readonly<ts.Type>;

        expect(
            isTypeScriptEslintAstType(utils, astTypeWithoutDeclarations)
        ).toBeFalsy();
    });
});
