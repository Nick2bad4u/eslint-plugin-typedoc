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

import {
    buildDocCommentTagInsertion,
    getDocCommentAnchorNode,
    getDocCommentClosingLineStartIndex,
    getDocCommentTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type FunctionLikeNode =
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.TSDeclareFunction
    | TSESTree.TSEmptyBodyFunctionExpression;
type MessageIds = "missingReturnsTag";

type Options = readonly [];

const isVoidLikeTypeAnnotation = (
    typeAnnotation: null | Readonly<TSESTree.TypeNode> | undefined
): boolean => {
    if (typeAnnotation === null || typeAnnotation === undefined) {
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

    const firstTypeParameter = typeAnnotation.typeArguments?.params[0] ?? null;

    return (
        firstTypeParameter?.type === AST_NODE_TYPES.TSVoidKeyword ||
        firstTypeParameter?.type === AST_NODE_TYPES.TSUndefinedKeyword
    );
};

const requiresReturnsTag = (node: Readonly<FunctionLikeNode>): boolean => {
    if (node.returnType === null || node.returnType === undefined) {
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

            if (tagNames.has("returns") || tagNames.has("return")) {
                return;
            }

            context.report({
                fix: (fixer) => {
                    const insertionIndex = getDocCommentClosingLineStartIndex(
                        sourceCode,
                        docComment
                    );

                    return fixer.insertTextBeforeRange(
                        [insertionIndex, insertionIndex],
                        buildDocCommentTagInsertion(
                            docComment,
                            ["@returns TODO describe the return value."],
                            lineEnding
                        )
                    );
                },
                messageId: "missingReturnsTag",
                node: docNode,
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
        fixable: "code",
        messages: {
            missingReturnsTag:
                "Add an @returns tag so TypeDoc output includes explicit return-value documentation.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-returns-tag",
});

export default rule;
