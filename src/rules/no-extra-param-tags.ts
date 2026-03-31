import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getDocCommentParamTagNames,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "extraParamTags";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

const getParameterNameFromNode = (
    node: Readonly<TSESTree.Parameter>
): null | string => {
    if (node.type === AST_NODE_TYPES.Identifier) {
        return node.name;
    }

    if (node.type === AST_NODE_TYPES.RestElement) {
        return node.argument.type === AST_NODE_TYPES.Identifier
            ? `...${node.argument.name}`
            : null;
    }

    if (node.type === AST_NODE_TYPES.AssignmentPattern) {
        return node.left.type === AST_NODE_TYPES.Identifier
            ? node.left.name
            : null;
    }

    return null;
};

/** Rule implementation for detecting stale parameter-tag entries. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        const checkFunctionLike = (
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node,
            params: readonly Readonly<TSESTree.Parameter>[]
        ): void => {
            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const parameterNames = params.map((parameter) =>
                getParameterNameFromNode(parameter)
            );

            const resolvedParameterNames: string[] = [];

            for (const parameterName of parameterNames) {
                if (parameterName !== null) {
                    resolvedParameterNames.push(parameterName);
                }
            }

            if (resolvedParameterNames.length !== params.length) {
                return;
            }

            const parameterNameSet = new Set(resolvedParameterNames);
            const documentedParamTagNames =
                getDocCommentParamTagNames(docComment);
            const extraTagNames = [...documentedParamTagNames].filter(
                (name) => !parameterNameSet.has(name)
            );

            if (extraTagNames.length === 0) {
                return;
            }

            context.report({
                data: {
                    params: extraTagNames.join(", "),
                },
                messageId: "extraParamTags",
                node: reportNode,
            });
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkFunctionLike(node, node, node.params);
            },
            FunctionDeclaration: (node): void => {
                checkFunctionLike(
                    node,
                    getDocCommentAnchorNode(node),
                    node.params
                );
            },
            FunctionExpression: (node): void => {
                checkFunctionLike(node, node, node.params);
            },
            MethodDefinition: (node): void => {
                if (
                    node.value.type !== AST_NODE_TYPES.FunctionExpression &&
                    node.value.type !==
                        AST_NODE_TYPES.TSEmptyBodyFunctionExpression
                ) {
                    return;
                }

                checkFunctionLike(node, node, node.value.params);
            },
            TSDeclareFunction: (node): void => {
                checkFunctionLike(
                    node,
                    getDocCommentAnchorNode(node),
                    node.params
                );
            },
        };
    },
    defaultOptions,
    meta: {
        deprecated: false,
        docs: {
            description:
                "disallow `@param` tags that do not map to real function parameters.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-extra-param-tags",
        },
        messages: {
            extraParamTags:
                "`@param` tags must match real function parameters. Remove stale tags: {{params}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-extra-param-tags",
});

export default rule;
