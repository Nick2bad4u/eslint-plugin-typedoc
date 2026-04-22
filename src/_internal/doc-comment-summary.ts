import type { TSESTree } from "@typescript-eslint/utils";

import { arrayJoin } from "ts-extras";

import { normalizeDocCommentLines } from "./doc-comments.js";

/** Collect the summary lines that appear before the first block tag. */
export const getDocCommentSummaryLines = (
    comment: Readonly<TSESTree.Comment>
): readonly string[] => {
    const summaryLines: string[] = [];

    for (const line of normalizeDocCommentLines(comment)) {
        if (line.trim().startsWith("@")) {
            break;
        }

        summaryLines.push(line);
    }

    return summaryLines;
};

/** Get the leading summary text that appears before block tags. */
export const getDocCommentSummaryText = (
    comment: Readonly<TSESTree.Comment>
): string => arrayJoin(getDocCommentSummaryLines(comment), "\n");

/** Determine whether a summary contains meaningful prose content. */
export const hasMeaningfulDocCommentSummary = (
    comment: Readonly<TSESTree.Comment>
): boolean => {
    const normalizedSummary = getDocCommentSummaryText(comment)
        .replace(/^\s*-\s*/u, "")
        .replace(/^\s*\{[^{}]+\}\s*/u, "")
        .trim();

    return normalizedSummary.length > 0;
};
