/**
 * @packageDocumentation
 * Structural normalization and equivalence checks for expressions and type
 * nodes used by safe-fix heuristics.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type { JsonObject } from "type-fest";

import { isDefined, objectHasOwn, objectKeys } from "ts-extras";

import { setContainsValue } from "./set-membership.js";

/**
 * Object-like value that can participate in deep structural comparisons.
 */
type ComparableObject = Readonly<JsonObject>;

/**
 * ESTree metadata keys ignored during structural-equivalence checks.
 */
const ignoredPropertyKeys = new Set<string>([
    "end",
    "loc",
    "parent",
    "range",
    "start",
]);

/**
 * Maximum recursive depth allowed during structural node-value comparisons.
 *
 * @remarks
 * This guard avoids stack-overflow crashes on pathological, adversarially deep
 * AST/type structures. Returning `false` in that case preserves lint-process
 * stability by failing closed for autofix-equivalence checks.
 */
const MAX_NODE_VALUE_COMPARISON_DEPTH = 256;

/**
 * Check whether a value is object-like for structural comparisons.
 */
const isComparableRecord = (value: unknown): value is ComparableObject =>
    typeof value === "object" && value !== null;

/**
 * Return stable comparable keys after stripping metadata properties.
 */
const getComparableKeys = (value: ComparableObject): readonly string[] =>
    objectKeys(value).filter(
        (key) => !setContainsValue(ignoredPropertyKeys, key)
    );

/**
 * Read comparable keys with per-comparison caching to reduce repeated
 * key-filter allocations during deep traversals.
 *
 * @param value - Object candidate being compared.
 * @param comparableKeysByObject - Per-comparison key cache.
 *
 * @returns Comparable key list with ESTree metadata keys removed.
 */
const getCachedComparableKeys = (
    value: ComparableObject,
    comparableKeysByObject: WeakMap<ComparableObject, readonly string[]>
): readonly string[] => {
    const existingComparableKeys = comparableKeysByObject.get(value);
    if (isDefined(existingComparableKeys)) {
        return existingComparableKeys;
    }

    const comparableKeys = getComparableKeys(value);
    comparableKeysByObject.set(value, comparableKeys);

    return comparableKeys;
};

/**
 * Unwrap transparent TypeScript expression wrappers.
 *
 * @param expression - Expression to normalize.
 *
 * @returns The innermost wrapped expression.
 */
const unwrapTransparentExpression = (
    expression: Readonly<TSESTree.Expression>
): Readonly<TSESTree.Expression> => {
    let currentExpression = expression;
    const visitedExpressions = new Set<Readonly<TSESTree.Expression>>();

    while (true) {
        if (setContainsValue(visitedExpressions, currentExpression)) {
            return currentExpression;
        }

        visitedExpressions.add(currentExpression);

        if (currentExpression.type === "TSAsExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSNonNullExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSSatisfiesExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSTypeAssertion") {
            currentExpression = currentExpression.expression;
            continue;
        }

        return currentExpression;
    }
};

/**
 * Records a compared object pair and reports whether that pair was already
 * visited.
 *
 * @param left - Left-side object in the comparison pair.
 * @param right - Right-side object in the comparison pair.
 * @param seenPairs - Weakly-held pair-tracking cache for cycle-safe traversal.
 *
 * @returns `true` when this exact pair has already been processed.
 */
const markAndCheckSeenPair = (
    left: object,
    right: object,
    seenPairs: WeakMap<object, WeakSet<object>>
): boolean => {
    const seenRightNodes = seenPairs.get(left);
    if (isDefined(seenRightNodes) && seenRightNodes.has(right)) {
        return true;
    }

    if (isDefined(seenRightNodes)) {
        seenRightNodes.add(right);
    } else {
        seenPairs.set(left, new WeakSet([right]));
    }

    return false;
};

/**
 * Deep structural comparison that is resilient to cycles and ESTree metadata
 * fields.
 *
 * @param left - Left-side value.
 * @param right - Right-side value.
 * @param seenPairs - Pair cache used to break recursive cycles.
 *
 * @returns `true` when the values are structurally equivalent after metadata
 *   normalization.
 */
const areEquivalentNodeValues = (
    left: unknown,
    right: unknown,
    seenPairs: WeakMap<object, WeakSet<object>> = new WeakMap(),
    comparableKeysByObject: WeakMap<
        ComparableObject,
        readonly string[]
    > = new WeakMap(),
    depth = 0
): boolean => {
    if (depth >= MAX_NODE_VALUE_COMPARISON_DEPTH) {
        return false;
    }

    if (Object.is(left, right)) {
        return true;
    }

    if (typeof left !== typeof right) {
        return false;
    }

    if (left === null || right === null) {
        return false;
    }

    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right)) {
            return false;
        }

        if (markAndCheckSeenPair(left, right, seenPairs)) {
            return true;
        }

        if (left.length !== right.length) {
            return false;
        }

        return left.every((value, index) =>
            areEquivalentNodeValues(
                value,
                right[index],
                seenPairs,
                comparableKeysByObject,
                depth + 1
            )
        );
    }

    if (!isComparableRecord(left) || !isComparableRecord(right)) {
        return false;
    }

    if (markAndCheckSeenPair(left, right, seenPairs)) {
        return true;
    }

    const leftKeys = getCachedComparableKeys(left, comparableKeysByObject);
    const rightKeys = getCachedComparableKeys(right, comparableKeysByObject);
    const rightKeySet = new Set(rightKeys);

    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    if (leftKeys.some((key) => !setContainsValue(rightKeySet, key))) {
        return false;
    }

    return leftKeys.every((key) => {
        if (!objectHasOwn(left, key) || !objectHasOwn(right, key)) {
            return false;
        }

        return areEquivalentNodeValues(
            left[key],
            right[key],
            seenPairs,
            comparableKeysByObject,
            depth + 1
        );
    });
};

/**
 * Compare two expressions for structural equivalence after unwrapping
 * transparent TypeScript wrappers.
 *
 * @param left - Left-hand expression.
 * @param right - Right-hand expression.
 *
 * @returns `true` when both expressions are structurally equivalent.
 */
export const areEquivalentExpressions = (
    left: Readonly<TSESTree.Expression>,
    right: Readonly<TSESTree.Expression>
): boolean =>
    areEquivalentNodeValues(
        unwrapTransparentExpression(left),
        unwrapTransparentExpression(right)
    );

/**
 * Compare two type nodes for structural equivalence.
 *
 * @param left - Left-hand type node.
 * @param right - Right-hand type node.
 *
 * @returns `true` when both type nodes are structurally equivalent.
 */
export const areEquivalentTypeNodes = (
    left: Readonly<TSESTree.TypeNode>,
    right: Readonly<TSESTree.TypeNode>
): boolean => areEquivalentNodeValues(left, right);
