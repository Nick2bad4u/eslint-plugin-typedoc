/**
 * @packageDocumentation
 * Utilities for detecting nodes that live inside `.filter(...)` callbacks.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getParentNode } from "./ast-node.js";
import { setContainsValue } from "./set-membership.js";

/** Target method name used for callback-context detection. */
const FILTER_METHOD_NAME = "filter";

/**
 * Narrows nodes to function-like callback expressions.
 */
const isFunctionCallbackNode = (
    node: Readonly<TSESTree.Node>
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression =>
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression";

/**
 * Narrows call expressions to direct `.filter(...)` calls.
 */
export const isFilterCallExpression = (
    expression: Readonly<TSESTree.CallExpression>
): expression is TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        optional: false;
        property: TSESTree.Identifier;
    };
    optional: false;
} =>
    !expression.optional &&
    expression.callee.type === "MemberExpression" &&
    !expression.callee.computed &&
    !expression.callee.optional &&
    expression.callee.property.type === "Identifier" &&
    expression.callee.property.name === FILTER_METHOD_NAME;

/**
 * Extract the first callback argument from a direct `.filter(...)` call.
 *
 * @param expression - Candidate call expression to inspect.
 *
 * @returns Callback expression when the call is a supported `.filter(...)`
 *   invocation and the first argument is an arrow/function expression;
 *   otherwise `null`.
 */
export const getFilterCallbackFunctionArgument = (
    expression: Readonly<TSESTree.CallExpression>
): null | Readonly<
    TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
> => {
    if (!isFilterCallExpression(expression)) {
        return null;
    }

    const [firstArgument] = expression.arguments;
    if (
        !firstArgument ||
        (firstArgument.type !== "ArrowFunctionExpression" &&
            firstArgument.type !== "FunctionExpression")
    ) {
        return null;
    }

    return firstArgument;
};

/**
 * Structured match for `.filter(...)` calls with a single identifier parameter
 * arrow callback that uses an expression body.
 */
export type SingleParameterExpressionArrowFilterCallbackMatch = Readonly<{
    callback: TSESTree.ArrowFunctionExpression & {
        body: TSESTree.Expression;
        params: [TSESTree.Identifier];
    };
    parameter: TSESTree.Identifier;
}>;

/**
 * Extract a strict callback shape from direct `.filter(...)` calls.
 *
 * @param expression - Candidate call expression to inspect.
 *
 * @returns Structured callback match when supported; otherwise `null`.
 */
export const getSingleParameterExpressionArrowFilterCallback = (
    expression: Readonly<TSESTree.CallExpression>
): null | SingleParameterExpressionArrowFilterCallbackMatch => {
    const callback = getFilterCallbackFunctionArgument(expression);
    if (callback?.type !== "ArrowFunctionExpression") {
        return null;
    }

    if (callback.params.length !== 1) {
        return null;
    }

    if (callback.body.type === "BlockStatement") {
        return null;
    }

    const [parameter] = callback.params;
    if (parameter?.type !== "Identifier") {
        return null;
    }

    return {
        callback: callback as TSESTree.ArrowFunctionExpression & {
            body: TSESTree.Expression;
            params: [TSESTree.Identifier];
        },
        parameter,
    };
};

/**
 * Checks whether a node appears inside a callback passed as the first argument
 * to a direct `.filter(...)` call.
 *
 * @param node - Node to inspect.
 *
 * @returns `true` when the node is inside a `.filter(...)` callback; otherwise
 *   `false`.
 */
export const isWithinFilterCallback = (
    node: Readonly<TSESTree.Node>
): boolean => {
    let currentNode: TSESTree.Node | undefined = node;
    const visitedNodes = new Set<TSESTree.Node>();

    while (currentNode) {
        if (setContainsValue(visitedNodes, currentNode)) {
            return false;
        }

        visitedNodes.add(currentNode);

        if (isFunctionCallbackNode(currentNode)) {
            const callbackParent = getParentNode(currentNode);
            if (callbackParent?.type !== "CallExpression") {
                currentNode = getParentNode(currentNode);
                continue;
            }

            const [firstArgument] = callbackParent.arguments;

            if (
                firstArgument === currentNode &&
                isFilterCallExpression(callbackParent)
            ) {
                return true;
            }
        }

        currentNode = getParentNode(currentNode);
    }

    return false;
};
