import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

export type TypeParameterizedNode = Readonly<{
    typeParameters: null | TSESTree.TSTypeParameterDeclaration | undefined;
}>;

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
