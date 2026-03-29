/**
 * @packageDocumentation
 * Require documented function-like declarations to include `@param` tags.
 */

import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import {
    buildDocCommentTagInsertion,
    getDocCommentParamTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const defaultOptions = [] as const;

type Options = typeof defaultOptions;
type MessageIds = "missingParamTags";

const getParameterName = (
    parameter: TSESTree.Parameter,
    parameterIndex: number
): string => {
    switch (parameter.type) {
        case AST_NODE_TYPES.Identifier: {
            return parameter.name;
        }

        case AST_NODE_TYPES.AssignmentPattern: {
            if (parameter.left.type === AST_NODE_TYPES.Identifier) {
                return parameter.left.name;
            }

            return `param${parameterIndex + 1}`;
        }

        case AST_NODE_TYPES.RestElement: {
            if (parameter.argument.type === AST_NODE_TYPES.Identifier) {
                return `...${parameter.argument.name}`;
            }

            return `param${parameterIndex + 1}`;
        }

        default: {
            return `param${parameterIndex + 1}`;
        }
    }
};

const rule = createTypedRule<Options, MessageIds>({
    create: (context) => {
        const { sourceCode } = context;
        const lineEnding = getPreferredLineEnding(sourceCode);

        const checkFunctionLike = (
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node,
            params: readonly TSESTree.Parameter[]
        ): void => {
            if (params.length === 0) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const paramTagNames = getDocCommentParamTagNames(docComment);
            const missingParamNames = params
                .map((parameter, index) => getParameterName(parameter, index))
                .filter((paramName) => !paramTagNames.has(paramName));

            if (missingParamNames.length === 0) {
                return;
            }

            context.report({
                data: {
                    params: missingParamNames.join(", "),
                },
                fix: (fixer) =>
                    fixer.insertTextBeforeRange(
                        [docComment.range[1] - 2, docComment.range[1] - 2],
                        buildDocCommentTagInsertion(
                            docComment,
                            missingParamNames.map(
                                (paramName) =>
                                    `@param ${paramName} TODO describe ${paramName}.`
                            ),
                            lineEnding
                        )
                    ),
                messageId: "missingParamTags",
                node: reportNode,
            });
        };

        return {
            FunctionDeclaration: (node): void => {
                checkFunctionLike(node, node, node.params);
            },
            MethodDefinition: (node): void => {
                if (node.kind === "constructor") {
                    return;
                }

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
                checkFunctionLike(node, node, node.params);
            },
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "Require documented declarations to include @param tags for every parameter.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.strict", "typedoc.configs.all"],
        },
        fixable: "code",
        messages: {
            missingParamTags:
                "Add @param tags for missing parameters: {{params}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-param-tags",
});

export default rule;
