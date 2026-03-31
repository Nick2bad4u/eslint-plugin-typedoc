import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getDocCommentTypeParamTagNames,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import {
    getTypeParameterNames,
    type TypeParameterizedNode,
} from "../_internal/type-parameters.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "extraTypeParamTags";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for stale `@typeParam`/`@template` tags. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        const checkNode = (
            typeParameterizedNode: TypeParameterizedNode,
            docNode: TSESTree.Node,
            reportNode: TSESTree.Node
        ): void => {
            const typeParameterNames = getTypeParameterNames(
                typeParameterizedNode
            );

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const typeParameterNameSet = new Set(typeParameterNames);
            const documentedTypeParameterNames =
                getDocCommentTypeParamTagNames(docComment);
            const extraTagNames = [...documentedTypeParameterNames].filter(
                (name) => !typeParameterNameSet.has(name)
            );

            if (extraTagNames.length === 0) {
                return;
            }

            context.report({
                data: {
                    params: extraTagNames.join(", "),
                },
                messageId: "extraTypeParamTags",
                node: reportNode,
            });
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkNode(node, node, node);
            },
            ClassDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node), node);
            },
            FunctionDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node), node);
            },
            FunctionExpression: (node): void => {
                checkNode(node, node, node);
            },
            MethodDefinition: (node): void => {
                if (
                    node.value.type !== AST_NODE_TYPES.FunctionExpression &&
                    node.value.type !==
                        AST_NODE_TYPES.TSEmptyBodyFunctionExpression
                ) {
                    return;
                }

                checkNode(node.value, node, node);
            },
            TSDeclareFunction: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node), node);
            },
            TSInterfaceDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node), node);
            },
            TSTypeAliasDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node), node);
            },
        };
    },
    defaultOptions,
    meta: {
        deprecated: false,
        docs: {
            description:
                "disallow stale `@typeParam`/`@template` tags that do not match real generic type parameters.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-extra-type-param-tags",
        },
        messages: {
            extraTypeParamTags:
                "Type-parameter tags must match real generic type parameters. Remove stale tags: {{params}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-extra-type-param-tags",
});

export default rule;
