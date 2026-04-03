import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getDocCommentParamTagNameList,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import { createLocaleSortedStringCopy } from "../_internal/sorted-copy.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "duplicateParamTags";
type Options = readonly [];

const getDuplicateNames = (names: readonly string[]): readonly string[] => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const name of names) {
        if (seen.has(name)) {
            duplicates.add(name);
            continue;
        }

        seen.add(name);
    }

    return createLocaleSortedStringCopy(duplicates);
};

/** Rule implementation for duplicate parameter-tag detection. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        const checkFunctionLike = (
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node
        ): void => {
            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const duplicateTagNames = getDuplicateNames(
                getDocCommentParamTagNameList(docComment)
            );

            if (duplicateTagNames.length === 0) {
                return;
            }

            context.report({
                data: {
                    params: duplicateTagNames.join(", "),
                },
                messageId: "duplicateParamTags",
                node: reportNode,
            });
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkFunctionLike(node, node);
            },
            FunctionDeclaration: (node): void => {
                checkFunctionLike(node, getDocCommentAnchorNode(node));
            },
            FunctionExpression: (node): void => {
                checkFunctionLike(node, node);
            },
            MethodDefinition: (node): void => {
                if (
                    node.value.type !== AST_NODE_TYPES.FunctionExpression &&
                    node.value.type !==
                        AST_NODE_TYPES.TSEmptyBodyFunctionExpression
                ) {
                    return;
                }

                checkFunctionLike(node, node);
            },
            TSDeclareFunction: (node): void => {
                checkFunctionLike(node, getDocCommentAnchorNode(node));
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "disallow duplicate `@param` tags for the same parameter name.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-duplicate-param-tags",
        },
        messages: {
            duplicateParamTags:
                "Duplicate `@param` tags found for: {{params}}. Keep one tag per parameter.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-duplicate-param-tags",
});

export default rule;
