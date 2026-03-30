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

type MessageIds = "missingReturnsDescription";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for requiring @returns tag descriptions. */
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

            let hasReturnsTag = false;
            let hasMissingDescription = false;

            for (const block of getDocCommentTagBlocks(docComment)) {
                if (block.tagName !== "returns" && block.tagName !== "return") {
                    continue;
                }

                hasReturnsTag = true;

                if (!hasMeaningfulTagDescription(block.blockText)) {
                    hasMissingDescription = true;
                }
            }

            if (!hasReturnsTag || !hasMissingDescription) {
                return;
            }

            context.report({
                messageId: "missingReturnsDescription",
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
                "require `@returns` tags to include human-readable descriptions.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
        },
        messages: {
            missingReturnsDescription:
                "`@returns` tags must include a description (not just a type annotation).",
        },
        schema: [],
        type: "problem",
    },
    name: "require-returns-description",
});

export default rule;
