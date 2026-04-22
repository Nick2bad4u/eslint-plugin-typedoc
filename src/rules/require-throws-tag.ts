import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst, setHas } from "ts-extras";

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

type FunctionLikeBody = null | TSESTree.BlockStatement | TSESTree.Expression;
type MessageIds = "addThrowsTagSuggestion" | "missingThrowsTag";

type Options = readonly [RequireCommentFileOptions?];

const functionBodyContainsThrow = (
    body: Readonly<FunctionLikeBody>
): boolean => {
    if (body?.type !== AST_NODE_TYPES.BlockStatement) {
        return false;
    }

    const statementStack = [...body.body];

    while (statementStack.length > 0) {
        const statement = statementStack.pop();

        if (statement === undefined) {
            continue;
        }

        if (statement.type === AST_NODE_TYPES.ThrowStatement) {
            return true;
        }

        if (statement.type === AST_NODE_TYPES.BlockStatement) {
            statementStack.push(...statement.body);
            continue;
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
            statementStack.push(statement.body);
            continue;
        }

        if (statement.type === AST_NODE_TYPES.IfStatement) {
            statementStack.push(statement.consequent);

            if (statement.alternate !== null) {
                statementStack.push(statement.alternate);
            }

            continue;
        }

        if (statement.type === AST_NODE_TYPES.SwitchStatement) {
            for (const switchCase of statement.cases) {
                statementStack.push(...switchCase.consequent);
            }

            continue;
        }

        if (statement.type === AST_NODE_TYPES.TryStatement) {
            statementStack.push(...statement.block.body);

            if (statement.handler !== null) {
                statementStack.push(...statement.handler.body.body);
            }

            if (statement.finalizer !== null) {
                statementStack.push(...statement.finalizer.body);
            }
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

        return {
            ArrowFunctionExpression: (node): void => {
                checkFunctionLike(node, node, node);
            },
            FunctionDeclaration: (node): void => {
                checkFunctionLike(node, node, getDocCommentAnchorNode(node));
            },
            FunctionExpression: (node): void => {
                checkFunctionLike(node, node, node);
            },
            MethodDefinition: (node): void => {
                if (
                    node.value.type !== AST_NODE_TYPES.FunctionExpression &&
                    node.value.type !==
                        AST_NODE_TYPES.TSEmptyBodyFunctionExpression
                ) {
                    return;
                }

                checkFunctionLike(node.value, node, node);
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
