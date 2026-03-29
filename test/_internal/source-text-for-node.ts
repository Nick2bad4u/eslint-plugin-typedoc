/**
 * @packageDocumentation
 * Shared helper for retrieving source slices by ESTree-compatible node range.
 */

/**
 * Return source text for a node when a valid `[start, end]` range exists.
 *
 * @param options - Source text and candidate node.
 *
 * @returns Sliced source text for the node range, or an empty string when the
 *   node is malformed or range-less.
 */
export const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return "";
    }

    const nodeRange = (
        node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (nodeRange === undefined) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};
