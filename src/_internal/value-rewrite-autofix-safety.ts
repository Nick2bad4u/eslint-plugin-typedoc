/**
 * @packageDocumentation
 * Shared safety checks for value-expression autofixes.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getParentNode } from "./ast-node.js";

/**
 * Check whether a parent node is a transparent expression wrapper for `child`.
 */
export const isTransparentExpressionWrapper = (
    parent: Readonly<TSESTree.Node>,
    child: Readonly<TSESTree.Node>
): boolean => {
    if (parent.type === "ChainExpression") {
        return parent.expression === child;
    }

    if (parent.type === "TSAsExpression") {
        return parent.expression === child;
    }

    if (parent.type === "TSNonNullExpression") {
        return parent.expression === child;
    }

    if (parent.type === "TSSatisfiesExpression") {
        return parent.expression === child;
    }

    if (parent.type === "TSTypeAssertion") {
        return parent.expression === child;
    }

    return false;
};

/**
 * Detect whether an expression is a chain/optional-call/optional-member shape.
 */
export const isOptionalChainExpression = (
    node: Readonly<TSESTree.Expression>
): boolean =>
    node.type === "ChainExpression" ||
    ((node.type === "CallExpression" || node.type === "MemberExpression") &&
        node.optional);

/**
 * Determine whether an expression occupies a direct return position.
 */
export const isDirectReturnLikeExpressionPosition = (
    node: Readonly<TSESTree.Expression>
): boolean => {
    let currentNode: Readonly<TSESTree.Node> = node;

    while (true) {
        const parentNode = getParentNode(currentNode);

        if (parentNode === undefined) {
            return false;
        }

        if (isTransparentExpressionWrapper(parentNode, currentNode)) {
            currentNode = parentNode;
            continue;
        }

        if (
            parentNode.type === "ReturnStatement" &&
            parentNode.argument === currentNode
        ) {
            return true;
        }

        if (
            parentNode.type === "ArrowFunctionExpression" &&
            parentNode.body === currentNode
        ) {
            return true;
        }

        return false;
    }
};

/**
 * Guard array index-to-helper rewrites known to be type-sensitive.
 */
export const isArrayIndexReadAutofixSafe = (
    node: Readonly<TSESTree.MemberExpression>
): boolean => {
    if (isOptionalChainExpression(node.object)) {
        return false;
    }

    if (isDirectReturnLikeExpressionPosition(node)) {
        return false;
    }

    return true;
};

/**
 * Determine whether an expression is safe to evaluate fewer times after a
 * rewrite that collapses duplicate evaluations.
 *
 * @remarks
 * Expressions such as member access or function calls can change runtime
 * behavior when duplicated evaluation sites are rewritten to a single helper
 * call. This helper intentionally accepts only stable, exception-free
 * primitives and identifiers.
 */
export const isRepeatablyEvaluableExpression = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Expression => {
    if (node.type === "PrivateIdentifier") {
        return false;
    }

    if (
        node.type === "TSAsExpression" ||
        node.type === "TSNonNullExpression" ||
        node.type === "TSSatisfiesExpression" ||
        node.type === "TSTypeAssertion"
    ) {
        return isRepeatablyEvaluableExpression(node.expression);
    }

    if (node.type === "ChainExpression") {
        return isRepeatablyEvaluableExpression(node.expression);
    }

    if (node.type === "Identifier") {
        return true;
    }

    if (node.type === "Literal") {
        return true;
    }

    if (node.type === "TemplateLiteral") {
        return node.expressions.length === 0;
    }

    if (node.type === "ThisExpression") {
        return true;
    }

    return false;
};
