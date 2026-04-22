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
    getDocCommentTypeParamTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import {
    getTypeParameterNames,
    type TypeParameterizedNode,
} from "../_internal/type-parameters.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "addTypeParamTagsSuggestion" | "missingTypeParamTags";
type Options = readonly [RequireCommentFileOptions?];

/** Rule implementation for missing type-parameter-tag coverage. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        if (
            shouldIgnoreRequireCommentFile(
                context.filename,
                arrayFirst(context.options)
            )
        ) {
            return {};
        }

        const sourceCode = context.sourceCode;
        const lineEnding = getPreferredLineEnding(sourceCode);

        const checkNode = (
            typeParameterizedNode: TypeParameterizedNode,
            docNode: TSESTree.Node,
            reportNode: TSESTree.Node
        ): void => {
            const typeParameterNames = getTypeParameterNames(
                typeParameterizedNode
            );

            if (isEmpty(typeParameterNames)) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const documentedTypeParameterNames =
                getDocCommentTypeParamTagNames(docComment);
            const missingTypeParameterNames: string[] = [];

            for (const typeParameterName of typeParameterNames) {
                if (!setHas(documentedTypeParameterNames, typeParameterName)) {
                    missingTypeParameterNames.push(typeParameterName);
                }
            }

            if (isEmpty(missingTypeParameterNames)) {
                return;
            }

            context.report({
                data: {
                    params: arrayJoin(missingTypeParameterNames, ", "),
                },
                messageId: "missingTypeParamTags",
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
                                    missingTypeParameterNames.map(
                                        (typeParameterName) =>
                                            `@typeParam ${typeParameterName}`
                                    ),
                                    lineEnding
                                )
                            );
                        },
                        messageId: "addTypeParamTagsSuggestion",
                    },
                ],
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
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require `@typeParam` tags for all declared generic type parameters.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-type-param-tags",
        },
        hasSuggestions: true,
        messages: {
            addTypeParamTagsSuggestion:
                "Insert missing `@typeParam` tags into this documentation block.",
            missingTypeParamTags:
                "Generic type parameters must be documented with @typeParam tags. Missing: {{params}}.",
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
    name: "require-type-param-tags",
});

export default rule;
