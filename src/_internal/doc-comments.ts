/**
 * @packageDocumentation
 * Shared comment-analysis helpers for TypeDoc-focused ESLint rules.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

const DOC_COMMENT_PREFIX_EXPRESSION = /^\*/u;
const LINE_ENDING_EXPRESSION = /\r\n/u;
const LINE_PREFIX_EXPRESSION = /^\s*\*?\s?/u;
const TAG_EXPRESSION = /@([A-Za-z][A-Za-z0-9-]*)/gu;
const INLINE_LINK_EXPRESSION = /\{@link([^}]*)\}/gu;
const PARAM_TAG_EXPRESSION =
    /^@param(?:\s+\{[^}]+\})?\s+(\.\.\.)?(\[[^\]]+\]|[A-Za-z_$][\w$]*)/u;

export type DocTagMatch = Readonly<{
    absoluteRange: readonly [number, number];
    name: string;
}>;

export type InlineLinkMatch = Readonly<{
    absoluteRange: readonly [number, number];
    content: string;
    fullText: string;
}>;

/**
 * Determine the preferred newline delimiter for fixer output.
 */
export const getPreferredLineEnding = (
    sourceCode: TSESLint.SourceCode
): "\n" | "\r\n" =>
    LINE_ENDING_EXPRESSION.test(sourceCode.text) ? "\r\n" : "\n";

/**
 * Resolve the nearest leading block doc comment for a node.
 */
export const getLeadingDocComment = (
    sourceCode: TSESLint.SourceCode,
    node: TSESTree.Node
): null | TSESTree.Comment => {
    const comments = sourceCode.getCommentsBefore(node);

    for (let index = comments.length - 1; index >= 0; index -= 1) {
        const comment = comments[index];

        if (comment === undefined) {
            continue;
        }

        if (comment.type !== "Block") {
            continue;
        }

        if (!DOC_COMMENT_PREFIX_EXPRESSION.test(comment.value)) {
            continue;
        }

        if (
            node.loc !== null &&
            comment.loc !== null &&
            node.loc.start.line - comment.loc.end.line > 1
        ) {
            continue;
        }

        return comment;
    }

    return null;
};

/**
 * Normalize a block doc comment into plain text lines without `*` prefixes.
 */
export const normalizeDocCommentLines = (
    comment: TSESTree.Comment
): readonly string[] =>
    comment.value
        .split(/\r?\n/gu)
        .map((line) => line.replace(LINE_PREFIX_EXPRESSION, "").trimEnd());

/**
 * Extract all `@tag` usages from a block comment with absolute source ranges.
 */
export const getDocCommentTagMatches = (
    sourceCode: TSESLint.SourceCode,
    comment: TSESTree.Comment
): readonly DocTagMatch[] => {
    const rawCommentText = sourceCode.getText(comment);
    const matches: DocTagMatch[] = [];

    for (const match of rawCommentText.matchAll(TAG_EXPRESSION)) {
        if (typeof match.index !== "number") {
            continue;
        }

        const [fullMatch, tagName] = match;

        if (typeof fullMatch !== "string" || typeof tagName !== "string") {
            continue;
        }

        const absoluteStart = comment.range[0] + match.index;
        const absoluteEnd = absoluteStart + fullMatch.length;

        matches.push({
            absoluteRange: [absoluteStart, absoluteEnd],
            name: tagName,
        });
    }

    return matches;
};

/**
 * Read the set of unique tag names used in a block doc comment.
 */
export const getDocCommentTagNames = (
    sourceCode: TSESLint.SourceCode,
    comment: TSESTree.Comment
): ReadonlySet<string> => {
    const tags = new Set<string>();

    for (const { name } of getDocCommentTagMatches(sourceCode, comment)) {
        tags.add(name);
    }

    return tags;
};

/**
 * Parse all `@param` names declared in a block doc comment.
 */
export const getDocCommentParamTagNames = (
    comment: TSESTree.Comment
): ReadonlySet<string> => {
    const names = new Set<string>();

    for (const line of normalizeDocCommentLines(comment)) {
        const match = PARAM_TAG_EXPRESSION.exec(line);

        if (match === null) {
            continue;
        }

        const isRestParameter = match[1] === "...";
        const rawName = match[2];

        if (typeof rawName !== "string") {
            continue;
        }

        const normalizedName = rawName
            .replace(/^\[|\]$/gu, "")
            .replace(/=.*/u, "")
            .trim();

        if (normalizedName.length === 0) {
            continue;
        }

        names.add(isRestParameter ? `...${normalizedName}` : normalizedName);
        names.add(normalizedName);
    }

    return names;
};

/**
 * Collect inline `{@link ...}` tags from a block doc comment.
 */
export const getInlineLinkMatches = (
    sourceCode: TSESLint.SourceCode,
    comment: TSESTree.Comment
): readonly InlineLinkMatch[] => {
    const rawCommentText = sourceCode.getText(comment);
    const matches: InlineLinkMatch[] = [];

    for (const match of rawCommentText.matchAll(INLINE_LINK_EXPRESSION)) {
        if (typeof match.index !== "number") {
            continue;
        }

        const [fullMatch, content] = match;

        if (typeof fullMatch !== "string" || typeof content !== "string") {
            continue;
        }

        const absoluteStart = comment.range[0] + match.index;
        const absoluteEnd = absoluteStart + fullMatch.length;

        matches.push({
            absoluteRange: [absoluteStart, absoluteEnd],
            content,
            fullText: fullMatch,
        });
    }

    return matches;
};

/**
 * Build insertion text for appending one or more `*`-prefixed lines at the end
 * of an existing block comment, immediately before the closing comment token.
 */
export const buildDocCommentTagInsertion = (
    comment: TSESTree.Comment,
    lineTexts: readonly string[],
    lineEnding: "\n" | "\r\n"
): string => {
    const indentWidth = comment.loc?.start.column ?? 0;
    const indentation = " ".repeat(indentWidth);

    return lineTexts
        .map((lineText) => `${lineEnding}${indentation} * ${lineText}`)
        .join("");
};
