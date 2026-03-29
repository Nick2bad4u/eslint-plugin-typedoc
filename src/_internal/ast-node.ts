/**
 * @packageDocumentation
 * AST parent-chain traversal helpers used by multiple rule utilities.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { keyIn } from "ts-extras";

import { resolveFirstValueInLinkedStructure } from "./cycle-safe-linked-search.js";

/**
 * AST node shape that may carry a parser-populated `parent` reference.
 */
type NodeWithOptionalParent = Readonly<TSESTree.Node> & {
    parent?: Readonly<TSESTree.Node>;
};

/**
 * Determine whether a node exposes an optional `parent` property.
 */
const hasOptionalParentProperty = (
    node: Readonly<TSESTree.Node>
): node is NodeWithOptionalParent => keyIn(node, "parent");

/**
 * Gets a node's parent reference when available.
 *
 * @param node - AST node whose parent should be read.
 *
 * @returns Parent node when present on parser output; otherwise `undefined`.
 */
export const getParentNode = (
    node: Readonly<TSESTree.Node>
): Readonly<TSESTree.Node> | undefined =>
    hasOptionalParentProperty(node) ? node.parent : undefined;

/**
 * Walks the parent chain to locate the enclosing `Program` node.
 *
 * @param node - Starting AST node.
 *
 * @returns Nearest enclosing `Program` node; otherwise `null` when no program
 *   boundary can be reached (including cycle-guard termination).
 */
export const getProgramNode = (
    node: Readonly<TSESTree.Node>
): null | Readonly<TSESTree.Program> => {
    const lookupResult = resolveFirstValueInLinkedStructure<
        Readonly<TSESTree.Node>,
        Readonly<TSESTree.Program>
    >({
        getNextNode: (
            currentNode: Readonly<TSESTree.Node>
        ): null | Readonly<TSESTree.Node> => getParentNode(currentNode) ?? null,
        resolveValue: (currentNode: Readonly<TSESTree.Node>) =>
            currentNode.type === "Program"
                ? {
                      found: true,
                      value: currentNode,
                  }
                : {
                      found: false,
                  },
        startNode: node,
    });

    return lookupResult.found ? lookupResult.value : null;
};
