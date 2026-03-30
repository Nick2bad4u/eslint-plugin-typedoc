import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/** Declarations that can be documented as exported API surface. */
export type DocumentableExportDeclaration =
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSModuleDeclaration
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.VariableDeclaration;

/** Check whether an export declaration contains a documentable API node. */
export const isDocumentableExportDeclaration = (
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

/** Resolve a stable human-readable name for an exported declaration. */
export const getDeclarationName = (
    declaration: Readonly<DocumentableExportDeclaration>
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
