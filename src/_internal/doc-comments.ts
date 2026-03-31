/**
 * @packageDocumentation
 * Shared helpers for reading and updating type documentation block comments.
 */

import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

const docTagPattern = /@(?<tagName>[A-Za-z][\w-]*)/gu;
const paramTagPattern = /@param\s+(?<restParameter>\.\.\.)?(?<rawName>\S+)/gu;
const typeParamTagPattern = /@(?:template|typeParam)\s+(?<rawName>\S+)/gu;
const inlineLinkPrefix = "{@link";

const normalizeTagNameToken = (rawName: string): string => {
    const normalizedName = rawName
        .replace(/^\[/u, "")
        .replace(/\]$/u, "")
        .trim();
    const equalsSignOffset = normalizedName.indexOf("=");

    return equalsSignOffset === -1
        ? normalizedName
        : normalizedName.slice(0, equalsSignOffset);
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
    const nodeStartLine = node.loc?.start.line;

    if (nodeStartLine === undefined) {
        return null;
    }

    for (let index = comments.length - 1; index >= 0; index -= 1) {
        const comment = comments[index];

        if (comment?.type !== "Block") {
            continue;
        }

        if (!comment.value.startsWith("*")) {
            continue;
        }

        const commentEndLine = comment.loc?.end.line;

        if (commentEndLine === undefined) {
            continue;
        }

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

/** Normalize raw comment lines for lightweight parsing. */
export const normalizeDocCommentLines = (
    comment: Readonly<TSESTree.Comment>
): readonly string[] =>
    comment.value
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => line.replace(/^\s*\* ?/u, "").trimEnd())
        .map((line) => (line === "/" ? "" : line));

/** Collect all `@tag` matches from a comment with absolute ranges. */
export const getDocCommentTagMatches = (
    sourceCode: TSESLint.SourceCode,
    comment: Readonly<TSESTree.Comment>
): readonly DocTagMatch[] => {
    const commentText = sourceCode.getText(comment);
    const matches: DocTagMatch[] = [];

    for (const match of commentText.matchAll(docTagPattern)) {
        const fullMatch = match[0];
        const tagName = match.groups?.["tagName"];
        const relativeStart = match.index;

        if (
            typeof fullMatch !== "string" ||
            typeof tagName !== "string" ||
            typeof relativeStart !== "number"
        ) {
            continue;
        }

        const absoluteStart = comment.range[0] + relativeStart;

        matches.push({
            absoluteRange: [absoluteStart, absoluteStart + fullMatch.length],
            name: tagName,
        });
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
    const commentBody = normalizeDocCommentLines(comment).join("\n");

    for (const match of commentBody.matchAll(paramTagPattern)) {
        const isRestParameter = match.groups?.["restParameter"] === "...";
        const rawName = match.groups?.["rawName"];

        if (typeof rawName !== "string") {
            continue;
        }

        const nameWithoutDefault = normalizeTagNameToken(rawName);

        if (nameWithoutDefault.length === 0) {
            continue;
        }

        tagNames.push(
            isRestParameter ? `...${nameWithoutDefault}` : nameWithoutDefault
        );
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
    const commentBody = normalizeDocCommentLines(comment).join("\n");

    for (const match of commentBody.matchAll(typeParamTagPattern)) {
        const rawName = match.groups?.["rawName"];

        if (typeof rawName !== "string") {
            continue;
        }

        const normalizedName = normalizeTagNameToken(rawName);

        if (normalizedName.length === 0) {
            continue;
        }

        tagNames.push(normalizedName);
    }

    return tagNames;
};

/**
 * Collect documented type-parameter names from `@typeParam`/`@template` tags.
 */
export const getDocCommentTypeParamTagNames = (
    comment: Readonly<TSESTree.Comment>
): ReadonlySet<string> => new Set(getDocCommentTypeParamTagNameList(comment));

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
            break;
        }

        let cursor = relativeStart + inlineLinkPrefix.length;
        let didReachLineBreak = false;

        while (cursor < commentText.length) {
            const currentCharacter = commentText[cursor];

            if (currentCharacter === undefined) {
                break;
            }

            if (currentCharacter === "\n" || currentCharacter === "\r") {
                didReachLineBreak = true;
                break;
            }

            if (currentCharacter === "}") {
                const fullMatch = commentText.slice(relativeStart, cursor + 1);
                const content = commentText
                    .slice(relativeStart + inlineLinkPrefix.length, cursor)
                    .trimStart();
                const absoluteStart = comment.range[0] + relativeStart;

                matches.push({
                    absoluteRange: [
                        absoluteStart,
                        absoluteStart + fullMatch.length,
                    ],
                    content,
                    fullText: fullMatch,
                });

                searchStartIndex = cursor + 1;
                break;
            }

            cursor += 1;
        }

        if (cursor >= commentText.length) {
            break;
        }

        if (didReachLineBreak) {
            searchStartIndex = relativeStart + inlineLinkPrefix.length;
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
    const indentWidth = comment.loc?.start.column ?? 0;
    const indentation = " ".repeat(indentWidth);
    const linePrefix = `${indentation} * `;

    return linePrefix + lineTexts.join(lineEnding + linePrefix) + lineEnding;
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

    return comment.range[0] + lastLineBreakOffset + 1;
};
