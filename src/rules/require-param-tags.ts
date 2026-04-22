/**
 * @packageDocumentation
 * Require documented function-like declarations to include `@param` tags.
 */

import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst, arrayJoin, isEmpty, setHas } from "ts-extras";

import {
    buildDocCommentTagInsertion,
    getDocCommentAnchorNode,
    getDocCommentClosingLineStartIndex,
    getDocCommentParamTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "addParamTagsSuggestion" | "missingParamTags";
type Options = readonly [RequireCommentFileOptions?];

const getParameterName = (
    parameter: Readonly<TSESTree.Parameter>,
    parameterIndex: number
): string => {
    if (parameter.type === AST_NODE_TYPES.AssignmentPattern) {
        return parameter.left.type === AST_NODE_TYPES.Identifier
            ? parameter.left.name
            : `param${parameterIndex + 1}`;
    }

    if (parameter.type === AST_NODE_TYPES.Identifier) {
        return parameter.name;
    }

    if (parameter.type === AST_NODE_TYPES.RestElement) {
        return parameter.argument.type === AST_NODE_TYPES.Identifier
            ? `...${parameter.argument.name}`
            : `param${parameterIndex + 1}`;
    }

    return `param${parameterIndex + 1}`;
};

/** Rule implementation for missing parameter-tag coverage. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create: (context) => {
        if (
            shouldIgnoreRequireCommentFile(
                context.filename,
                arrayFirst(context.options)
            )
        ) {
            return {};
        }

        const { sourceCode } = context;
        const lineEnding = getPreferredLineEnding(sourceCode);

        const checkFunctionLike = (
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node,
            params: readonly Readonly<TSESTree.Parameter>[]
        ): void => {
            if (params.length === 0) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const paramTagNames = getDocCommentParamTagNames(docComment);
            const missingParamNames: string[] = [];

            for (const [index, parameter] of params.entries()) {
                const paramName = getParameterName(parameter, index);

                if (!setHas(paramTagNames, paramName)) {
                    missingParamNames.push(paramName);
                }
            }

            if (isEmpty(missingParamNames)) {
                return;
            }

            context.report({
                data: {
                    params: arrayJoin(missingParamNames, ", "),
                },
                messageId: "missingParamTags",
                node: reportNode,
                suggest: [
                    {
                        fix: (fixer) => {
                            const insertionIndex =
                                getDocCommentClosingLineStartIndex(
                                    sourceCode,
                                    docComment
                                );

                            return fixer.insertTextBeforeRange(
                                [insertionIndex, insertionIndex],
                                buildDocCommentTagInsertion(
                                    docComment,
                                    missingParamNames.map(
                                        (paramName) => `@param ${paramName}`
                                    ),
                                    lineEnding
                                )
                            );
                        },
                        messageId: "addParamTagsSuggestion",
                    },
                ],
            });
        };

        return {
            FunctionDeclaration: (node): void => {
                checkFunctionLike(
                    node,
                    getDocCommentAnchorNode(node),
                    node.params
                );
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
                checkFunctionLike(
                    node,
                    getDocCommentAnchorNode(node),
                    node.params
                );
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require documented declarations to include @param tags for every parameter.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.strict", "typedoc.configs.all"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-param-tags",
        },
        hasSuggestions: true,
        messages: {
            addParamTagsSuggestion:
                "Insert missing `@param` tags into this documentation block.",
            missingParamTags:
                "Add @param tags for missing parameters: {{params}}.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    ...requireCommentFileOptionsSchemaProperties,
                },
                type: "object",
            },
        ],
        type: "problem",
    },
    name: "require-param-tags",
});

export default rule;
