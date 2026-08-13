import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayJoin, isEmpty, setHas } from "ts-extras";

import {
    getDocCommentAnchorNode,
    getDocCommentTypeParamTagNameList,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import { createLocaleSortedStringCopy } from "../_internal/sorted-copy.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "duplicateTypeParamTags";
type Options = readonly [];

const getDuplicateNames = (names: readonly string[]): readonly string[] => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const name of names) {
        if (setHas(seen, name)) {
            duplicates.add(name);
            continue;
        }

        seen.add(name);
    }

    return createLocaleSortedStringCopy(duplicates);
};

/** Rule implementation for duplicate generic-tag detection. */
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

            const duplicateTagNames = getDuplicateNames(
                getDocCommentTypeParamTagNameList(docComment)
            );

            if (isEmpty(duplicateTagNames)) {
                return;
            }

            context.report({
                data: {
                    params: arrayJoin(duplicateTagNames, ", "),
                },
                messageId: "duplicateTypeParamTags",
                node: reportNode,
            });
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkNode(node, node);
            },
            ClassDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            FunctionDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            FunctionExpression: (node): void => {
                checkNode(node, node);
            },
            MethodDefinition: (node): void => {
                if (node.value.type !== AST_NODE_TYPES.FunctionExpression) {
                    return;
                }

                checkNode(node, node);
            },
            TSDeclareFunction: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            TSInterfaceDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            TSTypeAliasDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "disallow duplicate `@typeParam`/`@template` tags for the same type-parameter name.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-duplicate-type-param-tags",
        },
        languages: ["js/js"],
        messages: {
            duplicateTypeParamTags:
                "Duplicate generic tags found for: {{params}}. Keep one tag per type parameter.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-duplicate-type-param-tags",
});

export default rule;
