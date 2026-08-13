/**
 * @packageDocumentation
 * Require documented declarations with non-void return types to include
 * `@returns` tags.
 */

import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst, isPresent, setHas } from "ts-extras";

import {
    buildDocCommentTagInsertion,
    getDocCommentAnchorNode,
    getDocCommentClosingLineStartIndex,
    getDocCommentTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type FunctionLikeNode =
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.TSDeclareFunction
    | TSESTree.TSEmptyBodyFunctionExpression;
type MessageIds = "addReturnsTagSuggestion" | "missingReturnsTag";

type Options = readonly [RequireCommentFileOptions?];

const isVoidLikeTypeAnnotation = (
    typeAnnotation:
        | null
        | Readonly<TSESTree.TypeNode>
        | undefined
): boolean => {
    if (!isPresent(typeAnnotation)) {
        return false;
    }

    if (
        typeAnnotation.type === AST_NODE_TYPES.TSNeverKeyword ||
        typeAnnotation.type === AST_NODE_TYPES.TSVoidKeyword
    ) {
        return true;
    }

    if (typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
        return false;
    }

    if (
        typeAnnotation.typeName.type !== AST_NODE_TYPES.Identifier ||
        typeAnnotation.typeName.name !== "Promise"
    ) {
        return false;
    }

    const [firstTypeParameter] = typeAnnotation.typeArguments?.params ?? [];

    return (
        firstTypeParameter?.type === AST_NODE_TYPES.TSVoidKeyword ||
        firstTypeParameter?.type === AST_NODE_TYPES.TSUndefinedKeyword
    );
};

const requiresReturnsTag = (node: Readonly<FunctionLikeNode>): boolean => {
    if (!isPresent(node.returnType)) {
        return false;
    }

    return !isVoidLikeTypeAnnotation(node.returnType.typeAnnotation);
};

/** Rule implementation for missing returns-tag coverage. */
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
            node: Readonly<FunctionLikeNode>,
            docNode: Readonly<TSESTree.Node>
        ): void => {
            if (!requiresReturnsTag(node)) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const tagNames = getDocCommentTagNames(sourceCode, docComment);

            if (setHas(tagNames, "returns") || setHas(tagNames, "return")) {
                return;
            }

            context.report({
                messageId: "missingReturnsTag",
                node: docNode,
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
                                    ["@returns"],
                                    lineEnding
                                )
                            );
                        },
                        messageId: "addReturnsTagSuggestion",
                    },
                ],
            });
        };

        return {
            FunctionDeclaration: (node): void => {
                checkFunctionLike(node, getDocCommentAnchorNode(node));
            },
            MethodDefinition: (node): void => {
                if (node.kind === "constructor") {
                    return;
                }

                checkFunctionLike(node.value, node);
            },
            TSDeclareFunction: (node): void => {
                checkFunctionLike(node, getDocCommentAnchorNode(node));
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require @returns tags for documented declarations with non-void return types.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.strict", "typedoc.configs.all"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-returns-tag",
        },
        hasSuggestions: true,
        languages: ["js/js"],
        messages: {
            addReturnsTagSuggestion: "Insert a bare `@returns` tag.",
            missingReturnsTag:
                "Add an @returns tag so TypeDoc output includes explicit return-value documentation.",
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
    name: "require-returns-tag",
});

export default rule;
