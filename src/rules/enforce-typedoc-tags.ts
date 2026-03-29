/**
 * @packageDocumentation
 * Enforce required TypeDoc tags on exported function documentation blocks.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import { getLineBreak } from "../_internal/text-utils.js";

type MessageIds = "missingTags";
type Options = [
    Readonly<{
        requireReturnsTag?: boolean;
    }>,
];

type FunctionLikeNode =
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression;

const defaultOptions = [
    {
        requireReturnsTag: true,
    },
] satisfies Options;

const isDocComment = (comment: TSESTree.Comment): boolean =>
    comment.type === "Block" && comment.value.startsWith("*");

const getLeadingDocComment = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: Readonly<TSESTree.Node>
): TSESTree.Comment | undefined => {
    const comments = sourceCode.getCommentsBefore(node);

    for (let index = comments.length - 1; index >= 0; index -= 1) {
        const comment = comments[index];

        if (comment === undefined) {
            continue;
        }

        if (isDocComment(comment)) {
            return comment;
        }
    }

    return undefined;
};

const getSimpleParameterName = (
    parameter:
        | TSESTree.AssignmentPattern
        | TSESTree.Identifier
        | TSESTree.Parameter
        | TSESTree.RestElement
): string | undefined => {
    if (parameter.type === "Identifier") {
        return parameter.name;
    }

    if (
        parameter.type === "AssignmentPattern" &&
        parameter.left.type === "Identifier"
    ) {
        return parameter.left.name;
    }

    if (
        parameter.type === "RestElement" &&
        parameter.argument.type === "Identifier"
    ) {
        return parameter.argument.name;
    }

    return undefined;
};

const normalizeParamTagName = (value: string): string =>
    value.replace(/^\[/u, "").replace(/\]$/u, "").replace(/=.*/u, "");

const hasNonVoidReturnType = (
    functionNode: Readonly<FunctionLikeNode>
): boolean => {
    if (functionNode.returnType === undefined) {
        return false;
    }

    return functionNode.returnType.typeAnnotation.type !== "TSVoidKeyword";
};

const getFunctionLikeNode = (
    exportNode: Readonly<
        TSESTree.ExportDefaultDeclaration | TSESTree.ExportNamedDeclaration
    >
): FunctionLikeNode | undefined => {
    const declaration = exportNode.declaration;

    if (declaration === null) {
        return undefined;
    }

    if (declaration.type === "FunctionDeclaration") {
        return declaration;
    }

    if (declaration.type !== "VariableDeclaration") {
        return undefined;
    }

    if (declaration.declarations.length !== 1) {
        return undefined;
    }

    const variableDeclarator = declaration.declarations[0];

    if (variableDeclarator === undefined) {
        return undefined;
    }

    const initializer = variableDeclarator.init;

    if (
        initializer?.type === "ArrowFunctionExpression" ||
        initializer?.type === "FunctionExpression"
    ) {
        return initializer;
    }

    return undefined;
};

const getMissingTags = (
    functionNode: Readonly<FunctionLikeNode>,
    commentText: string,
    requireReturnsTag: boolean
): string[] => {
    const missingTags: string[] = [];

    const documentedParameterNames = new Set<string>();
    const parameterTagPattern =
        /@param\s+(?:\{[^}]+\}\s+)?(\[[^\]\s]+[^\]]*\]|[A-Za-z_$][\w$]*)/gu;

    for (const match of commentText.matchAll(parameterTagPattern)) {
        const rawParameterName = match[1];

        if (typeof rawParameterName !== "string") {
            continue;
        }

        documentedParameterNames.add(normalizeParamTagName(rawParameterName));
    }

    const requiredParameterNames = functionNode.params
        .map((parameter) => getSimpleParameterName(parameter))
        .filter(
            (parameterName): parameterName is string =>
                typeof parameterName === "string"
        );

    for (const parameterName of requiredParameterNames) {
        if (documentedParameterNames.has(parameterName)) {
            continue;
        }

        missingTags.push(`@param ${parameterName}`);
    }

    const hasReturnTag = /@returns?\b/iu.test(commentText);

    if (
        requireReturnsTag &&
        hasNonVoidReturnType(functionNode) &&
        !hasReturnTag
    ) {
        missingTags.push("@returns");
    }

    return missingTags;
};

const buildTagInsertionEdit = (
    commentText: string,
    commentRangeEnd: number,
    missingTags: readonly string[]
): Readonly<{
    range: readonly [number, number];
    text: string;
}> => {
    const lineBreak = getLineBreak(commentText);
    const missingTagLines = missingTags.map((tagName) => ` * ${tagName}`);
    const commentBody = commentText.slice(0, commentText.lastIndexOf("*/"));
    const closingLinePadding = /\r?\n[ \t]*$/u.exec(commentBody);
    const trailingInlinePadding = /[ \t]+$/u.exec(commentBody);
    const removeLength =
        closingLinePadding?.[0].length ??
        trailingInlinePadding?.[0].length ??
        0;

    return {
        range: [
            commentRangeEnd - 2 - removeLength,
            commentRangeEnd - 2,
        ] as const,
        text: `${lineBreak}${missingTagLines.join(lineBreak)}${lineBreak} `,
    };
};

const enforceTypedocTagsRule: TSESLint.RuleModule<MessageIds, Options> = {
    create(context) {
        const [options = defaultOptions[0]] = context.options;
        const sourceCode = context.sourceCode;
        const requireReturnsTag = options.requireReturnsTag ?? true;

        const inspectExportDeclaration = (
            exportNode: Readonly<
                | TSESTree.ExportDefaultDeclaration
                | TSESTree.ExportNamedDeclaration
            >
        ): void => {
            const functionNode = getFunctionLikeNode(exportNode);

            if (functionNode === undefined) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, exportNode);

            if (docComment === undefined) {
                return;
            }

            const missingTags = getMissingTags(
                functionNode,
                docComment.value,
                requireReturnsTag
            );

            if (missingTags.length === 0) {
                return;
            }

            context.report({
                data: {
                    tags: missingTags.join(", "),
                },
                fix: (fixer) => {
                    const insertionEdit = buildTagInsertionEdit(
                        sourceCode.getText(docComment),
                        docComment.range[1],
                        missingTags
                    );

                    return fixer.replaceTextRange(
                        insertionEdit.range,
                        insertionEdit.text
                    );
                },
                messageId: "missingTags",
                node: docComment,
            });
        };

        return {
            ExportDefaultDeclaration: inspectExportDeclaration,
            ExportNamedDeclaration: inspectExportDeclaration,
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "Ensure exported function TypeDoc blocks include required @param and @returns tags.",
            url: createRuleDocsUrl("enforce-typedoc-tags"),
        },
        fixable: "code",
        messages: {
            missingTags:
                "TypeDoc comment is missing required tag(s): {{tags}}. Add the missing tags so TypeDoc can generate complete API docs.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    requireReturnsTag: {
                        type: "boolean",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
};

export default enforceTypedocTagsRule;
