/**
 * @packageDocumentation
 * Conservative safety checks for autofixes that introduce type predicates.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getParentNode } from "./ast-node.js";
import { isTransparentExpressionWrapper } from "./value-rewrite-autofix-safety.js";

/**
 * Determine whether a call-expression replacement to a type-predicate helper is
 * safe to apply as an autofix.
 *
 * @remarks
 * Type-predicate helpers (for example `setHas`) can change control-flow
 * narrowing in boolean guard expressions. This check intentionally disables
 * autofix in those contexts and leaves a diagnostic for manual review.
 */
export const isTypePredicateExpressionAutofixSafe = (
    node: Readonly<TSESTree.Expression>
): boolean => {
    let currentNode: Readonly<TSESTree.Node> = node;

    while (true) {
        const parentNode = getParentNode(currentNode);

        if (parentNode === undefined) {
            return true;
        }

        if (isTransparentExpressionWrapper(parentNode, currentNode)) {
            currentNode = parentNode;
            continue;
        }

        if (
            parentNode.type === "UnaryExpression" &&
            parentNode.operator === "!" &&
            parentNode.argument === currentNode
        ) {
            return false;
        }

        if (
            parentNode.type === "LogicalExpression" &&
            (parentNode.left === currentNode ||
                parentNode.right === currentNode)
        ) {
            return false;
        }

        if (
            parentNode.type === "ConditionalExpression" &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        if (
            (parentNode.type === "DoWhileStatement" ||
                parentNode.type === "IfStatement" ||
                parentNode.type === "WhileStatement") &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        if (
            parentNode.type === "ForStatement" &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        if (
            parentNode.type === "SwitchCase" &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        return true;
    }
};

/**
 * Backward-compatible alias for call-expression-based callers.
 */
export const isTypePredicateAutofixSafe = (
    node: Readonly<TSESTree.CallExpression>
): boolean => isTypePredicateExpressionAutofixSafe(node);
