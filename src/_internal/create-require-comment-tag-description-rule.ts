import { AST_TOKEN_TYPES, type TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "./doc-tag-blocks.js";
import { createTypedRule, type TypedRuleMeta } from "./typed-rule.js";

/** Configuration for a generated tag-description rule. */
export type RequireCommentTagDescriptionRuleConfig<TMessageId extends string> =
    Readonly<{
        /** The message ID to report when the tag is missing content. */
        messageId: TMessageId;

        /** Full rule metadata including messages, docs, and schema. */
        meta: TypedRuleMeta<Options, TMessageId>;

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
                            comment.type !== AST_TOKEN_TYPES.Block ||
                            !comment.value.startsWith("*")
                        ) {
                            continue;
                        }

                        for (const block of getDocCommentTagBlocks(comment)) {
                            if (
                                block.tagName === tagName &&
                                !hasMeaningfulTagBlockContent(block.blockText)
                            ) {
                                context.report({
                                    loc: comment.loc,
                                    messageId,
                                    node: sourceCode.ast,
                                });
                            }
                        }
                    }
                },
            };
        },
        meta,
        name,
    });
}
