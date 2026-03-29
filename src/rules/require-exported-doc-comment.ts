import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingDocComment";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

type DocumentableExportDeclaration =
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSModuleDeclaration
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.VariableDeclaration;

const isDocumentableExportDeclaration = (
    value: Readonly<
        | null
        | TSESTree.ExportDefaultDeclaration["declaration"]
        | TSESTree.ExportNamedDeclaration["declaration"]
    >
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

            return firstDeclarator?.id.type === AST_NODE_TYPES.Identifier
                ? firstDeclarator.id.name
                : "exported declaration";
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

/** Rule implementation for exported declaration documentation coverage. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;
        const lineEnding = getPreferredLineEnding(sourceCode);

        const reportIfMissingDocComment = (
            declaration: Readonly<DocumentableExportDeclaration>
        ): void => {
            const docAnchorNode = getDocCommentAnchorNode(declaration);

            if (getLeadingDocComment(sourceCode, docAnchorNode) !== null) {
                return;
            }

            const declarationName = getDeclarationName(declaration);

            context.report({
                data: {
                    declarationName,
                },
                fix: (fixer) => {
                    const indentation = " ".repeat(
                        docAnchorNode.loc?.start.column ?? 0
                    );
                    const docComment = createDocCommentText(
                        declarationName,
                        indentation,
                        lineEnding
                    );

                    return fixer.insertTextBefore(docAnchorNode, docComment);
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
                "require a leading TypeDoc block comment for exported declarations.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.minimal",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
        },
        fixable: "code",
        messages: {
            missingDocComment:
                "Exported declaration '{{declarationName}}' must have a leading TypeDoc comment.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-exported-doc-comment",
});

export default rule;
