import type { TSESTree } from "@typescript-eslint/utils";

import { normalizeDocCommentLines } from "./doc-comments.js";

const nextTagLinePattern = /^\s*@[A-Za-z][\w-]*/u;

type ParsedDocTagLine = Readonly<{
    tagName: string;
    tagText: string;
}>;

const isAsciiLetter = (character: string): boolean => {
    const codePoint = character.codePointAt(0);

    return (
        codePoint !== undefined &&
        ((codePoint >= 65 && codePoint <= 90) ||
            (codePoint >= 97 && codePoint <= 122))
    );
};

const isDocTagNameCharacter = (character: string): boolean => {
    const codePoint = character.codePointAt(0);

    return (
        codePoint !== undefined &&
        (isAsciiLetter(character) ||
            (codePoint >= 48 && codePoint <= 57) ||
            character === "_" ||
            character === "-")
    );
};

const parseDocTagLine = (line: string): null | ParsedDocTagLine => {
    if (!line.startsWith("@")) {
        return null;
    }

    const firstTagCharacter = line[1];

    if (firstTagCharacter === undefined || !isAsciiLetter(firstTagCharacter)) {
        return null;
    }

    let tagEndIndex = 2;

    while (tagEndIndex < line.length) {
        const character = line[tagEndIndex];

        if (character === undefined || !isDocTagNameCharacter(character)) {
            break;
        }

        tagEndIndex += 1;
    }

    return {
        tagName: line.slice(1, tagEndIndex),
        tagText: line.slice(tagEndIndex),
    };
};

/** Parsed representation of one contiguous TypeDoc block-tag section. */
export type DocTagBlock = Readonly<{
    blockText: string;
    continuationText: string;
    tagName: string;
    tagText: string;
}>;

const codeFenceDelimiterLinePattern = /^(?:```|~~~)/u;

const isMarkdownDividerLine = (line: string): boolean => {
    const condensedLine = line.replaceAll(/\s+/gu, "");

    if (condensedLine.length < 3) {
        return false;
    }

    const dividerCharacter = condensedLine[0];

    return (
        dividerCharacter !== undefined &&
        (dividerCharacter === "-" ||
            dividerCharacter === "_" ||
            dividerCharacter === "*") &&
        [...condensedLine].every((character) => character === dividerCharacter)
    );
};

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
        const parsedTagLine = parseDocTagLine(trimmedLine);

        if (parsedTagLine === null) {
            lineIndex += 1;
            continue;
        }

        const { tagName, tagText } = parsedTagLine;
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

/** Determine whether a block-tag body contains meaningful prose or code. */
export const hasMeaningfulTagBlockContent = (blockText: string): boolean => {
    const normalizedLines = blockText
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(
            (line) =>
                line.length > 0 &&
                !codeFenceDelimiterLinePattern.test(line) &&
                !isMarkdownDividerLine(line)
        )
        .map((line) =>
            line.replace(/^(?:[*+-]|\d+\.)\s*/u, "").replace(/^>\s*/u, "")
        );

    return normalizedLines.some((line) => hasMeaningfulTagDescription(line));
};
