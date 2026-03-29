/**
 * @packageDocumentation
 * Shared Floyd-cycle-guarded linked-structure traversal utilities.
 */

/**
 * Result shape returned by linked-structure searches.
 */
export type LinkedStructureLookupResult<Value> =
    | Readonly<{
          found: false;
      }>
    | Readonly<{
          found: true;
          value: Value;
      }>;

/**
 * Fast-pointer hop count per iteration for Floyd cycle detection.
 */
const FLOYD_FAST_POINTER_ADVANCE_STEPS = 2 as const;

/**
 * Resolve the first matching value while traversing a linked structure.
 *
 * @param options - Linked-structure traversal options.
 *
 *   - `startNode`: Initial node to inspect.
 *   - `getNextNode`: Function that returns the next node in the chain.
 *   - `resolveValue`: Function that returns a lookup result for the current node.
 *
 * @returns Lookup result for the first resolved value; otherwise a non-matching
 *   lookup result when traversal reaches the chain end or detects a
 *   parent-cycle.
 */
export const resolveFirstValueInLinkedStructure = <Node, Value>({
    getNextNode,
    resolveValue,
    startNode,
}: Readonly<{
    getNextNode: (node: Node) => Node | null;
    resolveValue: (node: Node) => LinkedStructureLookupResult<Value>;
    startNode: Node | null;
}>): LinkedStructureLookupResult<Value> => {
    let slowNode = startNode;
    let fastNode = startNode;

    while (slowNode !== null) {
        const resolvedValue = resolveValue(slowNode);

        if (resolvedValue.found) {
            return resolvedValue;
        }

        slowNode = getNextNode(slowNode);

        for (let step = 0; step < FLOYD_FAST_POINTER_ADVANCE_STEPS; step += 1) {
            if (fastNode === null) {
                break;
            }

            fastNode = getNextNode(fastNode);
        }

        if (slowNode !== null && fastNode !== null && slowNode === fastNode) {
            return {
                found: false,
            };
        }
    }

    return {
        found: false,
    };
};

/**
 * Check whether any node in a linked structure satisfies a predicate.
 *
 * @param options - Linked-structure traversal options.
 *
 *   - `startNode`: Initial node to inspect.
 *   - `getNextNode`: Function that returns the next node in the chain.
 *   - `isMatch`: Predicate used to test each visited node.
 *
 * @returns `true` when any visited node matches; otherwise `false`.
 */
export const isAnyLinkedStructureNodeMatching = <Node>({
    getNextNode,
    isMatch,
    startNode,
}: Readonly<{
    getNextNode: (node: Node) => Node | null;
    isMatch: (node: Node) => boolean;
    startNode: Node | null;
}>): boolean =>
    resolveFirstValueInLinkedStructure({
        getNextNode,
        resolveValue: (node): LinkedStructureLookupResult<boolean> =>
            isMatch(node)
                ? {
                      found: true,
                      value: true,
                  }
                : {
                      found: false,
                  },
        startNode,
    }).found;
