import type { TSESTree } from "@typescript-eslint/utils";

import { arrayIncludes, arrayJoin, isDefined, stringSplit } from "ts-extras";

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

type QuoteCharacter = "'" | "`" | '"';

const quoteCharacters = [
    '"',
    "'",
    "`",
] as const;

const isQuoteCharacter = (character: string): character is QuoteCharacter =>
    arrayIncludes(quoteCharacters, character);

/**
 * Remove one optional leading JSDoc type annotation from tag text.
 *
 * The scanner balances nested braces and ignores braces inside quoted type
 * fragments. Unbalanced annotations are preserved so malformed input fails
 * gracefully instead of discarding potential prose.
 */
export const stripOptionalJSDocTypeAnnotation = (text: string): string => {
    const annotationStart = text.search(/\S/v);

    if (
        annotationStart === -1 ||
        text[annotationStart] !== "{" ||
        text[annotationStart + 1] === "@"
    ) {
        return text;
    }

    let braceDepth = 0;
    let isEscaped = false;
    let quoteCharacter: null | QuoteCharacter = null;

    for (let index = annotationStart; index < text.length; index += 1) {
        const character = text[index];

        if (!isDefined(character)) {
            break;
        }

        if (quoteCharacter !== null) {
            if (isEscaped) {
                isEscaped = false;
            } else if (character === "\\") {
                isEscaped = true;
            } else if (character === quoteCharacter) {
                quoteCharacter = null;
            }

            continue;
        }

        if (isQuoteCharacter(character)) {
            quoteCharacter = character;
            continue;
        }

        if (character === "{") {
            braceDepth += 1;
            continue;
        }

        if (character !== "}") {
            continue;
        }

        braceDepth -= 1;

        if (braceDepth === 0) {
            return text.slice(index + 1);
        }
    }

    // Preserve the permissive behavior of classic JSDoc type annotations when
    // a quote is malformed: braces still delimit the annotation if they can be
    // balanced without quote awareness.
    braceDepth = 0;

    for (let index = annotationStart; index < text.length; index += 1) {
        const character = text[index];

        if (character === "{") {
            braceDepth += 1;
        } else if (character === "}") {
            braceDepth -= 1;

            if (braceDepth === 0) {
                return text.slice(index + 1);
            }
        }
    }

    return text;
};

const parseDocTagLine = (line: string): null | ParsedDocTagLine => {
    if (!line.startsWith("@")) {
        return null;
    }

    const firstTagCharacter = line.at(1);

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

    const dividerCharacter = condensedLine.at(0);

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
    const normalizedDescription = stripOptionalJSDocTypeAnnotation(
        descriptionText.replace(/^\s*-\s*/v, "")
    )
        .replace(/^\s*-\s*/v, "")
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
