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

type QuoteCharacter =
    | "'"
    | "`"
    | '"';

type TypeAnnotationScanResult =
    | Readonly<{ kind: "closed" }>
    | Readonly<{ kind: "scanning"; state: TypeAnnotationScanState }>;

type TypeAnnotationScanState = Readonly<{
    braceDepth: number;
    isEscaped: boolean;
    quoteCharacter: null | QuoteCharacter;
}>;

const quoteCharacters = [
    '"',
    "'",
    "`",
] as const;

const isQuoteCharacter = (character: string): character is QuoteCharacter =>
    arrayIncludes(quoteCharacters, character);

/** Advance the quote-aware JSDoc type-annotation scanner by one character. */
const scanTypeAnnotationCharacter = (
    character: string,
    state: Readonly<TypeAnnotationScanState>
): TypeAnnotationScanResult => {
    if (state.quoteCharacter !== null) {
        if (state.isEscaped) {
            return {
                kind: "scanning",
                state: { ...state, isEscaped: false },
            };
        }

        if (character === "\\") {
            return {
                kind: "scanning",
                state: { ...state, isEscaped: true },
            };
        }

        return {
            kind: "scanning",
            state: {
                ...state,
                quoteCharacter:
                    character === state.quoteCharacter
                        ? null
                        : state.quoteCharacter,
            },
        };
    }

    if (isQuoteCharacter(character)) {
        return {
            kind: "scanning",
            state: { ...state, quoteCharacter: character },
        };
    }

    if (character === "{") {
        return {
            kind: "scanning",
            state: { ...state, braceDepth: state.braceDepth + 1 },
        };
    }

    if (character !== "}") {
        return { kind: "scanning", state };
    }

    const braceDepth = state.braceDepth - 1;

    return braceDepth === 0
        ? { kind: "closed" }
        : { kind: "scanning", state: { ...state, braceDepth } };
};

/** Find a balanced closing brace without applying quote semantics. */
const findBalancedClosingBrace = (
    text: string,
    annotationStart: number
): null | number => {
    let braceDepth = 0;

    for (let index = annotationStart; index < text.length; index += 1) {
        const character = text[index];
        const nextBraceDepth =
            character === "{"
                ? braceDepth + 1
                : character === "}"
                  ? braceDepth - 1
                  : braceDepth;

        if (character === "}" && nextBraceDepth === 0) {
            return index;
        }

        braceDepth = nextBraceDepth;
    }

    return null;
};

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

    let state: TypeAnnotationScanState = {
        braceDepth: 0,
        isEscaped: false,
        quoteCharacter: null,
    };

    for (let index = annotationStart; index < text.length; index += 1) {
        const character = text[index];

        if (isDefined(character)) {
            const scan = scanTypeAnnotationCharacter(character, state);

            if (scan.kind === "closed") {
                return text.slice(index + 1);
            }

            state = scan.state;
        }
    }

    // Preserve the permissive behavior of classic JSDoc type annotations when
    // a quote is malformed: braces still delimit the annotation if they can be
    // balanced without quote awareness.
    const fallbackClosingIndex = findBalancedClosingBrace(
        text,
        annotationStart
    );

    return fallbackClosingIndex === null
        ? text
        : text.slice(fallbackClosingIndex + 1);
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

        const parsedTagLine = isDefined(line)
            ? parseDocTagLine(line.trimStart())
            : null;

        if (parsedTagLine === null) {
            lineIndex += 1;
            continue;
        }

        const { tagName, tagText } = parsedTagLine;
        const continuationLines: string[] = [];
        let continuationIndex = lineIndex + 1;

        while (continuationIndex < lines.length) {
            const continuationLine = lines[continuationIndex];

            if (
                isDefined(continuationLine) &&
                nextTagLinePattern.test(continuationLine.trimStart())
            ) {
                break;
            }

            if (isDefined(continuationLine)) {
                continuationLines.push(continuationLine);
            }
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
