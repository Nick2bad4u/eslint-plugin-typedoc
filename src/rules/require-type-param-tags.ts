import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    buildDocCommentTagInsertion,
    getDocCommentAnchorNode,
    getDocCommentClosingLineStartIndex,
    getDocCommentTypeParamTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import {
    getTypeParameterNames,
    type TypeParameterizedNode,
} from "../_internal/type-parameters.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingTypeParamTags";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
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

            if (typeParameterNames.length === 0) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const documentedTypeParameterNames =
                getDocCommentTypeParamTagNames(docComment);
            const missingTypeParameterNames = typeParameterNames.filter(
                (typeParameterName) =>
                    !documentedTypeParameterNames.has(typeParameterName)
            );

            if (missingTypeParameterNames.length === 0) {
                return;
            }

            context.report({
                data: {
                    params: missingTypeParameterNames.join(", "),
                },
                fix: (fixer) => {
                    const insertionIndex = getDocCommentClosingLineStartIndex(
                        sourceCode,
                        docComment
                    );

                    return fixer.insertTextBeforeRange(
                        [insertionIndex, insertionIndex],
                        buildDocCommentTagInsertion(
                            docComment,
                            missingTypeParameterNames.map(
                                (typeParameterName) =>
                                    `@typeParam ${typeParameterName} TODO describe ${typeParameterName}.`
                            ),
                            lineEnding
                        )
                    );
                },
                messageId: "missingTypeParamTags",
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
        docs: {
            description:
                "require `@typeParam` tags for all declared generic type parameters.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
        },
        fixable: "code",
        messages: {
            missingTypeParamTags:
                "Generic type parameters must be documented with @typeParam tags. Missing: {{params}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-type-param-tags",
});

export default rule;
