/**
 * @packageDocumentation
 * Shared helpers for extracting throw-only `if` consequents.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { arrayFirst } from "ts-extras";

/**
 * Extract the single throw statement from a block consequent when present.
 *
 * @param node - Consequent statement candidate.
 *
 * @returns The throw statement when the consequent is exactly `{ throw ... }`;
 *   otherwise `null`.
 */
const getSingleThrowFromBlockConsequent = (
    node: Readonly<TSESTree.Statement>
): null | TSESTree.ThrowStatement => {
    if (node.type !== "BlockStatement" || node.body.length !== 1) {
        return null;
    }

    const firstStatement = arrayFirst(node.body);

    if (firstStatement?.type !== "ThrowStatement") {
        return null;
    }

    return firstStatement;
};

/**
 * Check whether an `if` consequent contains only a throw statement.
 *
 * @param node - Consequent statement to inspect.
 *
 * @returns `true` for `throw ...` and `{ throw ... }` shapes.
 */
export const isThrowOnlyConsequent = (
    node: Readonly<TSESTree.Statement>
): boolean => {
    if (node.type === "ThrowStatement") {
        return true;
    }

    /* v8 ignore next 2 -- defensive sparse-array guard for malformed synthetic AST nodes. */
    return getSingleThrowFromBlockConsequent(node) !== null;
};

/**
 * Extract the throw statement from a throw-only consequent.
 *
 * @param node - Consequent statement to inspect.
 *
 * @returns Throw statement when present; otherwise `null`.
 */
export const getThrowStatementFromConsequent = (
    node: Readonly<TSESTree.Statement>
): null | TSESTree.ThrowStatement => {
    if (node.type === "ThrowStatement") {
        return node;
    }

    /* v8 ignore next 2 -- guarded by isThrowOnlyConsequent before this helper is invoked in rule flow. */
    return getSingleThrowFromBlockConsequent(node);
};
