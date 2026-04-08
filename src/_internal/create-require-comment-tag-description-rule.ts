import type { ESLintUtils, TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "./doc-tag-blocks.js";
import { createTypedRule, type TypedocRuleDocs } from "./typed-rule.js";

/** Configuration for a generated tag-description rule. */
export type RequireCommentTagDescriptionRuleConfig<TMessageId extends string> =
    Readonly<{
        /** The message ID to report when the tag is missing content. */
        messageId: TMessageId;

        /** Full rule metadata including messages, docs, and schema. */
        meta: ESLintUtils.RuleWithMetaAndName<
            Options,
            TMessageId,
            TypedocRuleDocs
        >["meta"];

        /** Canonical ESLint rule name. */
        name: string;

        /** Target tag name without a leading at-sign. */
        tagName: string;
    }>;

type Options = readonly [];

/**
 * Creates an ESLint rule that requires configured tag blocks to include
 * meaningful descriptive text.
 */
export function createRequireCommentTagDescriptionRule<
    TMessageId extends string,
>(
    config: RequireCommentTagDescriptionRuleConfig<TMessageId>
): TSESLint.RuleModule<TMessageId, Options> & { name: string } {
    const { messageId, meta, name, tagName } = config;

    return createTypedRule<Options, TMessageId>({
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
                            if (block.tagName !== tagName) {
                                continue;
                            }

                            if (hasMeaningfulTagBlockContent(block.blockText)) {
                                continue;
                            }

                            context.report({
                                loc: comment.loc,
                                messageId,
                                node: sourceCode.ast,
                            });
                        }
                    }
                },
            };
        },
        meta,
        name,
    });
}
