/**
 * @packageDocumentation
 * Report malformed inline `{@link ...}` tags in TypeDoc comments.
 */

import { AST_TOKEN_TYPES, type TSESLint } from "@typescript-eslint/utils";
import { arrayJoin, stringSplit } from "ts-extras";

import { getInlineLinkMatches } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "malformedInlineLink" | "replaceWithPlaceholder";
type Options = readonly [];

const isMalformedInlineLinkContent = (rawContent: string): boolean => {
    const content = rawContent.trim();

    if (content.length === 0) {
        return true;
    }

    const [rawTarget = "", ...rawLabelParts] = stringSplit(content, "|");
    const target = rawTarget.trim();

    if (target.length === 0) {
        return true;
    }

    if (/\s/v.test(target)) {
        return true;
    }

    return (
        rawLabelParts.length > 0 &&
        arrayJoin(rawLabelParts, "|").trim().length === 0
    );
};

/** Rule implementation for malformed inline link detection. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create: (context) => {
        const { sourceCode } = context;

        return {
            Program: (): void => {
                for (const comment of sourceCode.getAllComments()) {
                    if (
                        comment.type !== AST_TOKEN_TYPES.Block ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    for (const inlineLinkMatch of getInlineLinkMatches(
                        sourceCode,
                        comment
                    )) {
                        if (
                            !isMalformedInlineLinkContent(
                                inlineLinkMatch.content
                            )
                        ) {
                            continue;
                        }

                        const [absoluteStart, absoluteEnd] =
                            inlineLinkMatch.absoluteRange;

                        context.report({
                            data: {
                                link: inlineLinkMatch.fullText,
                            },
                            loc: {
                                end: sourceCode.getLocFromIndex(absoluteEnd),
                                start: sourceCode.getLocFromIndex(
                                    absoluteStart
                                ),
                            },
                            messageId: "malformedInlineLink",
                            suggest: [
                                {
                                    fix: (fixer) =>
                                        fixer.replaceTextRange(
                                            [absoluteStart, absoluteEnd],
                                            "{@link reference}"
                                        ),
                                    messageId: "replaceWithPlaceholder",
                                },
                            ],
                        });
                    }
                }
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "disallow malformed inline {@link ...} tags in TypeDoc comments.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.minimal",
                "typedoc.configs.jsdoc",
                "typedoc.configs.markdown",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.all",
                "typedoc.configs.tsdoc",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-malformed-inline-links",
        },
        hasSuggestions: true,
        languages: ["js/js"],
        messages: {
            malformedInlineLink:
                "Inline link '{{link}}' is malformed. Provide a non-empty target and optional label (for example `{@link Symbol}` or `{@link Symbol|Label}`).",
            replaceWithPlaceholder:
                "Replace this malformed inline link with `{@link reference}` and then fill in the target.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-malformed-inline-links",
});

export default rule;
