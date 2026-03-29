/**
 * @packageDocumentation
 * AST and fixer harness helpers for `prefer-ts-extras-is-defined` tests.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";

import { isSafeGeneratedIdentifier } from "./fast-check";

export type IsDefinedRuleReportDescriptor = Readonly<{
    fix?: TSESLint.ReportFixFunction;
    messageId?: string;
}>;

export type TextEdit = Readonly<{
    range: readonly [number, number];
    text: string;
}>;

export type UndefinedComparisonOperator = "!=" | "!==" | "==" | "===";

export type UndefinedComparisonPattern =
    | "directUndefinedLeft"
    | "directUndefinedRight"
    | "typeofUndefinedLeft"
    | "typeofUndefinedRight";

type ParsedAst = ReturnType<typeof parser.parseForESLint>["ast"];

type ScopeBindingStatement = Extract<
    ParsedAst["body"][number],
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.ImportDeclaration
    | TSESTree.VariableDeclaration
>;

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

export const undefinedComparisonPatternArbitrary: fc.Arbitrary<UndefinedComparisonPattern> =
    fc.constantFrom<UndefinedComparisonPattern>(
        "directUndefinedLeft",
        "directUndefinedRight",
        "typeofUndefinedLeft",
        "typeofUndefinedRight"
    );

export const undefinedComparisonOperatorArbitrary: fc.Arbitrary<UndefinedComparisonOperator> =
    fc.constantFrom<UndefinedComparisonOperator>("!=", "!==", "==", "===");

export const identifierNameArbitrary: fc.Arbitrary<string> = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate))
    .filter(
        (candidate) => candidate !== "undefined" && candidate !== "isDefined"
    );

export const buildUndefinedComparisonExpression = ({
    identifierName,
    operator,
    pattern,
}: Readonly<{
    identifierName: string;
    operator: UndefinedComparisonOperator;
    pattern: UndefinedComparisonPattern;
}>): string => {
    if (pattern === "directUndefinedLeft") {
        return `undefined ${operator} ${identifierName}`;
    }

    if (pattern === "directUndefinedRight") {
        return `${identifierName} ${operator} undefined`;
    }

    if (pattern === "typeofUndefinedLeft") {
        return `"undefined" ${operator} typeof ${identifierName}`;
    }

    return `typeof ${identifierName} ${operator} "undefined"`;
};

export const parseUndefinedComparisonFromCode = (
    sourceText: string
): Readonly<{
    ast: ParsedAst;
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
        "Expected generated source text to contain a binary expression variable initializer"
    );
};

export const parseVariableInitializerExpressionByName = ({
    sourceText,
    variableName,
}: Readonly<{
    sourceText: string;
    variableName: string;
}>): Readonly<{
    ast: ParsedAst;
    initializer: TSESTree.Expression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.name === variableName &&
                    declaration.init !== null
                ) {
                    return {
                        ast: parsed.ast,
                        initializer: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        `Expected generated source text to declare \`${variableName}\` with an initializer expression`
    );
};

const addScopeBinding = ({
    definitionNode,
    definitionType,
    name,
    scopeBindings,
}: Readonly<{
    definitionNode: TSESTree.Node;
    definitionType: string;
    name: string;
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
}>): void => {
    if (name.length === 0 || scopeBindings.has(name)) {
        return;
    }

    scopeBindings.set(name, {
        defs: [
            {
                node: definitionNode,
                type: definitionType,
            },
        ],
    } as unknown as TSESLint.Scope.Variable);
};

const addImportScopeBindings = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.ImportDeclaration;
}>): void => {
    for (const specifier of statement.specifiers) {
        if ((specifier as { parent?: unknown }).parent === undefined) {
            (
                specifier as unknown as {
                    parent: Readonly<TSESTree.ImportDeclaration>;
                }
            ).parent = statement;
        }

        if (specifier.local.type === AST_NODE_TYPES.Identifier) {
            addScopeBinding({
                definitionNode: specifier,
                definitionType: "ImportBinding",
                name: specifier.local.name,
                scopeBindings,
            });
        }
    }
};

const addFunctionScopeBinding = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.FunctionDeclaration;
}>): void => {
    if (statement.id?.type === AST_NODE_TYPES.Identifier) {
        addScopeBinding({
            definitionNode: statement.id,
            definitionType: "FunctionName",
            name: statement.id.name,
            scopeBindings,
        });
    }
};

const addClassScopeBinding = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.ClassDeclaration;
}>): void => {
    if (statement.id?.type === AST_NODE_TYPES.Identifier) {
        addScopeBinding({
            definitionNode: statement.id,
            definitionType: "ClassName",
            name: statement.id.name,
            scopeBindings,
        });
    }
};

const addVariableScopeBindings = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.VariableDeclaration;
}>): void => {
    for (const declaration of statement.declarations) {
        if (declaration.id.type === AST_NODE_TYPES.Identifier) {
            addScopeBinding({
                definitionNode: declaration.id,
                definitionType: "Variable",
                name: declaration.id.name,
                scopeBindings,
            });
        }
    }
};

const isScopeBindingStatement = (
    statement: Readonly<ParsedAst["body"][number]>
): statement is ScopeBindingStatement =>
    statement.type === AST_NODE_TYPES.ClassDeclaration ||
    statement.type === AST_NODE_TYPES.FunctionDeclaration ||
    statement.type === AST_NODE_TYPES.ImportDeclaration ||
    statement.type === AST_NODE_TYPES.VariableDeclaration;

const collectTopLevelScopeBindings = (
    ast: Readonly<ParsedAst>
): Map<string, TSESLint.Scope.Variable> => {
    const scopeBindings = new Map<string, TSESLint.Scope.Variable>();

    for (const statement of ast.body) {
        if (isScopeBindingStatement(statement)) {
            switch (statement.type) {
                case AST_NODE_TYPES.ClassDeclaration: {
                    addClassScopeBinding({
                        scopeBindings,
                        statement,
                    });
                    break;
                }

                case AST_NODE_TYPES.FunctionDeclaration: {
                    addFunctionScopeBinding({
                        scopeBindings,
                        statement,
                    });
                    break;
                }

                case AST_NODE_TYPES.ImportDeclaration: {
                    addImportScopeBindings({
                        scopeBindings,
                        statement,
                    });
                    break;
                }

                case AST_NODE_TYPES.VariableDeclaration: {
                    addVariableScopeBindings({
                        scopeBindings,
                        statement,
                    });
                    break;
                }
            }
        }
    }

    return scopeBindings;
};

export const createRuleContextForSource = ({
    ast,
    reportCalls,
    sourceText,
}: Readonly<{
    ast: ParsedAst;
    reportCalls: IsDefinedRuleReportDescriptor[];
    sourceText: string;
}>): unknown => {
    const scopeBindings = collectTopLevelScopeBindings(ast);
    const scope = {
        set: scopeBindings,
        upper: null,
    };

    return {
        filename: "src/example.ts",
        report(descriptor: IsDefinedRuleReportDescriptor): void {
            reportCalls.push(descriptor);
        },
        sourceCode: {
            ast,
            getScope: (): Readonly<TSESLint.Scope.Scope> =>
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

                return sourceText.slice(nodeRange[0], nodeRange[1]);
            },
        },
    };
};

const normalizeFixResultToArray = (
    fixResult:
        | Iterable<Readonly<TSESLint.RuleFix>>
        | null
        | Readonly<TSESLint.RuleFix>
): readonly Readonly<TSESLint.RuleFix>[] => {
    if (fixResult === null) {
        return [];
    }

    if (
        typeof fixResult === "object" &&
        fixResult !== null &&
        Symbol.iterator in fixResult
    ) {
        return [...fixResult];
    }

    return [fixResult];
};

export const invokeReportFixToTextEdits = (
    reportFix: TSESLint.ReportFixFunction
): readonly TextEdit[] => {
    const getNodeRange = (
        node: Readonly<TSESTree.Node>
    ): readonly [number, number] => node.range;

    const fixer = {
        insertTextAfter(node: Readonly<TSESTree.Node>, text: string) {
            const nodeRange = getNodeRange(node);

            return {
                range: [nodeRange[1], nodeRange[1]],
                text,
            } as const;
        },
        insertTextBeforeRange(range: readonly [number, number], text: string) {
            return {
                range,
                text,
            } as const;
        },
        replaceText(node: Readonly<TSESTree.Node>, text: string) {
            return {
                range: getNodeRange(node),
                text,
            } as const;
        },
        replaceTextRange(
            range: readonly [number, number],
            text: string
        ): Readonly<TSESLint.RuleFix> {
            return {
                range,
                text,
            };
        },
    } as unknown as Readonly<TSESLint.RuleFixer>;

    const fixResult = reportFix(fixer);

    return normalizeFixResultToArray(fixResult).map(
        (fix): TextEdit => ({
            range: fix.range,
            text: fix.text,
        })
    );
};

export const applyTextEdits = ({
    sourceText,
    textEdits,
}: Readonly<{
    sourceText: string;
    textEdits: readonly TextEdit[];
}>): string => {
    let nextSourceText = sourceText;
    const remainingTextEdits = [...textEdits];

    while (remainingTextEdits.length > 0) {
        let greatestIndex = 0;

        for (let index = 1; index < remainingTextEdits.length; index += 1) {
            const currentEdit = remainingTextEdits[index];
            const greatestEdit = remainingTextEdits[greatestIndex];

            if (
                currentEdit !== undefined &&
                greatestEdit !== undefined &&
                currentEdit.range[0] > greatestEdit.range[0]
            ) {
                greatestIndex = index;
            }
        }

        const [selectedTextEdit] = remainingTextEdits.splice(greatestIndex, 1);

        if (selectedTextEdit !== undefined) {
            nextSourceText =
                nextSourceText.slice(0, selectedTextEdit.range[0]) +
                selectedTextEdit.text +
                nextSourceText.slice(selectedTextEdit.range[1]);
        }
    }

    return nextSourceText;
};
