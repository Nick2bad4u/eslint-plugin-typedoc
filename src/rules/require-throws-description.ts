import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import {
    getDocCommentTagBlocks,
    hasMeaningfulTagDescription,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingThrowsDescription";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for requiring throws-tag descriptions. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
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

            let hasThrowsTag = false;
            let hasMissingDescription = false;

            for (const block of getDocCommentTagBlocks(docComment)) {
                if (block.tagName !== "throws" && block.tagName !== "throw") {
                    continue;
                }

                hasThrowsTag = true;

                if (!hasMeaningfulTagDescription(block.blockText)) {
                    hasMissingDescription = true;
                }
            }

            if (!hasThrowsTag || !hasMissingDescription) {
                return;
            }

            context.report({
                messageId: "missingThrowsDescription",
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
    meta: {
        docs: {
            description:
                "require `@throws` tags to include human-readable descriptions.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
        },
        messages: {
            missingThrowsDescription:
                "`@throws` tags must include a description (not just an error type).",
        },
        schema: [],
        type: "problem",
    },
    name: "require-throws-description",
});

export default rule;
