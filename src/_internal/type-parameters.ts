import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/** Node contract for declarations that may carry generic type parameters. */
export type TypeParameterizedNode = Readonly<{
    typeParameters: null | TSESTree.TSTypeParameterDeclaration | undefined;
}>;

/** Read declared generic type-parameter names from a supported node. */
export const getTypeParameterNames = (
    node: TypeParameterizedNode
): readonly string[] => {
    const typeParameters = node.typeParameters;

    if (typeParameters === undefined || typeParameters === null) {
        return [];
    }

    const typeParameterNames: string[] = [];

    for (const typeParameter of typeParameters.params) {
        const { name } = typeParameter;

        if (typeof name === "string") {
            typeParameterNames.push(name);
            continue;
        }

        if (name.type === AST_NODE_TYPES.Identifier) {
            typeParameterNames.push(name.name);
        }
    }

    return typeParameterNames;
};
