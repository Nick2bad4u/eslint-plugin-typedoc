/**
 * @packageDocumentation
 * Factory for rules that require function-level doc-comment tags to have
 * descriptions.
 */

import type { ESLintUtils, TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayIncludes } from "ts-extras";

import {
    getFunctionDocCommentTarget,
    getLeadingDocComment,
} from "./doc-comments.js";
import {
    getDocCommentTagBlocks,
    hasMeaningfulTagDescription,
} from "./doc-tag-blocks.js";
import { createTypedRule, type TypedocRuleDocs } from "./typed-rule.js";

/** Configuration for a generated function-tag description rule. */
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
         */
        tagNames: readonly string[];
    }>;

type Options = readonly [];

/**
 * Creates an ESLint rule that requires function-level JSDoc tags to carry
 * meaningful descriptions.
 *
 * The rule visits every function-like node in the AST, retrieves the leading
 * JSDoc comment, and checks whether any tag whose name is in `tagNames` is
 * present but lacks description text according to the shared
 * `hasMeaningfulTagDescription` helper.
 *
 * Visited node types:
 *
 * - `ArrowFunctionExpression`
 * - `FunctionDeclaration`
 * - `FunctionExpression`
 * - `TSDeclareFunction`
 * - `TSEmptyBodyFunctionExpression`
 * - TypeScript method, call, and construct signatures
 */
export function createRequireFunctionTagDescriptionRule<
    TMessageId extends string,
>(
    config: RequireFunctionTagDescriptionRuleConfig<TMessageId>
): TSESLint.RuleModule<TMessageId, Options> & { name: string } {
    const { messageId, meta, name, tagNames } = config;

    return createTypedRule<Options, TMessageId>({
        create(context) {
            const checkedComments = new WeakSet<TSESTree.Comment>();
            const sourceCode = context.sourceCode;

            const checkNode = (
                reportNode: TSESTree.Node,
                docNode: TSESTree.Node
            ): void => {
                const docComment = getLeadingDocComment(sourceCode, docNode);

                if (docComment === null) {
                    return;
                }

                if (checkedComments.has(docComment)) {
                    return;
                }

                checkedComments.add(docComment);

                let hasTag = false;
                let hasMissingDescription = false;

                for (const block of getDocCommentTagBlocks(docComment)) {
                    if (!arrayIncludes(tagNames, block.tagName)) {
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

            const checkFunctionNode = (node: TSESTree.Node): void => {
                const { docNode, reportNode } =
                    getFunctionDocCommentTarget(node);

                checkNode(reportNode, docNode);
            };

            return {
                ArrowFunctionExpression: (node): void => {
                    checkFunctionNode(node);
                },
                FunctionDeclaration: (node): void => {
                    checkFunctionNode(node);
                },
                FunctionExpression: (node): void => {
                    checkFunctionNode(node);
                },
                TSCallSignatureDeclaration: (node): void => {
                    checkFunctionNode(node);
                },
                TSConstructSignatureDeclaration: (node): void => {
                    checkFunctionNode(node);
                },
                TSDeclareFunction: (node): void => {
                    checkFunctionNode(node);
                },
                TSEmptyBodyFunctionExpression: (node): void => {
                    checkFunctionNode(node);
                },
                TSMethodSignature: (node): void => {
                    checkFunctionNode(node);
                },
            };
        },
        meta,
        name,
    });
}
