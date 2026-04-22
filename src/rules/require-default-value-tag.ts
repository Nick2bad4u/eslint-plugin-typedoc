import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { setHas } from "ts-extras";

import {
    buildDocCommentTagInsertion,
    getDocCommentAnchorNode,
    getDocCommentClosingLineStartIndex,
    getDocCommentTagNames,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingDefaultValueTag";
type Options = readonly [];

const isSimpleDefaultValueExpression = (
    expression: Readonly<TSESTree.Expression>
): boolean => {
    if (
        expression.type === AST_NODE_TYPES.ArrayExpression ||
        expression.type === AST_NODE_TYPES.Literal ||
        expression.type === AST_NODE_TYPES.ObjectExpression
    ) {
        return true;
    }

    if (expression.type === AST_NODE_TYPES.TemplateLiteral) {
        return expression.expressions.length === 0;
    }

    return false;
};

/**
 * Rule implementation for requiring default-value tags on documented exported
 * consts.
 */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;
        const lineEnding = getPreferredLineEnding(sourceCode);

        return {
            ExportNamedDeclaration(node): void {
                const declaration = node.declaration;

                if (
                    declaration?.type !== AST_NODE_TYPES.VariableDeclaration ||
                    declaration.kind !== "const" ||
                    declaration.declarations.length !== 1
                ) {
                    return;
                }

                const [declarator] = declaration.declarations;

                if (
                    declarator?.id.type !== AST_NODE_TYPES.Identifier ||
                    declarator.init === null ||
                    declarator.init.type ===
                        AST_NODE_TYPES.ArrowFunctionExpression ||
                    declarator.init.type ===
                        AST_NODE_TYPES.FunctionExpression ||
                    !isSimpleDefaultValueExpression(declarator.init)
                ) {
                    return;
                }

                const docAnchorNode = getDocCommentAnchorNode(declaration);
                const docComment = getLeadingDocComment(
                    sourceCode,
                    docAnchorNode
                );

                if (docComment === null) {
                    return;
                }

                const tagNames = getDocCommentTagNames(sourceCode, docComment);

                if (
                    setHas(tagNames, "default") ||
                    setHas(tagNames, "defaultValue")
                ) {
                    return;
                }

                const initializerText = sourceCode.getText(declarator.init);

                if (
                    initializerText.includes("\n") ||
                    initializerText.includes("\r")
                ) {
                    return;
                }

                context.report({
                    data: {
                        declarationName: declarator.id.name,
                    },
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
                                [`@defaultValue \`${initializerText}\``],
                                lineEnding
                            )
                        );
                    },
                    messageId: "missingDefaultValueTag",
                    node: declarator.id,
                });
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require documented exported const values to include `@defaultValue` tags when they declare simple defaults.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-default-value-tag",
        },
        fixable: "code",
        messages: {
            missingDefaultValueTag:
                "Documented exported constant '{{declarationName}}' should include an `@defaultValue` tag.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "require-default-value-tag",
});

export default rule;
