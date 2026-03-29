/**
 * @packageDocumentation
 * Shared matchers for function-type wrappers built from `Parameters`,
 * `ReturnType`, and async return boxing helpers.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { areEquivalentTypeNodes } from "./normalize-expression-text.js";
import {
    isIdentifierTypeReference,
    unwrapParenthesizedTypeNode,
} from "./type-reference-node.js";

/**
 * Extract the sole type argument from a type reference.
 *
 * @param node - Type reference to inspect.
 *
 * @returns The only type argument when exactly one is present; otherwise
 *   `null`.
 */
const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): null | Readonly<TSESTree.TypeNode> => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return null;
    }

    const [onlyTypeArgument] = typeArguments;

    return onlyTypeArgument ?? null;
};

/**
 * Read a normalized type annotation from a function parameter node.
 *
 * @param parameter - Parameter node to inspect.
 *
 * @returns The unwrapped type annotation when present; otherwise `null`.
 */
const getParameterTypeAnnotation = (
    parameter: Readonly<TSESTree.Parameter>
): null | Readonly<TSESTree.TypeNode> => {
    if (parameter.type === "Identifier") {
        return parameter.typeAnnotation === undefined
            ? null
            : unwrapParenthesizedTypeNode(
                  parameter.typeAnnotation.typeAnnotation
              );
    }

    if (parameter.type !== "RestElement") {
        return null;
    }

    return parameter.typeAnnotation === undefined
        ? null
        : unwrapParenthesizedTypeNode(parameter.typeAnnotation.typeAnnotation);
};

/**
 * Match direct `(...args: Parameters<Function>) => ...` wrappers.
 *
 * @param node - Function type node to inspect.
 *
 * @returns The wrapped function type argument when the function has exactly one
 *   rest parameter typed as `Parameters<Function>`; otherwise `null`.
 */
export const getParametersFunctionArgumentFromFunctionType = (
    node: Readonly<TSESTree.TSFunctionType>
): null | Readonly<TSESTree.TypeNode> => {
    if (node.params.length !== 1) {
        return null;
    }

    const [onlyParameter] = node.params;

    if (onlyParameter?.type !== "RestElement") {
        return null;
    }

    const restParameterType = getParameterTypeAnnotation(onlyParameter);

    if (
        restParameterType?.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(restParameterType, "Parameters")
    ) {
        return null;
    }

    return getSingleTypeArgument(restParameterType);
};

/**
 * Check whether a type node is `ReturnType<Function>` for a specific function.
 *
 * @param node - Candidate return type node.
 * @param functionType - Wrapped function type.
 *
 * @returns `true` when the node is `ReturnType<Function>`.
 */
export const isReturnTypeReferenceForFunction = (
    node: Readonly<TSESTree.TypeNode>,
    functionType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(normalizedNode, "ReturnType")
    ) {
        return false;
    }

    const referencedFunctionType = getSingleTypeArgument(normalizedNode);

    return (
        referencedFunctionType !== null &&
        areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(referencedFunctionType),
            unwrapParenthesizedTypeNode(functionType)
        )
    );
};

/**
 * Check whether a type node is `Promise<Awaited<ReturnType<Function>>>`.
 *
 * @param node - Candidate return type node.
 * @param functionType - Wrapped function type.
 *
 * @returns `true` when the node is the canonical asyncified return shape.
 */
export const isPromiseAwaitedReturnTypeReferenceForFunction = (
    node: Readonly<TSESTree.TypeNode>,
    functionType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(normalizedNode, "Promise")
    ) {
        return false;
    }

    const promisedType = getSingleTypeArgument(normalizedNode);

    if (
        promisedType?.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(promisedType, "Awaited")
    ) {
        return false;
    }

    const awaitedInnerType = getSingleTypeArgument(promisedType);

    return (
        awaitedInnerType !== null &&
        isReturnTypeReferenceForFunction(awaitedInnerType, functionType)
    );
};
