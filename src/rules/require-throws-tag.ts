import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst, setHas } from "ts-extras";

import {
    buildDocCommentTagInsertion,
    getDocCommentClosingLineStartIndex,
    getDocCommentTagNames,
    getFunctionDocCommentTarget,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type FunctionLikeBody =
    | null
    | TSESTree.BlockStatement
    | TSESTree.Expression;
type MessageIds = "addThrowsTagSuggestion" | "missingThrowsTag";

type Options = readonly [RequireCommentFileOptions?];

/** Collect statement children that execute within a control-flow statement. */
const getNestedStatements = (
    statement: Readonly<TSESTree.Statement>
): readonly TSESTree.Statement[] => {
    if (statement.type === AST_NODE_TYPES.BlockStatement) {
        return statement.body;
    }

    if (
        statement.type === AST_NODE_TYPES.DoWhileStatement ||
        statement.type === AST_NODE_TYPES.ForInStatement ||
        statement.type === AST_NODE_TYPES.ForOfStatement ||
        statement.type === AST_NODE_TYPES.ForStatement ||
        statement.type === AST_NODE_TYPES.LabeledStatement ||
        statement.type === AST_NODE_TYPES.WhileStatement ||
        statement.type === AST_NODE_TYPES.WithStatement
    ) {
        return [statement.body];
    }

    if (statement.type === AST_NODE_TYPES.IfStatement) {
        return statement.alternate === null
            ? [statement.consequent]
            : [statement.consequent, statement.alternate];
    }

    if (statement.type === AST_NODE_TYPES.SwitchStatement) {
        return statement.cases.flatMap((switchCase) => switchCase.consequent);
    }

    if (statement.type === AST_NODE_TYPES.TryStatement) {
        return [
            ...statement.block.body,
            ...(statement.handler?.body.body ?? []),
            ...(statement.finalizer?.body ?? []),
        ];
    }

    return [];
};

const functionBodyContainsThrow = (
    body: Readonly<FunctionLikeBody>
): boolean => {
    if (body?.type !== AST_NODE_TYPES.BlockStatement) {
        return false;
    }

    const statementStack = [...body.body];

    while (statementStack.length > 0) {
        const statement = statementStack.pop();

        if (statement !== undefined) {
            if (statement.type === AST_NODE_TYPES.ThrowStatement) {
                return true;
            }

            statementStack.push(...getNestedStatements(statement));
        }
    }

    return false;
};

/** Rule implementation for requiring throws-tag coverage when functions throw. */
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

        const checkFunctionLike = (
            functionNode: Readonly<{
                body: FunctionLikeBody;
            }>,
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node
        ): void => {
            if (!functionBodyContainsThrow(functionNode.body)) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const tagNames = getDocCommentTagNames(sourceCode, docComment);

            if (setHas(tagNames, "throws") || setHas(tagNames, "throw")) {
                return;
            }

            context.report({
                messageId: "missingThrowsTag",
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
                                    ["@throws"],
                                    lineEnding
                                )
                            );
                        },
                        messageId: "addThrowsTagSuggestion",
                    },
                ],
            });
        };

        const checkFunctionNode = (
            node: Readonly<
                | TSESTree.ArrowFunctionExpression
                | TSESTree.FunctionDeclaration
                | TSESTree.FunctionExpression
            >
        ): void => {
            const { docNode, reportNode } = getFunctionDocCommentTarget(node);

            checkFunctionLike(node, reportNode, docNode);
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkFunctionNode(node);
            },
            FunctionDeclaration: (node): void => {
                checkFunctionNode(node);
            },
            FunctionExpression: (node): void => {
                checkFunctionNode(node);
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require `@throws` tags when documented functions and methods contain throw statements.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-throws-tag",
        },
        hasSuggestions: true,
        languages: ["js/js"],
        messages: {
            addThrowsTagSuggestion: "Insert a bare `@throws` tag.",
            missingThrowsTag:
                "Functions that throw should document thrown errors with an `@throws` tag.",
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
    name: "require-throws-tag",
});

export default rule;
