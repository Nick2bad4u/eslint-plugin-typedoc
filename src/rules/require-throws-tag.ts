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

type FunctionLikeBody = null | TSESTree.BlockStatement | TSESTree.Expression;
type MessageIds = "missingThrowsTag";

type Options = readonly [];

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

            if (tagNames.has("throws") || tagNames.has("throw")) {
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
                            ["@throws TODO describe thrown errors."],
                            lineEnding
                        )
                    );
                },
                messageId: "missingThrowsTag",
                node: reportNode,
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
        fixable: "code",
        messages: {
            missingThrowsTag:
                "Functions that throw should document thrown errors with an `@throws` tag.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-throws-tag",
});

export default rule;
