import type { TSESTree } from "@typescript-eslint/utils";

import { arrayJoin } from "ts-extras";

import { normalizeDocCommentLines } from "./doc-comments.js";

/** Collect the summary lines that appear before the first block tag. */
const getDocCommentSummaryLines = (
    comment: Readonly<TSESTree.Comment>
): readonly string[] => {
    const summaryLines: string[] = [];

    for (const line of normalizeDocCommentLines(comment)) {
        if (line.trimStart().startsWith("@")) {
            break;
        }

        summaryLines.push(line);
    }

    return summaryLines;
};

/** Get the leading summary text that appears before block tags. */
const getDocCommentSummaryText = (
    comment: Readonly<TSESTree.Comment>
): string => arrayJoin(getDocCommentSummaryLines(comment), "\n");

/** Determine whether a summary contains meaningful prose content. */
export const hasMeaningfulDocCommentSummary = (
    comment: Readonly<TSESTree.Comment>
): boolean => {
    const normalizedSummary = getDocCommentSummaryText(comment)
        .replace(/^\s*-\s*/v, "")
        .replace(/^\s*\{[^\{\}]+\}\s*/v, "")
        .trim();

    return normalizedSummary.length > 0;
};
