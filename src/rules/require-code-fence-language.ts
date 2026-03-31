import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createTypedRule } from "../_internal/typed-rule.js";

type LineWithOffset = Readonly<{
    text: string;
    textStartOffset: number;
}>;
type MessageIds = "missingFenceLanguage";

type Options = readonly [];

const defaultOptions = [] as const satisfies Options;
const lineBreakPattern = /\r\n|\n|\r/gu;

const hasDocFencePrefix = (prefix: string): boolean => {
    const trimmedPrefix = prefix.trimStart();

    if (trimmedPrefix.length === 0) {
        return true;
    }

    if (!trimmedPrefix.startsWith("*")) {
        return false;
    }

    return trimmedPrefix.slice(1).trim().length === 0;
};

const splitTextIntoLinesWithOffsets = (
    text: string
): readonly LineWithOffset[] => {
    const lines: LineWithOffset[] = [];
    let textCursor = 0;

    for (const match of text.matchAll(lineBreakPattern)) {
        const lineEndOffset = match.index;

        if (typeof lineEndOffset !== "number") {
            continue;
        }

        lines.push({
            text: text.slice(textCursor, lineEndOffset),
            textStartOffset: textCursor,
        });

        textCursor = lineEndOffset + match[0].length;
    }

    lines.push({
        text: text.slice(textCursor),
        textStartOffset: textCursor,
    });

    return lines;
};

const isDocComment = (comment: Readonly<TSESTree.Comment>): boolean =>
    comment.type === "Block" && comment.value.startsWith("*");

const findMissingFenceLanguageRanges = (
    sourceCode: TSESLint.SourceCode,
    comment: Readonly<TSESTree.Comment>
): readonly (readonly [number, number])[] => {
    const commentText = sourceCode.getText(comment);
    const lines = splitTextIntoLinesWithOffsets(commentText);
    const ranges: [number, number][] = [];
    let insideFence = false;

    for (const line of lines) {
        const fenceOffset = line.text.indexOf("```");

        if (fenceOffset === -1) {
            continue;
        }

        const prefix = line.text.slice(0, fenceOffset);

        if (!hasDocFencePrefix(prefix)) {
            continue;
        }

        const fenceSuffix = line.text.slice(fenceOffset + 3).trim();

        if (!insideFence) {
            if (fenceSuffix.length === 0) {
                const absoluteStart =
                    comment.range[0] + line.textStartOffset + fenceOffset;

                ranges.push([absoluteStart, absoluteStart + 3]);
            }

            insideFence = true;
            continue;
        }

        if (fenceSuffix.length === 0) {
            insideFence = false;
        }
    }

    return ranges;
};

/**
 * Rule implementation for requiring code-fence languages in doc-comment
 * Markdown.
 */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            Program(): void {
                for (const comment of sourceCode.getAllComments()) {
                    if (!isDocComment(comment)) {
                        continue;
                    }

                    const ranges = findMissingFenceLanguageRanges(
                        sourceCode,
                        comment
                    );

                    for (const [absoluteStart, absoluteEnd] of ranges) {
                        context.report({
                            fix: (fixer) =>
                                fixer.replaceTextRange(
                                    [absoluteStart, absoluteEnd],
                                    "```ts"
                                ),
                            loc: {
                                end: sourceCode.getLocFromIndex(absoluteEnd),
                                start: sourceCode.getLocFromIndex(
                                    absoluteStart
                                ),
                            },
                            messageId: "missingFenceLanguage",
                            node: sourceCode.ast,
                        });
                    }
                }
            },
        };
    },
    defaultOptions,
    meta: {
        deprecated: false,
        docs: {
            description:
                "require Markdown fenced code blocks in TypeDoc comments to declare a language.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-code-fence-language",
        },
        fixable: "code",
        messages: {
            missingFenceLanguage:
                "Markdown fenced code blocks in TypeDoc comments should declare a language (for example: ```ts).",
        },
        schema: [],
        type: "suggestion",
    },
    name: "require-code-fence-language",
});

export default rule;
