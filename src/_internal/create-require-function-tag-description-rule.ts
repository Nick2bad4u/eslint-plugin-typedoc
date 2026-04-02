/**
 * @packageDocumentation
 * Factory for rules that require function-level doc-comment tags to have
 * descriptions.
 */

import {
    AST_NODE_TYPES,
    type ESLintUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getLeadingDocComment,
} from "./doc-comments.js";
import {
    getDocCommentTagBlocks,
    hasMeaningfulTagDescription,
} from "./doc-tag-blocks.js";
import { createTypedRule, type TypedocRuleDocs } from "./typed-rule.js";

type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/**
 * Configuration for a rule created via
 * {@link createRequireFunctionTagDescriptionRule}.
 */
export type RequireFunctionTagDescriptionRuleConfig<TMessageId extends string> =
    Readonly<{
        /** The message ID to report when the tag lacks a description. */
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
         * Tag names to look for (without `@`). Multiple alternatives may be
         * provided for tags that have a canonical and a legacy spelling.
         *
         * @example Returns , "return"
         */
        tagNames: readonly string[];
    }>;

/**
 * Creates an ESLint rule that requires function-level JSDoc tags to carry
 * meaningful descriptions.
 *
 * The rule visits every function-like node in the AST, retrieves the leading
 * JSDoc comment, and checks whether any tag whose name is in `tagNames` is
 * present but lacks description text (as defined by
 * {@link hasMeaningfulTagDescription}).
 *
 * Visited node types:
 *
 * - `ArrowFunctionExpression`
 * - `FunctionDeclaration`
 * - `FunctionExpression`
 * - `MethodDefinition` (only when the value is a function expression)
 * - `TSDeclareFunction`
 *
 * @param config - Rule configuration including tag names, message ID, and
 *   metadata.
 *
 * @returns A fully-configured ESLint rule module.
 */
export function createRequireFunctionTagDescriptionRule<
    TMessageId extends string,
>(
    config: RequireFunctionTagDescriptionRuleConfig<TMessageId>
): TSESLint.RuleModule<TMessageId, Options> & { name: string } {
    const { messageId, meta, name, tagNames } = config;

    return createTypedRule<Options, TMessageId>({
        create(context) {
            const sourceCode = context.sourceCode;

            const checkNode = (
                reportNode: TSESTree.Node,
                docNode: TSESTree.Node
            ): void => {
                const docComment = getLeadingDocComment(sourceCode, docNode);

                if (docComment === null) {
                    return;
                }

                let hasTag = false;
                let hasMissingDescription = false;

                for (const block of getDocCommentTagBlocks(docComment)) {
                    if (!tagNames.includes(block.tagName)) {
                        continue;
                    }

                    hasTag = true;

                    if (!hasMeaningfulTagDescription(block.blockText)) {
                        hasMissingDescription = true;
                    }
                }

                if (!hasTag || !hasMissingDescription) {
                    return;
                }

                context.report({
                    messageId,
                    node: reportNode,
                });
            };

            return {
                ArrowFunctionExpression: (node): void => {
                    checkNode(node, node);
                },
                FunctionDeclaration: (node): void => {
                    checkNode(node, getDocCommentAnchorNode(node));
                },
                FunctionExpression: (node): void => {
                    checkNode(node, node);
                },
                MethodDefinition: (node): void => {
                    if (
                        node.value.type !== AST_NODE_TYPES.FunctionExpression &&
                        node.value.type !==
                            AST_NODE_TYPES.TSEmptyBodyFunctionExpression
                    ) {
                        return;
                    }

                    checkNode(node, node);
                },
                TSDeclareFunction: (node): void => {
                    checkNode(node, getDocCommentAnchorNode(node));
                },
            };
        },
        defaultOptions,
        meta,
        name,
    });
}
