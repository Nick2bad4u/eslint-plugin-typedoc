/**
 * @packageDocumentation
 * Factory for rules that require doc-comment tags to have meaningful content.
 */

import type { ESLintUtils, TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "./doc-tag-blocks.js";
import { createTypedRule, type TypedocRuleDocs } from "./typed-rule.js";

/**
 * Configuration for a rule created via
 * {@link createRequireCommentTagDescriptionRule}.
 */
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

        /**
         * The tag name to check (without `@`).
         *
         * @example Deprecated
         */
        tagName: string;
    }>;

type Options = readonly [];

/**
 * Creates an ESLint rule that requires a specific JSDoc block-comment tag to
 * have meaningful content.
 *
 * The rule walks every JSDoc block comment across the whole file (via the
 * `Program` visitor) and reports any occurrence of `@{tagName}` whose body
 * fails the {@link hasMeaningfulTagBlockContent} check.
 *
 * @param config - Rule configuration including the target tag, message ID, and
 *   metadata.
 *
 * @returns A fully-configured ESLint rule module.
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
