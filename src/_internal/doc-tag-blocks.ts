import type { TSESTree } from "@typescript-eslint/utils";

import { normalizeDocCommentLines } from "./doc-comments.js";

const docTagLinePattern = /^@([A-Za-z][\w-]*)(.*)$/u;
const nextTagLinePattern = /^\s*@[A-Za-z][\w-]*/u;

/** Parsed representation of one contiguous TypeDoc block-tag section. */
export type DocTagBlock = Readonly<{
    blockText: string;
    continuationText: string;
    tagName: string;
    tagText: string;
}>;

/**
 * Parse ordered `@tag` blocks from a normalized TypeDoc block comment.
 */
export const getDocCommentTagBlocks = (
    comment: Readonly<TSESTree.Comment>
): readonly DocTagBlock[] => {
    const lines = normalizeDocCommentLines(comment);
    const blocks: DocTagBlock[] = [];

    let lineIndex = 0;

    while (lineIndex < lines.length) {
        const line = lines[lineIndex];

        if (line === undefined) {
            lineIndex += 1;
            continue;
        }

        const trimmedLine = line.trimStart();
        const tagMatch = docTagLinePattern.exec(trimmedLine);

        if (tagMatch === null) {
            lineIndex += 1;
            continue;
        }

        const tagName = tagMatch[1];

        if (typeof tagName !== "string") {
            lineIndex += 1;
            continue;
        }

        const tagText = tagMatch[2] ?? "";
        const continuationLines: string[] = [];
        let continuationIndex = lineIndex + 1;

        while (continuationIndex < lines.length) {
            const continuationLine = lines[continuationIndex];

            if (continuationLine === undefined) {
                continuationIndex += 1;
                continue;
            }

            if (nextTagLinePattern.test(continuationLine.trimStart())) {
                break;
            }

            continuationLines.push(continuationLine);
            continuationIndex += 1;
        }

        const continuationText = continuationLines.join("\n");

        blocks.push({
            blockText:
                continuationText.length === 0
                    ? tagText
                    : `${tagText}\n${continuationText}`,
            continuationText,
            tagName,
            tagText,
        });

        lineIndex = continuationIndex;
    }

    return blocks;
};

/** Determine whether a tag description contains meaningful prose content. */
export const hasMeaningfulTagDescription = (
    descriptionText: string
): boolean => {
    const normalizedDescription = descriptionText
        .replace(/^\s*-\s*/u, "")
        .replace(/^\s*\{[^{}]+\}\s*/u, "")
        .trim();

    return normalizedDescription.length > 0;
};
