/**
 * @packageDocumentation
 * Require exported declarations to include a leading TypeDoc block comment.
 */

import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import {
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const defaultOptions = [] as const;

type Options = typeof defaultOptions;
type MessageIds = "missingDocComment";

type DocumentableExportDeclaration =
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSModuleDeclaration
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.VariableDeclaration;

const isDocumentableExportDeclaration = (
    value:
        | TSESTree.ExportDefaultDeclaration["declaration"]
        | TSESTree.ExportNamedDeclaration["declaration"]
        | null
): value is DocumentableExportDeclaration => {
    if (value === null) {
        return false;
    }

    switch (value.type) {
        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.TSEnumDeclaration:
        case AST_NODE_TYPES.TSInterfaceDeclaration:
        case AST_NODE_TYPES.TSModuleDeclaration:
        case AST_NODE_TYPES.TSTypeAliasDeclaration:
        case AST_NODE_TYPES.VariableDeclaration: {
            return true;
        }

        default: {
            return false;
        }
    }
};

const getDeclarationName = (
    declaration: DocumentableExportDeclaration
): string => {
    switch (declaration.type) {
        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.TSEnumDeclaration:
        case AST_NODE_TYPES.TSInterfaceDeclaration:
        case AST_NODE_TYPES.TSModuleDeclaration:
        case AST_NODE_TYPES.TSTypeAliasDeclaration: {
            const declarationId = declaration.id;

            if (declarationId === null || declarationId === undefined) {
                return "exported declaration";
            }

            if (declarationId.type === AST_NODE_TYPES.Identifier) {
                return declarationId.name;
            }

            if (
                declarationId.type === AST_NODE_TYPES.Literal &&
                typeof declarationId.value === "string"
            ) {
                return declarationId.value;
            }

            return "exported declaration";
        }

        case AST_NODE_TYPES.VariableDeclaration: {
            const firstDeclarator = declaration.declarations[0];

            if (
                firstDeclarator?.id.type === AST_NODE_TYPES.Identifier &&
                firstDeclarator.id.name.length > 0
            ) {
                return firstDeclarator.id.name;
            }

            return "exported variable declaration";
        }
    }
};

const createDocCommentText = (
    declarationName: string,
    indentation: string,
    lineEnding: "\n" | "\r\n"
): string =>
    [
        `${indentation}/**`,
        `${indentation} * TODO: Document ${declarationName}.`,
        `${indentation} */`,
        "",
    ].join(lineEnding);

const rule = createTypedRule<Options, MessageIds>({
    create: (context) => {
        const { sourceCode } = context;
        const lineEnding = getPreferredLineEnding(sourceCode);

        const reportIfMissingDocComment = (
            declaration: DocumentableExportDeclaration
        ): void => {
            if (getLeadingDocComment(sourceCode, declaration) !== null) {
                return;
            }

            const declarationName = getDeclarationName(declaration);

            context.report({
                data: {
                    name: declarationName,
                },
                fix: (fixer) => {
                    const indentation = " ".repeat(
                        declaration.loc?.start.column ?? 0
                    );
                    const docComment = createDocCommentText(
                        declarationName,
                        indentation,
                        lineEnding
                    );

                    return fixer.insertTextBefore(declaration, docComment);
                },
                messageId: "missingDocComment",
                node: declaration,
            });
        };

        return {
            ExportDefaultDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDocComment(declaration);
            },
            ExportNamedDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDocComment(declaration);
            },
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "Require exported declarations to include a TypeDoc comment block.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.all",
            ],
        },
        fixable: "code",
        messages: {
            missingDocComment:
                "Add a TypeDoc comment for exported '{{name}}' so documentation and lint diagnostics stay in sync.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-exported-doc-comment",
});

export default rule;
