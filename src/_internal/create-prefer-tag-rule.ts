/**
 * @packageDocumentation
 * Factory for rules that enforce a canonical tag name over a deprecated alias.
 */

import {
    AST_TOKEN_TYPES,
    type ESLintUtils,
    type TSESLint,
} from "@typescript-eslint/utils";

import { getDocCommentTagMatches } from "./doc-comments.js";
import { createTypedRule, type TypedocRuleDocs } from "./typed-rule.js";

/** Configuration for a prefer-tag rule created by this helper. */
export type PreferTagRuleConfig<TMessageId extends string> = Readonly<{
    /**
     * The deprecated tag name to replace (without `@`).
     */
    fromTag: string;

    /**
     * The message ID to report on detection, must match a key in
     * `meta.messages`.
     */
    messageId: TMessageId;

    /** Full rule metadata including messages, docs, and schema. */
    meta: ESLintUtils.RuleWithMetaAndName<
        Options,
        TMessageId,
        TypedocRuleDocs
    >["meta"];

    /** Canonical ESLint rule name (e.g. `"prefer-package-documentation-tag"`). */
    name: string;

    /**
     * The canonical tag name to enforce (without `@`).
     */
    toTag: string;
}>;

type Options = readonly [];

/**
 * Creates an ESLint rule that enforces a canonical tag name over a deprecated
 * alias.
 *
 * The rule scans every JSDoc block comment in a file, finds any occurrence of
 * the configured deprecated tag name, and reports it with an autofix that
 * replaces it with the configured canonical tag name.
 */
export function createPreferTagRule<TMessageId extends string>(
    config: PreferTagRuleConfig<TMessageId>
): TSESLint.RuleModule<TMessageId, Options> & { name: string } {
    const { fromTag, messageId, meta, name, toTag } = config;

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

                        const tagMatches = getDocCommentTagMatches(
                            sourceCode,
                            comment
                        );

                        for (const tagMatch of tagMatches) {
                            if (tagMatch.name !== fromTag) {
                                continue;
                            }

                            const [absoluteStart, absoluteEnd] =
                                tagMatch.absoluteRange;

                            context.report({
                                data: {
                                    tag: `@${fromTag}`,
                                },
                                fix: (fixer) =>
                                    fixer.replaceTextRange(
                                        [
                                            absoluteStart + 1,
                                            absoluteStart +
                                                1 +
                                                tagMatch.name.length,
                                        ],
                                        toTag
                                    ),
                                loc: {
                                    end: sourceCode.getLocFromIndex(
                                        absoluteEnd
                                    ),
                                    start: sourceCode.getLocFromIndex(
                                        absoluteStart
                                    ),
                                },
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
