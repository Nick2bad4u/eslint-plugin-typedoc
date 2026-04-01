import type { TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingSeeLinkOrUrl";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/**
 * Matches a URL (common scheme + `://`) or a `{@link ...}` inline-tag expression
 * anywhere within the see-tag block text.
 *
 * Using an explicit scheme alternation (rather than a generic character-class
 * quantifier) avoids super-linear backtracking when the regex cannot match.
 */
const seeLinkOrUrlPattern =
    /\{@link\b|(?:file|ftps?|git|https?|mailto|ssh|svn):\/\//u;

/** Rule implementation for requiring links or URLs in see-tag bodies. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            Program(): void {
                for (const comment of sourceCode.getAllComments()) {
                    if (
                        comment.type !== "Block" ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    for (const block of getDocCommentTagBlocks(comment)) {
                        if (block.tagName !== "see") {
                            continue;
                        }

                        // Only flag tags that have content but no URL or link.
                        // Empty @see tags are handled by no-empty-see-tag.
                        if (!hasMeaningfulTagBlockContent(block.blockText)) {
                            continue;
                        }

                        if (seeLinkOrUrlPattern.test(block.blockText)) {
                            continue;
                        }

                        context.report({
                            loc: comment.loc,
                            messageId: "missingSeeLinkOrUrl",
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
                "require `@see` tags to contain a URL or a `{@link}` reference.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-see-tag-link",
        },
        messages: {
            missingSeeLinkOrUrl:
                "`@see` tags must contain a URL (`https://...`) or a `{@link}` expression. Use `{@link SomeSymbol}` for TypeScript cross-references.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "require-see-tag-link",
});

export default rule;
