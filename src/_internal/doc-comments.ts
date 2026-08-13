/**
 * @packageDocumentation
 * Shared helpers for reading and updating type documentation block comments.
 */

import {
    AST_NODE_TYPES,
    AST_TOKEN_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import {
    arrayFirst,
    arrayIncludes,
    arrayJoin,
    isDefined,
    stringSplit,
} from "ts-extras";

const inlineTagPattern =
    /\{@(?<tagName>\p{Letter}[\p{Letter}\p{Number}\-_]*)\b/gv;
const paramTagPattern = /@param\s+(?<restParameter>\.\.\.)?(?<rawName>\S+)/gv;
const typeParamTagPattern = /@(?:template|typeParam)\s+(?<rawName>\S+)/gv;
const inlineLinkPrefix = "{@link";
const leadingCommentStarPattern = /^\s*\*/v;
const fencedCodeFencePrefix = "```";

const isAsciiLetter = (value: string): boolean => {
    const codePoint = value.codePointAt(0);

    if (!isDefined(codePoint)) {
        return false;
    }

    return (
        (codePoint >= 0x41 && codePoint <= 0x5a) ||
        (codePoint >= 0x61 && codePoint <= 0x7a)
    );
};

const isTagNameCharacter = (value: string): boolean => {
    const codePoint = value.codePointAt(0);

    if (!isDefined(codePoint)) {
        return false;
    }

    return (
        value === "-" ||
        value === "_" ||
        (codePoint >= 0x30 && codePoint <= 0x39) ||
        (codePoint >= 0x41 && codePoint <= 0x5a) ||
        (codePoint >= 0x61 && codePoint <= 0x7a)
    );
};

const getBlockTagMatchFromLine = (
    lineText: string
): null | {
    readonly end: number;
    readonly name: string;
    readonly start: number;
} => {
    let cursor = 0;

    while (
        cursor < lineText.length &&
        (lineText[cursor] === " " || lineText[cursor] === "\t")
    ) {
        cursor += 1;
    }

    if (lineText[cursor] === "*") {
        cursor += 1;

        while (
            cursor < lineText.length &&
            (lineText[cursor] === " " || lineText[cursor] === "\t")
        ) {
            cursor += 1;
        }
    }

    if (lineText[cursor] !== "@") {
        return null;
    }

    const nameStart = cursor + 1;
    const firstNameCharacter = lineText[nameStart];

    if (
        typeof firstNameCharacter !== "string" ||
        !isAsciiLetter(firstNameCharacter)
    ) {
        return null;
    }

    let nameEnd = nameStart + 1;

    while (nameEnd < lineText.length) {
        const nextCharacter = lineText[nameEnd];

        if (
            typeof nextCharacter !== "string" ||
            !isTagNameCharacter(nextCharacter)
        ) {
            break;
        }

        nameEnd += 1;
    }

    return {
        end: nameEnd,
        name: lineText.slice(nameStart, nameEnd),
        start: cursor,
    };
};

const normalizeTagNameToken = (rawName: string): string => {
    const normalizedName = rawName
        .replace(/^\[/v, "")
        .replace(/\]$/v, "")
        .trim();
    const equalsSignOffset = normalizedName.indexOf("=");

    return equalsSignOffset === -1
        ? normalizedName
        : normalizedName.slice(0, equalsSignOffset);
};

type LineTagMatch = Readonly<{
    end: number;
    name: string;
    start: number;
}>;

const trimTrailingCarriageReturn = (lineText: string): string =>
    lineText.endsWith("\r") ? lineText.slice(0, -1) : lineText;

const normalizeRawCommentLine = (lineText: string): string =>
    lineText.replace(leadingCommentStarPattern, "").trimStart();

const isFencedCodeDelimiterLine = (lineText: string): boolean =>
    normalizeRawCommentLine(lineText).startsWith(fencedCodeFencePrefix);

const getInlineTagMatchesFromLine = (
    lineText: string
): readonly LineTagMatch[] => {
    const inlineMatches: LineTagMatch[] = [];

    for (const inlineTagMatch of lineText.matchAll(inlineTagPattern)) {
        const inlineTagName = inlineTagMatch.groups?.["tagName"];
        const inlineTagIndex = inlineTagMatch.index;

        if (
            typeof inlineTagName !== "string" ||
            typeof inlineTagIndex !== "number"
        ) {
            continue;
        }

        // Inline tags match as "{@tag"; normalize ranges to start at '@'.
        const inlineTagStart = inlineTagIndex + 1;

        inlineMatches.push({
            end: inlineTagStart + inlineTagName.length + 1,
            name: inlineTagName,
            start: inlineTagStart,
        });
    }

    return inlineMatches;
};

const getTagMatchesFromLine = (lineText: string): readonly LineTagMatch[] => {
    const lineMatches: LineTagMatch[] = [];
    const blockTagMatch = getBlockTagMatchFromLine(lineText);

    if (blockTagMatch !== null) {
        lineMatches.push(blockTagMatch);
    }

    lineMatches.push(...getInlineTagMatchesFromLine(lineText));
    lineMatches.sort((left, right) => left.start - right.start);

    return lineMatches;
};

const getAbsoluteTagMatches = (
    lineMatches: readonly LineTagMatch[],
    commentStartOffset: number,
    lineStartOffset: number
): readonly DocTagMatch[] =>
    lineMatches.map((lineMatch) => {
        const absoluteStart =
            commentStartOffset + lineStartOffset + lineMatch.start;

        return {
            absoluteRange: [
                absoluteStart,
                absoluteStart + (lineMatch.end - lineMatch.start),
            ],
            name: lineMatch.name,
        };
    });

const getLineBreakLength = (
    rawLine: string,
    hasTrailingLineFeed: boolean
): number => {
    if (!hasTrailingLineFeed) {
        return 0;
    }

    return rawLine.endsWith("\r") ? 2 : 1;
};

/** Matched documentation tag with absolute source range. */
export type DocTagMatch = Readonly<{
    absoluteRange: readonly [number, number];
    name: string;
}>;

/** Matched inline link token with absolute source range. */
export type InlineLinkMatch = Readonly<{
    absoluteRange: readonly [number, number];
    content: string;
    fullText: string;
}>;

/** Determine preferred line ending from source text. */
export const getPreferredLineEnding = (
    sourceCode: TSESLint.SourceCode
): "\n" | "\r\n" => (sourceCode.text.includes("\r\n") ? "\r\n" : "\n");

/**
 * Get the closest leading documentation block comment attached to a node. A
 * comment is considered attached when it ends on the previous line.
 */
export const getLeadingDocComment = (
    sourceCode: TSESLint.SourceCode,
    node: TSESTree.Node
): null | TSESTree.Comment => {
    const comments = sourceCode.getCommentsBefore(node);
    const nodeStartLine = node.loc.start.line;

    for (let index = comments.length - 1; index >= 0; index -= 1) {
        const comment = comments[index];

        if (
            !isDefined(comment) ||
            comment.type !== AST_TOKEN_TYPES.Block ||
            !comment.value.startsWith("*")
        ) {
            continue;
        }

        const commentEndLine = comment.loc.end.line;

        if (commentEndLine === nodeStartLine - 1) {
            return comment;
        }

        if (commentEndLine < nodeStartLine - 1) {
            return null;
        }
    }

    return null;
};

/**
 * Resolve the node that should be used as the documentation anchor for leading
 * comments. Exported declarations are anchored on the parent export statement.
 */
export const getDocCommentAnchorNode = (node: TSESTree.Node): TSESTree.Node => {
    const { parent } = node;

    if (
        parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
        parent?.type === AST_NODE_TYPES.ExportNamedDeclaration
    ) {
        return parent;
    }

    return node;
};

const functionExpressionNodeTypes = [
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionExpression,
    AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
] as const;

const isFunctionExpressionNode = (node: Readonly<TSESTree.Node>): boolean =>
    arrayIncludes(functionExpressionNodeTypes, node.type);

/**
 * Resolve the declaration that owns documentation for a function-like node.
 *
 * Function expressions used as variable initializers are documented on the
 * variable declaration. Class methods and function-valued class properties are
 * documented on the class member. All other function-like declarations and
 * TypeScript signatures document themselves. Export wrappers are resolved last
 * so comments placed before an exported declaration remain attached correctly.
 */
export const getFunctionDocCommentTarget = (
    node: TSESTree.Node
): Readonly<{ docNode: TSESTree.Node; reportNode: TSESTree.Node }> => {
    if (!isFunctionExpressionNode(node)) {
        return {
            docNode: getDocCommentAnchorNode(node),
            reportNode: node,
        };
    }

    const { parent } = node;

    if (parent?.type === AST_NODE_TYPES.VariableDeclarator) {
        const variableDeclaration = parent.parent;

        return {
            docNode: getDocCommentAnchorNode(variableDeclaration),
            reportNode: variableDeclaration,
        };
    }

    if (
        parent?.type === AST_NODE_TYPES.MethodDefinition ||
        parent?.type === AST_NODE_TYPES.PropertyDefinition ||
        parent?.type === AST_NODE_TYPES.TSAbstractMethodDefinition
    ) {
        return {
            docNode: getDocCommentAnchorNode(parent),
            reportNode: parent,
        };
    }

    return {
        docNode: getDocCommentAnchorNode(node),
        reportNode: node,
    };
};

/** Normalize raw comment lines for lightweight parsing. */
export const normalizeDocCommentLines = (
    comment: Readonly<TSESTree.Comment>
): readonly string[] =>
    stringSplit(comment.value.replaceAll("\r\n", "\n"), "\n")
        .map((line) => line.replace(/^\s*\* ?/v, "").trimEnd())
        .map((line) => (line === "/" ? "" : line));

/** Collect all `@tag` matches from a comment with absolute ranges. */
export const getDocCommentTagMatches = (
    sourceCode: TSESLint.SourceCode,
    comment: Readonly<TSESTree.Comment>
): readonly DocTagMatch[] => {
    const commentText = sourceCode.getText(comment);
    const commentStartOffset = arrayFirst(comment.range);
    const matches: DocTagMatch[] = [];
    let isInFencedCodeBlock = false;
    let lineStartOffset = 0;
    const rawLines = stringSplit(commentText, "\n");

    // Walk the raw comment text line-by-line so we can:
    // 1) match block tags only at line starts,
    // 2) still support inline tags like {@link ...}, and
    // 3) ignore fenced code blocks where @-prefixed tokens are just code.
    for (const [lineIndex, rawLine] of rawLines.entries()) {
        const lineText = trimTrailingCarriageReturn(rawLine);

        if (isFencedCodeDelimiterLine(lineText)) {
            isInFencedCodeBlock = !isInFencedCodeBlock;
        } else if (isInFencedCodeBlock) {
            // Inside fenced blocks, `@` tokens are treated as code, not tags.
        } else {
            matches.push(
                ...getAbsoluteTagMatches(
                    getTagMatchesFromLine(lineText),
                    commentStartOffset,
                    lineStartOffset
                )
            );
        }

        const hasTrailingLineFeed = lineIndex < rawLines.length - 1;
        lineStartOffset +=
            lineText.length + getLineBreakLength(rawLine, hasTrailingLineFeed);
    }

    return matches;
};

/** Collect unique `@tag` names from a comment. */
export const getDocCommentTagNames = (
    sourceCode: TSESLint.SourceCode,
    comment: Readonly<TSESTree.Comment>
): ReadonlySet<string> => {
    const tagNames = new Set<string>();

    for (const match of getDocCommentTagMatches(sourceCode, comment)) {
        tagNames.add(match.name);
    }

    return tagNames;
};

/** Collect documented parameter names from `@param` tags in a comment. */
export const getDocCommentParamTagNameList = (
    comment: Readonly<TSESTree.Comment>
): readonly string[] => {
    const tagNames: string[] = [];
    const commentBody = arrayJoin(normalizeDocCommentLines(comment), "\n");

    for (const match of commentBody.matchAll(paramTagPattern)) {
        const isRestParameter = match.groups?.["restParameter"] === "...";
        const rawName = match.groups?.["rawName"];

        if (typeof rawName === "string") {
            const nameWithoutDefault = normalizeTagNameToken(rawName);

            if (nameWithoutDefault.length > 0) {
                tagNames.push(
                    isRestParameter
                        ? `...${nameWithoutDefault}`
                        : nameWithoutDefault
                );
            }
        }
    }

    return tagNames;
};

/** Collect documented parameter names from `@param` tags in a comment. */
export const getDocCommentParamTagNames = (
    comment: Readonly<TSESTree.Comment>
): ReadonlySet<string> => new Set(getDocCommentParamTagNameList(comment));

/**
 * Collect documented type-parameter names from `@typeParam`/`@template` tags.
 */
export const getDocCommentTypeParamTagNameList = (
    comment: Readonly<TSESTree.Comment>
): readonly string[] => {
    const tagNames: string[] = [];
    const commentBody = arrayJoin(normalizeDocCommentLines(comment), "\n");

    for (const match of commentBody.matchAll(typeParamTagPattern)) {
        const rawName = match.groups?.["rawName"];

        if (typeof rawName === "string") {
            const normalizedName = normalizeTagNameToken(rawName);

            if (normalizedName.length > 0) {
                tagNames.push(normalizedName);
            }
        }
    }

    return tagNames;
};

/**
 * Collect documented type-parameter names from `@typeParam`/`@template` tags.
 */
export const getDocCommentTypeParamTagNames = (
    comment: Readonly<TSESTree.Comment>
): ReadonlySet<string> => new Set(getDocCommentTypeParamTagNameList(comment));

/** Discriminated-union result from the inner brace-scanner helper. */
type InlineLinkScanResult =
    | Readonly<{ closingIndex: number; kind: "found" }>
    | Readonly<{ kind: "exhausted" }>
    | Readonly<{ kind: "linebreak" }>;

/**
 * Scan `text` forwards from `startOffset` looking for a closing `}`.
 *
 * Returns `"found"` with the closing index, `"linebreak"` if a line-ending is
 * encountered first, or `"exhausted"` if the string ends without finding
 * either. Extracted from `getInlineLinkMatches` to keep each function's
 * cognitive complexity within the allowed threshold.
 */
const scanForClosingBrace = (
    text: string,
    startOffset: number
): InlineLinkScanResult => {
    for (let index = startOffset; index < text.length; index += 1) {
        const character = text[index];

        if (character === "\n" || character === "\r") {
            return { kind: "linebreak" };
        }

        if (character === "}") {
            return { closingIndex: index, kind: "found" };
        }
    }

    return { kind: "exhausted" };
};

/** Collect all inline `{@link ...}` matches from a comment. */
export const getInlineLinkMatches = (
    sourceCode: TSESLint.SourceCode,
    comment: Readonly<TSESTree.Comment>
): readonly InlineLinkMatch[] => {
    const commentText = sourceCode.getText(comment);
    const matches: InlineLinkMatch[] = [];

    let searchStartIndex = 0;

    while (searchStartIndex < commentText.length) {
        const relativeStart = commentText.indexOf(
            inlineLinkPrefix,
            searchStartIndex
        );

        if (relativeStart === -1) {
            searchStartIndex = commentText.length;
        } else {
            const cursorStart = relativeStart + inlineLinkPrefix.length;
            const scan = scanForClosingBrace(commentText, cursorStart);

            if (scan.kind === "exhausted") {
                searchStartIndex = commentText.length;
            } else if (scan.kind === "found") {
                const fullMatch = commentText.slice(
                    relativeStart,
                    scan.closingIndex + 1
                );
                const content = commentText
                    .slice(cursorStart, scan.closingIndex)
                    .trimStart();
                const absoluteStart = arrayFirst(comment.range) + relativeStart;

                matches.push({
                    absoluteRange: [
                        absoluteStart,
                        absoluteStart + fullMatch.length,
                    ],
                    content,
                    fullText: fullMatch,
                });

                searchStartIndex = scan.closingIndex + 1;
            } else {
                // Linebreak encountered — skip the prefix and resume scanning.
                searchStartIndex = cursorStart;
            }
        }
    }

    return matches;
};

/**
 * Build insertion text for appending one or more `*`-prefixed lines at the end
 * of an existing block comment, immediately before the closing comment token.
 */
export const buildDocCommentTagInsertion = (
    comment: Readonly<TSESTree.Comment>,
    lineTexts: readonly string[],
    lineEnding: "\n" | "\r\n"
): string => {
    const indentWidth = comment.loc.start.column;
    const indentation = " ".repeat(indentWidth);
    const linePrefix = `${indentation} * `;

    return (
        linePrefix + arrayJoin(lineTexts, lineEnding + linePrefix) + lineEnding
    );
};

/**
 * Resolve the absolute insertion index for new tag lines in a block comment.
 * The insertion point is the beginning of the closing-comment line.
 */
export const getDocCommentClosingLineStartIndex = (
    sourceCode: TSESLint.SourceCode,
    comment: Readonly<TSESTree.Comment>
): number => {
    const commentText = sourceCode.getText(comment);
    const closingTokenOffset = commentText.lastIndexOf("*/");

    if (closingTokenOffset === -1) {
        return comment.range[1] - 2;
    }

    const beforeClosingTokenText = commentText.slice(0, closingTokenOffset);
    const lastLineBreakOffset = Math.max(
        beforeClosingTokenText.lastIndexOf("\n"),
        beforeClosingTokenText.lastIndexOf("\r")
    );

    if (lastLineBreakOffset < 0) {
        return comment.range[1] - 2;
    }

    return arrayFirst(comment.range) + lastLineBreakOffset + 1;
};
