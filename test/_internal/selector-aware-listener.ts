/**
 * @packageDocumentation
 * Test utilities for resolving node listeners from selector-keyed visitor maps.
 */

/**
 * Resolve a listener function from a visitor map by node type.
 *
 * @remarks
 * Supports both plain keys (e.g. `CallExpression`) and selector keys (e.g.
 * `CallExpression[callee.type="MemberExpression"]`).
 */
export const getSelectorAwareNodeListener = (
    listenerMap: unknown,
    nodeType: string
): ((node: unknown) => void) | undefined => {
    if (typeof listenerMap !== "object" || listenerMap === null) {
        return undefined;
    }

    const listenerRecord = listenerMap as Readonly<Record<string, unknown>>;
    const directListener = listenerRecord[nodeType];

    if (typeof directListener === "function") {
        return directListener as (node: unknown) => void;
    }

    for (const [listenerKey, candidateListener] of Object.entries(
        listenerRecord
    )) {
        if (
            typeof candidateListener === "function" &&
            (listenerKey === nodeType ||
                listenerKey.startsWith(`${nodeType}[`) ||
                listenerKey.startsWith(`${nodeType}:`))
        ) {
            return candidateListener as (node: unknown) => void;
        }
    }

    return undefined;
};
