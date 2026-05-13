import type { TSESTree } from "@typescript-eslint/utils";

import { arrayJoin, isDefined, stringSplit } from "ts-extras";

import { normalizeDocCommentLines } from "./doc-comments.js";

const nextTagLinePattern = /^\s*@\p{Letter}[\p{Letter}\p{Number}\-_]*/v;

type ParsedDocTagLine = Readonly<{
    tagName: string;
    tagText: string;
}>;

const isAsciiLetter = (character: string): boolean => {
    const codePoint = character.codePointAt(0);

    return (
        isDefined(codePoint) &&
        ((codePoint >= 65 && codePoint <= 90) ||
            (codePoint >= 97 && codePoint <= 122))
    );
};

const isDocTagNameCharacter = (character: string): boolean => {
    const codePoint = character.codePointAt(0);

    return (
        isDefined(codePoint) &&
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

    if (!isDefined(firstTagCharacter) || !isAsciiLetter(firstTagCharacter)) {
        return null;
    }

    let tagEndIndex = 2;

    while (tagEndIndex < line.length) {
        const character = line[tagEndIndex];

        if (!isDefined(character) || !isDocTagNameCharacter(character)) {
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

const codeFenceDelimiterLinePattern = /^(?:```|~~~)/v;

const isMarkdownDividerLine = (line: string): boolean => {
    const condensedLine = line.replaceAll(/\s+/gv, "");

    if (condensedLine.length < 3) {
        return false;
    }

    const dividerCharacter = condensedLine[0];

    if (
        !isDefined(dividerCharacter) ||
        (dividerCharacter !== "-" &&
            dividerCharacter !== "_" &&
            dividerCharacter !== "*")
    ) {
        return false;
    }

    for (const character of condensedLine) {
        if (character !== dividerCharacter) {
            return false;
        }
    }

    return true;
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

        if (!isDefined(line)) {
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

            if (!isDefined(continuationLine)) {
                continuationIndex += 1;
                continue;
            }

            if (nextTagLinePattern.test(continuationLine.trimStart())) {
                break;
            }

            continuationLines.push(continuationLine);
            continuationIndex += 1;
        }

        const continuationText = arrayJoin(continuationLines, "\n");

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
        .replace(/^\s*-\s*/v, "")
        .replace(/^\s*\{[^\{\}]+\}\s*/v, "")
        .trim();

    return normalizedDescription.length > 0;
};

/** Determine whether a block-tag body contains meaningful prose or code. */
export const hasMeaningfulTagBlockContent = (blockText: string): boolean => {
    const normalizedLines = stringSplit(
        blockText.replaceAll("\r\n", "\n"),
        "\n"
    )
        .map((line) => line.trim())
        .filter(
            (line) =>
                line.length > 0 &&
                !codeFenceDelimiterLinePattern.test(line) &&
                !isMarkdownDividerLine(line)
        )
        .map((line) =>
            line.replace(/^(?:[*+\-]|\d+\.)\s*/v, "").replace(/^>\s*/v, "")
        );

    return normalizedLines.some((line) => hasMeaningfulTagDescription(line));
};
